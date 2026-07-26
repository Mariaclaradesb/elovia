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
import jakarta.persistence.Table;

@Entity
@Table(name = "eventos_acompanhamento")
public class EventoAcompanhamento {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "sessao_id", nullable = false)
	private SessaoAcompanhamento sessao;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private TipoEvento tipo;

	@Column(columnDefinition = "text")
	private String observacoes;

	@Column(name = "ocorrido_em", nullable = false)
	private Instant ocorridoEm;

	@PrePersist
	void antesDeCriar() {
		if (ocorridoEm == null) {
			ocorridoEm = Instant.now();
		}
	}

	public UUID getId() {
		return id;
	}

	public SessaoAcompanhamento getSessao() {
		return sessao;
	}

	public void setSessao(SessaoAcompanhamento sessao) {
		this.sessao = sessao;
	}

	public TipoEvento getTipo() {
		return tipo;
	}

	public void setTipo(TipoEvento tipo) {
		this.tipo = tipo;
	}

	public String getObservacoes() {
		return observacoes;
	}

	public void setObservacoes(String observacoes) {
		this.observacoes = observacoes;
	}

	public Instant getOcorridoEm() {
		return ocorridoEm;
	}
}
