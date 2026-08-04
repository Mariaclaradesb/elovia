package elovia.eloviaapi.model;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.LinkedHashSet;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import jakarta.persistence.*;

@Entity
@Table(name = "evidencias_portfolio")
public class EvidenciaPortfolio {
	@Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "aluno_id") private Aluno aluno;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "mediador_id") private Usuario mediador;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "cadastrado_por_id") private Usuario cadastradoPor;
	@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "usuario_ultima_edicao_id") private Usuario usuarioUltimaEdicao;
	@Column(nullable = false, length = 120) private String disciplina;
	@Column(length = 180) private String titulo;
	@Enumerated(EnumType.STRING) @Column(name = "tipo_atividade", nullable = false, length = 30) private TipoAtividadePortfolio tipoAtividade = TipoAtividadePortfolio.OUTRO;
	@Enumerated(EnumType.STRING) @Column(name = "status_atividade", nullable = false, length = 30) private StatusAtividadePortfolio statusAtividade = StatusAtividadePortfolio.CONCLUIDA;
	@Column(columnDefinition = "text") private String descricao;
	@Column(name = "observacoes_complementares", columnDefinition = "text") private String observacoesComplementares;
	@OneToMany(mappedBy = "evidencia", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("ordem ASC") private List<EvidenciaPortfolioFoto> fotos = new ArrayList<>();
	@Column(nullable = false) private LocalDate data;
	@Column(nullable = false) private LocalTime horario;
	@Column(name = "registrado_em", nullable = false) private Instant registradoEm;
	@Column(name = "criado_em", nullable = false, updatable = false) private Instant criadoEm;
	@Column(name = "atualizado_em", nullable = false) private Instant atualizadoEm;
	@Column(nullable = false) private boolean ativo = true;
	@ElementCollection(fetch = FetchType.LAZY)
	@CollectionTable(name = "evidencias_portfolio_tags", joinColumns = @JoinColumn(name = "evidencia_id"))
	@Column(name = "tag", nullable = false, length = 60) private Set<String> tags = new LinkedHashSet<>();

	@PrePersist void beforeCreate() { var now = Instant.now(); criadoEm = now; atualizadoEm = now; if (registradoEm == null) registradoEm = now; if (data == null) data = LocalDate.now(); if (horario == null) horario = LocalTime.now(); }
	@PreUpdate void beforeUpdate() { atualizadoEm = Instant.now(); }
	public UUID getId() { return id; }
	public Aluno getAluno() { return aluno; } public void setAluno(Aluno v) { aluno = v; }
	public Usuario getMediador() { return mediador; } public void setMediador(Usuario v) { mediador = v; }
	public Usuario getCadastradoPor() { return cadastradoPor; } public void setCadastradoPor(Usuario v) { cadastradoPor = v; }
	public Usuario getUsuarioUltimaEdicao() { return usuarioUltimaEdicao; } public void setUsuarioUltimaEdicao(Usuario v) { usuarioUltimaEdicao = v; }
	public String getDisciplina() { return disciplina; } public void setDisciplina(String v) { disciplina = v; }
	public String getTitulo() { return titulo; } public void setTitulo(String v) { titulo = v; }
	public TipoAtividadePortfolio getTipoAtividade() { return tipoAtividade; } public void setTipoAtividade(TipoAtividadePortfolio v) { tipoAtividade = v; }
	public StatusAtividadePortfolio getStatusAtividade() { return statusAtividade; } public void setStatusAtividade(StatusAtividadePortfolio v) { statusAtividade = v; }
	public String getDescricao() { return descricao; } public void setDescricao(String v) { descricao = v; }
	public String getObservacoesComplementares() { return observacoesComplementares; } public void setObservacoesComplementares(String v) { observacoesComplementares = v; }
	public List<EvidenciaPortfolioFoto> getFotos() { return fotos; }
	public void addFoto(EvidenciaPortfolioFoto foto) { foto.setEvidencia(this); foto.setOrdem(fotos.size()); fotos.add(foto); }
	public LocalDate getData() { return data; } public void setData(LocalDate v) { data = v; }
	public LocalTime getHorario() { return horario; } public void setHorario(LocalTime v) { horario = v; }
	public Instant getRegistradoEm() { return registradoEm; } public void setRegistradoEm(Instant v) { registradoEm = v; }
	public Instant getCriadoEm() { return criadoEm; } public Instant getAtualizadoEm() { return atualizadoEm; }
	public boolean isAtivo() { return ativo; } public void setAtivo(boolean v) { ativo = v; }
	public Set<String> getTags() { return tags; }
}
