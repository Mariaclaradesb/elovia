package elovia.eloviaapi.model;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "sessoes_acompanhamento")
public class SessaoAcompanhamento {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "aluno_id")
	private Aluno aluno;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "mediador_id")
	private Usuario mediador;

	@ManyToMany(fetch = FetchType.LAZY)
	@JoinTable(
			name = "sessoes_alunos",
			joinColumns = @JoinColumn(name = "sessao_id"),
			inverseJoinColumns = @JoinColumn(name = "aluno_id"))
	private Set<Aluno> alunos = new HashSet<>();

	@Column
	private LocalDate data;

	@Enumerated(EnumType.STRING)
	@Column(length = 20)
	private PeriodoAcompanhamento periodo;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private StatusSessao status = StatusSessao.ABERTA;

	@Column(name = "iniciada_em", nullable = false)
	private Instant iniciadaEm;

	@Column(name = "finalizada_em")
	private Instant finalizadaEm;

	@Column
	private Instant inicio;

	@Column
	private Instant fim;

	@Column(columnDefinition = "text")
	private String observacoes;

	@Column(name = "criado_em", nullable = false, updatable = false)
	private Instant criadoEm;

	@Column(name = "atualizado_em", nullable = false)
	private Instant atualizadoEm;

	@PrePersist
	void antesDeCriar() {
		var agora = Instant.now();
		criadoEm = agora;
		atualizadoEm = agora;
		if (iniciadaEm == null) {
			iniciadaEm = agora;
		}
		if (inicio == null) {
			inicio = iniciadaEm;
		}
		if (data == null) {
			data = LocalDate.now();
		}
	}

	@PreUpdate
	void antesDeAtualizar() {
		atualizadoEm = Instant.now();
	}

	public UUID getId() {
		return id;
	}

	public Aluno getAluno() {
		return aluno;
	}

	public void setAluno(Aluno aluno) {
		this.aluno = aluno;
	}

	public Usuario getMediador() {
		return mediador;
	}

	public void setMediador(Usuario mediador) {
		this.mediador = mediador;
	}

	public Set<Aluno> getAlunos() {
		return alunos;
	}

	public LocalDate getData() {
		return data;
	}

	public void setData(LocalDate data) {
		this.data = data;
	}

	public PeriodoAcompanhamento getPeriodo() {
		return periodo;
	}

	public void setPeriodo(PeriodoAcompanhamento periodo) {
		this.periodo = periodo;
	}

	public StatusSessao getStatus() {
		return status;
	}

	public void setStatus(StatusSessao status) {
		this.status = status;
	}

	public Instant getIniciadaEm() {
		return iniciadaEm;
	}

	public Instant getFinalizadaEm() {
		return finalizadaEm;
	}

	public void setFinalizadaEm(Instant finalizadaEm) {
		this.finalizadaEm = finalizadaEm;
	}

	public Instant getInicio() {
		return inicio;
	}

	public void setInicio(Instant inicio) {
		this.inicio = inicio;
		this.iniciadaEm = inicio;
	}

	public Instant getFim() {
		return fim;
	}

	public void setFim(Instant fim) {
		this.fim = fim;
		this.finalizadaEm = fim;
	}

	public String getObservacoes() {
		return observacoes;
	}

	public void setObservacoes(String observacoes) {
		this.observacoes = observacoes;
	}
}
