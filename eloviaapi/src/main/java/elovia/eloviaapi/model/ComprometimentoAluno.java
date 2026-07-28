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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "comprometimentos_alunos")
public class ComprometimentoAluno {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "aluno_id", nullable = false)
	private Aluno aluno;

	@Column(nullable = false, length = 180)
	private String nome;

	@Column(length = 40)
	private String cid;

	@Column(nullable = false)
	private int ordem;

	@Column(name = "criado_em", nullable = false, updatable = false)
	private Instant criadoEm;

	@PrePersist
	void antesDeCriar() {
		criadoEm = Instant.now();
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

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getCid() {
		return cid;
	}

	public void setCid(String cid) {
		this.cid = cid;
	}

	public int getOrdem() {
		return ordem;
	}

	public void setOrdem(int ordem) {
		this.ordem = ordem;
	}

	public Instant getCriadoEm() {
		return criadoEm;
	}
}
