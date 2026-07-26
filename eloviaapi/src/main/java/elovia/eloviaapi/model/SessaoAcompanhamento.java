package elovia.eloviaapi.model;

import java.time.Instant;
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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "sessoes_acompanhamento")
public class SessaoAcompanhamento {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "aluno_id", nullable = false)
	private Aluno aluno;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private StatusSessao status = StatusSessao.ABERTA;

	@Column(name = "iniciada_em", nullable = false)
	private Instant iniciadaEm;

	@Column(name = "finalizada_em")
	private Instant finalizadaEm;

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

	public String getObservacoes() {
		return observacoes;
	}

	public void setObservacoes(String observacoes) {
		this.observacoes = observacoes;
	}
}
