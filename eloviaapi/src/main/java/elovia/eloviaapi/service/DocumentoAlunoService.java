package elovia.eloviaapi.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.Duration;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import elovia.eloviaapi.dto.DocumentoLinkResponse;
import elovia.eloviaapi.dto.DocumentoAlunoResponse;
import elovia.eloviaapi.exception.BusinessException;
import elovia.eloviaapi.exception.NotFoundException;
import elovia.eloviaapi.model.Aluno;
import elovia.eloviaapi.model.CategoriaDocumento;
import elovia.eloviaapi.model.DocumentoAluno;
import elovia.eloviaapi.model.Role;
import elovia.eloviaapi.model.Usuario;
import elovia.eloviaapi.repository.AlunoRepository;
import elovia.eloviaapi.repository.DocumentoAlunoRepository;

@Service
public class DocumentoAlunoService {

	private static final Set<String> EXTENSOES_ACEITAS = Set.of("pdf", "doc", "docx", "png", "jpg", "jpeg");
	private static final Duration LINK_DOWNLOAD_VALIDADE = Duration.ofMinutes(10);

	private final DocumentoAlunoRepository documentoRepository;
	private final AlunoRepository alunoRepository;
	private final CurrentUserService currentUserService;
	private final SupabaseStorageService storageService;

	public DocumentoAlunoService(
			DocumentoAlunoRepository documentoRepository,
			AlunoRepository alunoRepository,
			CurrentUserService currentUserService,
			SupabaseStorageService storageService) {
		this.documentoRepository = documentoRepository;
		this.alunoRepository = alunoRepository;
		this.currentUserService = currentUserService;
		this.storageService = storageService;
	}

	@Transactional(readOnly = true)
	public List<DocumentoAlunoResponse> listarPorAluno(UUID alunoId) {
		var aluno = findAlunoAutorizado(alunoId);
		return documentoRepository.findByAlunoIdOrderByDataUploadDesc(aluno.getId()).stream()
				.map(DocumentoAlunoResponse::from)
				.toList();
	}

	@Transactional(readOnly = true)
	public DocumentoAlunoResponse buscarPorId(UUID id) {
		return DocumentoAlunoResponse.from(findDocumentoAutorizado(id));
	}

	@Transactional
	public DocumentoAlunoResponse criar(
			UUID alunoId,
			String titulo,
			String descricao,
			CategoriaDocumento categoria,
			LocalDate dataDocumento,
			MultipartFile arquivo) {
		var aluno = findAlunoAutorizado(alunoId);
		var usuario = currentUserService.getCurrentUser();
		var documento = new DocumentoAluno();
		preencherMetadados(documento, titulo, descricao, categoria, dataDocumento);
		if (arquivo != null && !arquivo.isEmpty()) {
			preencherArquivo(documento, aluno.getId(), arquivo);
		}
		documento.setAluno(aluno);
		documento.setUsuarioUpload(usuario);

		return DocumentoAlunoResponse.from(documentoRepository.save(documento));
	}

	@Transactional
	public DocumentoAlunoResponse atualizar(
			UUID id,
			String titulo,
			String descricao,
			CategoriaDocumento categoria,
			LocalDate dataDocumento,
			MultipartFile arquivo) {
		var documento = findDocumentoAutorizado(id);
		preencherMetadados(documento, titulo, descricao, categoria, dataDocumento);
		if (arquivo != null && !arquivo.isEmpty()) {
			preencherArquivo(documento, documento.getAluno().getId(), arquivo);
		}
		documento.setUsuarioUltimaEdicao(currentUserService.getCurrentUser());
		documento.setDataUltimaEdicao(Instant.now());
		return DocumentoAlunoResponse.from(documento);
	}

	@Transactional
	public void desativar(UUID id) {
		var documento = findDocumentoAutorizado(id);
		documento.setAtivo(false);
		documento.setUsuarioUltimaEdicao(currentUserService.getCurrentUser());
		documento.setDataUltimaEdicao(Instant.now());
	}

	@Transactional(readOnly = true)
	public String obterUrlDownload(UUID id) {
		return gerarLinkSeguro(findDocumentoAutorizado(id)).urlArquivo();
	}

