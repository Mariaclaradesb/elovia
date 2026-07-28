package elovia.eloviaapi.model;

import java.util.UUID;
import jakarta.persistence.*;

@Entity
@Table(name = "anamnese_diagnosticos")
public class AnamneseDiagnostico {
	@Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "anamnese_id") private Anamnese anamnese;
	@Column(nullable = false, length = 180) private String comprometimento;
	@Column(length = 40) private String cid;
	@Column(name = "em_investigacao", nullable = false) private boolean emInvestigacao;
	@Column(nullable = false) private int ordem;
	public UUID getId() { return id; }
	public void setAnamnese(Anamnese v) { anamnese = v; }
	public String getComprometimento() { return comprometimento; }
	public void setComprometimento(String v) { comprometimento = v; }
	public String getCid() { return cid; }
	public void setCid(String v) { cid = v; }
	public boolean isEmInvestigacao() { return emInvestigacao; }
	public void setEmInvestigacao(boolean v) { emInvestigacao = v; }
	public void setOrdem(int v) { ordem = v; }
}
