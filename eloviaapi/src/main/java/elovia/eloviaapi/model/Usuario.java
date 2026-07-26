package elovia.eloviaapi.model;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
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
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuarios")
public class Usuario {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(nullable = false, length = 160)
	private String nome;

	@Column(nullable = false, unique = true, length = 14)
	private String cpf;

	@Column(nullable = false, unique = true, length = 180)
	private String email;

	@Column(length = 30)
	private String telefone;

	@Column(nullable = false)
	private String senha;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private Role role;

	@Column(nullable = false)
	private boolean primeiroAcesso = true;

	@Column(nullable = false)
	private boolean ativo = true;

	@Column(length = 120)
	private String escola;

	@Column(length = 80)
	private String cargo;

	@Column(length = 40)
	private String matricula;

	@Column(nullable = false, updatable = false)
	private Instant dataCriacao;

	private Instant ultimoLogin;

	@ManyToMany(fetch = FetchType.LAZY)
	@JoinTable(
			name = "mediadores_alunos",
			joinColumns = @JoinColumn(name = "mediador_id"),
			inverseJoinColumns = @JoinColumn(name = "aluno_id"))
	private Set<Aluno> alunos = new HashSet<>();

	@PrePersist
	void antesDeCriar() {
		dataCriacao = Instant.now();
	}

	public UUID getId() {
		return id;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getCpf() {
		return cpf;
	}

	public void setCpf(String cpf) {
		this.cpf = cpf;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getTelefone() {
		return telefone;
	}

	public void setTelefone(String telefone) {
		this.telefone = telefone;
	}

	public String getSenha() {
		return senha;
	}

	public void setSenha(String senha) {
		this.senha = senha;
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

	public boolean isPrimeiroAcesso() {
		return primeiroAcesso;
	}

	public void setPrimeiroAcesso(boolean primeiroAcesso) {
		this.primeiroAcesso = primeiroAcesso;
	}

	public boolean isAtivo() {
		return ativo;
	}

	public void setAtivo(boolean ativo) {
		this.ativo = ativo;
	}

	public String getEscola() {
		return escola;
	}

	public void setEscola(String escola) {
		this.escola = escola;
	}

	public String getCargo() {
		return cargo;
	}

	public void setCargo(String cargo) {
		this.cargo = cargo;
	}

	public String getMatricula() {
		return matricula;
	}

	public void setMatricula(String matricula) {
		this.matricula = matricula;
	}

	public Instant getDataCriacao() {
		return dataCriacao;
	}

	public Instant getUltimoLogin() {
		return ultimoLogin;
	}

	public void setUltimoLogin(Instant ultimoLogin) {
		this.ultimoLogin = ultimoLogin;
	}

	public Set<Aluno> getAlunos() {
		return alunos;
	}
}
