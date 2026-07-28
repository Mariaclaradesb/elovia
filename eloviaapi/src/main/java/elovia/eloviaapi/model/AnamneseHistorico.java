package elovia.eloviaapi.model;

import java.time.Instant;
import java.util.UUID;
import jakarta.persistence.*;

@Entity
@Table(name = "anamnese_historico")
public class AnamneseHistorico {
	@Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "anamnese_id") private Anamnese anamnese;
	@Column(nullable = false) private int etapa;
	@Column(columnDefinition = "text") private String resumo;
	@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "usuario_id") private Usuario usuario;
	@Column(name = "editado_em", nullable = false, updatable = false) private Instant editadoEm;
	@PrePersist void antesDeCriar() { editadoEm = Instant.now(); }
	public UUID getId() { return id; }
	public void setAnamnese(Anamnese v) { anamnese = v; }
	public int getEtapa() { return etapa; }
	public void setEtapa(int v) { etapa = v; }
	public String getResumo() { return resumo; }
	public void setResumo(String v) { resumo = v; }
	public Usuario getUsuario() { return usuario; }
	public void setUsuario(Usuario v) { usuario = v; }
	public Instant getEditadoEm() { return editadoEm; }
}