	@Transactional(readOnly = true)
	public DocumentoLinkResponse obterLinkSeguro(UUID id) {
		return gerarLinkSeguro(findDocumentoAutorizado(id));
	}

	private DocumentoLinkResponse gerarLinkSeguro(DocumentoAluno documento) {
		var caminho = documento.getCaminhoArquivo();
		if ((caminho == null || caminho.isBlank()) && (documento.getUrlArquivo() == null || documento.getUrlArquivo().isBlank())) {
			throw new BusinessException("Este registro nao possui arquivo anexado");
		}
		if (caminho == null || caminho.isBlank()) {
			caminho = storageService.storagePathFromPublicUrl(documento.getUrlArquivo());
		}
		var expiraEm = Instant.now().plus(LINK_DOWNLOAD_VALIDADE);
		return new DocumentoLinkResponse(storageService.signedUrl(caminho, LINK_DOWNLOAD_VALIDADE), expiraEm);
	}

	private DocumentoAluno findDocumentoAutorizado(UUID id) {
		var documento = documentoRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Documento não encontrado"));
		validarAcesso(documento.getAluno());
		return documento;
	}

	private Aluno findAlunoAutorizado(UUID alunoId) {
		var aluno = alunoRepository.findById(alunoId)
				.orElseThrow(() -> new NotFoundException("Aluno não encontrado"));
		validarAcesso(aluno);
		return aluno;
	}

	private void validarAcesso(Aluno aluno) {
		var usuario = currentUserService.getCurrentUser();
		if (usuario.getRole() == Role.ADMIN) {
			if (aluno.getAdministrador() != null && aluno.getAdministrador().getId().equals(usuario.getId())) {
				return;
			}
			throw new NotFoundException("Aluno não encontrado");
		}

		var vinculado = aluno.isAtivo() && aluno.getMediadores().stream()
				.anyMatch(mediador -> mediador.getId().equals(usuario.getId()));
		if (!vinculado) {
			throw new NotFoundException("Aluno não encontrado");
		}
	}

	private void preencherMetadados(
			DocumentoAluno documento,
			String titulo,
			String descricao,
			CategoriaDocumento categoria,
			LocalDate dataDocumento) {
		if (titulo == null || titulo.isBlank()) {
			throw new BusinessException("Informe o titulo do documento");
		}
		if (categoria == null) {
			throw new BusinessException("Informe a categoria do documento");
		}
		documento.setTitulo(titulo.trim());
		documento.setDescricao(descricao);
		documento.setCategoria(categoria);
		documento.setDataDocumento(dataDocumento);
	}

	private void preencherArquivo(DocumentoAluno documento, UUID alunoId, MultipartFile arquivo) {
		var nomeOriginal = arquivo.getOriginalFilename() != null ? arquivo.getOriginalFilename() : "arquivo";
		var extensao = obterExtensao(nomeOriginal);
		if (!EXTENSOES_ACEITAS.contains(extensao)) {
			throw new BusinessException("Tipo de arquivo não permitido");
		}

		var nomeLimpo = nomeOriginal.replaceAll("[^a-zA-Z0-9._-]", "_");
		var caminho = "alunos/" + alunoId + "/" + UUID.randomUUID() + "-" + nomeLimpo;
		var url = storageService.upload(caminho, arquivo);

		documento.setNomeArquivo(nomeOriginal);
		documento.setTipoArquivo(arquivo.getContentType() != null ? arquivo.getContentType() : contentTypePorExtensao(extensao));
		documento.setTamanhoArquivo(arquivo.getSize());
		documento.setCaminhoArquivo(caminho);
		documento.setUrlArquivo(url);
	}

	private String obterExtensao(String nomeArquivo) {
		var index = nomeArquivo.lastIndexOf('.');
		if (index < 0 || index == nomeArquivo.length() - 1) {
			return "";
		}
		return nomeArquivo.substring(index + 1).toLowerCase(Locale.ROOT);
	}

	private String contentTypePorExtensao(String extensao) {
		return switch (extensao) {
			case "pdf" -> "application/pdf";
			case "doc" -> "application/msword";
			case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
			case "png" -> "image/png";
			case "jpg", "jpeg" -> "image/jpeg";
			default -> "application/octet-stream";
		};
	}
}
