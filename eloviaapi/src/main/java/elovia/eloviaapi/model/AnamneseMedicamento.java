package elovia.eloviaapi.model;

import java.util.UUID;
import jakarta.persistence.*;

@Entity
@Table(name = "anamnese_medicamentos")
public class AnamneseMedicamento {
	@Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "anamnese_id") private Anamnese anamnese;
	@Column(nullable = false, length = 180) private String nome;
	@Column(length = 100) private String dosagem;
	@Column(length = 100) private String horario;
	@Column(columnDefinition = "text") private String observacoes;
	@Column(nullable = false) private int ordem;
	public UUID getId() { return id; }
	public void setAnamnese(Anamnese v) { anamnese = v; }
	public String getNome() { return nome; }
	public void setNome(String v) { nome = v; }
	public String getDosagem() { return dosagem; }
	public void setDosagem(String v) { dosagem = v; }
	public String getHorario() { return horario; }
	public void setHorario(String v) { horario = v; }
	public String getObservacoes() { return observacoes; }
	public void setObservacoes(String v) { observacoes = v; }
	public void setOrdem(int v) { ordem = v; }
}
