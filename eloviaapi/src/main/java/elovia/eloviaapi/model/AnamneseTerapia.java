package elovia.eloviaapi.model;

import java.util.UUID;
import jakarta.persistence.*;

@Entity
@Table(name = "anamnese_terapias")
public class AnamneseTerapia {
	@Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "anamnese_id") private Anamnese anamnese;
	@Column(nullable = false, length = 120) private String tipo;
	@Column(length = 100) private String frequencia;
	@Column(length = 180) private String profissional;
	@Column(columnDefinition = "text") private String observacoes;
	@Column(nullable = false) private int ordem;
	public UUID getId() { return id; }
	public void setAnamnese(Anamnese v) { anamnese = v; }
	public String getTipo() { return tipo; }
	public void setTipo(String v) { tipo = v; }
	public String getFrequencia() { return frequencia; }
	public void setFrequencia(String v) { frequencia = v; }
	public String getProfissional() { return profissional; }
	public void setProfissional(String v) { profissional = v; }
	public String getObservacoes() { return observacoes; }
	public void setObservacoes(String v) { observacoes = v; }
	public void setOrdem(int v) { ordem = v; }
}
