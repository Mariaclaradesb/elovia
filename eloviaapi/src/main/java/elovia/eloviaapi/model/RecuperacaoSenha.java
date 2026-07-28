package elovia.eloviaapi.model;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "recuperacoes_senha")
public class RecuperacaoSenha {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false, unique = true)
	private Usuario usuario;

	@Column(name = "codigo_hash", nullable = false, length = 64)
	private String codigoHash;

	@Column(name = "expira_em", nullable = false)
	private Instant expiraEm;

	@Column(nullable = false)
	private int tentativas;

	@Column(name = "criado_em", nullable = false, updatable = false)
	private Instant criadoEm;

	@PrePersist
	void antesDeCriar() {
		criadoEm = Instant.now();
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}

	public String getCodigoHash() {
		return codigoHash;
	}

	public void setCodigoHash(String codigoHash) {
		this.codigoHash = codigoHash;
	}

	public Instant getExpiraEm() {
		return expiraEm;
	}

	public void setExpiraEm(Instant expiraEm) {
		this.expiraEm = expiraEm;
	}

	public int getTentativas() {
		return tentativas;
	}

	public void setTentativas(int tentativas) {
		this.tentativas = tentativas;
	}
}
