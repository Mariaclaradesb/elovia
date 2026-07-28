package elovia.eloviaapi.model;

import java.time.Instant;
import java.util.UUID;
import jakarta.persistence.*;

@Entity
@Table(name = "anamnese_anexos")
public class AnamneseAnexo {
	@Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "anamnese_id") private Anamnese anamnese;
	@OneToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "documento_id", unique = true) private DocumentoAluno documento;
	@Column(name = "criado_em", nullable = false, updatable = false) private Instant criadoEm;
	@PrePersist void antesDeCriar() { criadoEm = Instant.now(); }
	public UUID getId() { return id; }
	public void setAnamnese(Anamnese v) { anamnese = v; }
	public DocumentoAluno getDocumento() { return documento; }
	public void setDocumento(DocumentoAluno v) { documento = v; }
	public Instant getCriadoEm() { return criadoEm; }
}
