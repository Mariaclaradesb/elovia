package elovia.eloviaapi.model;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "alunos")
public class Aluno {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(nullable = false, length = 160)
	private String nome;

	@Column(length = 80)
	private String turma;

	@Column(length = 300)
	private String foto;

	@Column(name = "data_nascimento")
	private LocalDate dataNascimento;

	@Column(length = 20)
	private String sexo;

	@Column(length = 120)
	private String escola;

	@Column(length = 30)
	private String turno;

	@Column(length = 160)
	private String responsavel;

	@Column(name = "telefone_responsavel", length = 30)
	private String telefoneResponsavel;

	@Column(name = "email_responsavel", length = 180)
	private String emailResponsavel;

	@Column(columnDefinition = "text")
	private String diagnostico;

	@Column(length = 40)
	private String cid;

	@Column(name = "necessita_mediador", nullable = false)
	private boolean necessitaMediador;

	@Column(name = "observacoes_iniciais", columnDefinition = "text")
	private String observacoesIniciais;

	@Column(columnDefinition = "text")
	private String estrategias;

	@Column(columnDefinition = "text")
	private String gatilhos;

	@Column(columnDefinition = "text")
	private String preferencias;

	@Column(columnDefinition = "text")
	private String interesses;

	@Column(name = "objetivos_pdi", columnDefinition = "text")
	private String objetivosPdi;

	@Column(name = "forma_comunicacao", columnDefinition = "text")
	private String formaComunicacao;

	@Column(columnDefinition = "text")
	private String observacoes;

	@Column(nullable = false)
	private boolean ativo = true;

	@Column(name = "criado_em", nullable = false, updatable = false)
	private Instant criadoEm;

	@Column(name = "atualizado_em", nullable = false)
	private Instant atualizadoEm;

	@ManyToMany(mappedBy = "alunos", fetch = FetchType.LAZY)
	private Set<Usuario> mediadores = new HashSet<>();

	@PrePersist
	void antesDeCriar() {
		var agora = Instant.now();
		criadoEm = agora;
		atualizadoEm = agora;
	}

	@PreUpdate
	void antesDeAtualizar() {
		atualizadoEm = Instant.now();
	}

	public UUID getId() {
		return id;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getTurma() {
		return turma;
	}

	public void setTurma(String turma) {
		this.turma = turma;
	}

	public String getFoto() {
		return foto;
	}

	public void setFoto(String foto) {
		this.foto = foto;
	}

	public LocalDate getDataNascimento() {
		return dataNascimento;
	}

	public void setDataNascimento(LocalDate dataNascimento) {
		this.dataNascimento = dataNascimento;
	}

	public String getSexo() {
		return sexo;
	}

	public void setSexo(String sexo) {
		this.sexo = sexo;
	}

	public String getEscola() {
		return escola;
	}

	public void setEscola(String escola) {
		this.escola = escola;
	}

	public String getTurno() {
		return turno;
	}

	public void setTurno(String turno) {
		this.turno = turno;
	}

	public String getResponsavel() {
		return responsavel;
	}

	public void setResponsavel(String responsavel) {
		this.responsavel = responsavel;
	}

	public String getTelefoneResponsavel() {
		return telefoneResponsavel;
	}

	public void setTelefoneResponsavel(String telefoneResponsavel) {
		this.telefoneResponsavel = telefoneResponsavel;
	}

	public String getEmailResponsavel() {
		return emailResponsavel;
	}

	public void setEmailResponsavel(String emailResponsavel) {
		this.emailResponsavel = emailResponsavel;
	}

	public String getDiagnostico() {
		return diagnostico;
	}

	public void setDiagnostico(String diagnostico) {
		this.diagnostico = diagnostico;
	}

	public String getCid() {
		return cid;
	}

	public void setCid(String cid) {
		this.cid = cid;
	}

	public boolean isNecessitaMediador() {
		return necessitaMediador;
	}

	public void setNecessitaMediador(boolean necessitaMediador) {
		this.necessitaMediador = necessitaMediador;
	}

	public String getObservacoesIniciais() {
		return observacoesIniciais;
	}

	public void setObservacoesIniciais(String observacoesIniciais) {
		this.observacoesIniciais = observacoesIniciais;
	}

	public String getEstrategias() {
		return estrategias;
	}

	public void setEstrategias(String estrategias) {
		this.estrategias = estrategias;
	}

	public String getGatilhos() {
		return gatilhos;
	}

	public void setGatilhos(String gatilhos) {
		this.gatilhos = gatilhos;
	}

	public String getPreferencias() {
		return preferencias;
	}

	public void setPreferencias(String preferencias) {
		this.preferencias = preferencias;
	}

	public String getInteresses() {
		return interesses;
	}

	public void setInteresses(String interesses) {
		this.interesses = interesses;
	}

	public String getObjetivosPdi() {
		return objetivosPdi;
	}

	public void setObjetivosPdi(String objetivosPdi) {
		this.objetivosPdi = objetivosPdi;
	}

	public String getFormaComunicacao() {
		return formaComunicacao;
	}

	public void setFormaComunicacao(String formaComunicacao) {
		this.formaComunicacao = formaComunicacao;
	}

	public String getObservacoes() {
		return observacoes;
	}

	public void setObservacoes(String observacoes) {
		this.observacoes = observacoes;
	}

	public boolean isAtivo() {
		return ativo;
	}

	public void setAtivo(boolean ativo) {
		this.ativo = ativo;
	}

	public Instant getCriadoEm() {
		return criadoEm;
	}

	public Instant getAtualizadoEm() {
		return atualizadoEm;
	}

	public Set<Usuario> getMediadores() {
		return mediadores;
	}
}
