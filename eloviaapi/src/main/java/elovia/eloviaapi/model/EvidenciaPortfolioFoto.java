package elovia.eloviaapi.model;

import java.time.Instant;
import java.util.UUID;
import jakarta.persistence.*;

@Entity
@Table(name = "evidencias_portfolio_fotos")
public class EvidenciaPortfolioFoto {
	@Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "evidencia_id") private EvidenciaPortfolio evidencia;
	@Column(nullable = false, length = 500) private String caminho;
	@Column(nullable = false, length = 260) private String nome;
	@Column(nullable = false, length = 120) private String tipo;
	@Column(nullable = false) private int ordem;
	@Column(name = "criado_em", nullable = false, updatable = false) private Instant criadoEm;
	@PrePersist void beforeCreate() { criadoEm = Instant.now(); }
	public UUID getId() { return id; }
	public EvidenciaPortfolio getEvidencia() { return evidencia; } public void setEvidencia(EvidenciaPortfolio v) { evidencia = v; }
	public String getCaminho() { return caminho; } public void setCaminho(String v) { caminho = v; }
	public String getNome() { return nome; } public void setNome(String v) { nome = v; }
	public String getTipo() { return tipo; } public void setTipo(String v) { tipo = v; }
	public int getOrdem() { return ordem; } public void setOrdem(int v) { ordem = v; }
	public Instant getCriadoEm() { return criadoEm; }
}
