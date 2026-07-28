package elovia.eloviaapi.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "anamneses")
public class Anamnese {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "aluno_id", nullable = false, unique = true)
	private Aluno aluno;

	@Column(name = "etapa_atual", nullable = false)
	private int etapaAtual = 1;

	@Column(name = "percentual_preenchimento", nullable = false)
	private int percentualPreenchimento;

	@Column(name = "professor_sala_recursos", length = 180)
	private String professorSalaRecursos;
	@Column(name = "profissional_apoio", length = 180)
	private String profissionalApoio;
	@Column(name = "funcao_profissional_apoio", length = 100)
	private String funcaoProfissionalApoio;
	@Column(name = "motivo_matricula_srm", columnDefinition = "text")
	private String motivoMatriculaSrm;

	@Column(name = "quem_e_aluno", columnDefinition = "text")
	private String quemEAluno;
	@Column(name = "onde_mora", columnDefinition = "text")
	private String ondeMora;
	@Column(name = "com_quem_mora", columnDefinition = "text")
	private String comQuemMora;
	@Column(columnDefinition = "text")
	private String desenvolvimento;
	@Column(columnDefinition = "text")
	private String gestacao;
	@Column(name = "complicacoes_parto", columnDefinition = "text")
	private String complicacoesParto;
	@Column(name = "possui_irmaos")
	private Boolean possuiIrmaos;
	@Column(name = "quantidade_irmaos")
	private Integer quantidadeIrmaos;
	@Column(columnDefinition = "text")
	private String comunicacao;

	@Column(name = "usa_medicacao")
	private Boolean usaMedicacao;
	@Column(columnDefinition = "text")
	private String alergias;
	@Column(name = "restricoes_alimentares", columnDefinition = "text")
	private String restricoesAlimentares;
	@Column(name = "crises_recorrentes", columnDefinition = "text")
	private String crisesRecorrentes;
	@Column(name = "informacoes_medicas", columnDefinition = "text")
	private String informacoesMedicas;

	@Column(columnDefinition = "text")
	private String potencialidades;
	@Column(columnDefinition = "text")
	private String interesses;
	@Column(name = "maior_facilidade", columnDefinition = "text")
	private String maiorFacilidade;
	@Column(name = "maior_dificuldade", columnDefinition = "text")
	private String maiorDificuldade;
	@Column(name = "necessita_adaptacoes", columnDefinition = "text")
	private String necessitaAdaptacoes;
	@Column(name = "reacao_mudancas", columnDefinition = "text")
	private String reacaoMudancas;
	@Column(columnDefinition = "text")
	private String hiperfoco;
	@Column(name = "formas_aprendizagem", columnDefinition = "text")
	private String formasAprendizagem;

	@Column(name = "responsavel_respondente", length = 180)
	private String responsavelRespondente;
	@Column(name = "rotina_casa", columnDefinition = "text")
	private String rotinaCasa;
	@Column(name = "expectativas_familia", columnDefinition = "text")
	private String expectativasFamilia;
	@Column(name = "orientacao_importante", columnDefinition = "text")
	private String orientacaoImportante;
	@Column(name = "comportamentos_fora_escola", columnDefinition = "text")
	private String comportamentosForaEscola;

	@Column(name = "observacao_sala_outros_espacos", columnDefinition = "text")
	private String observacaoSalaOutrosEspacos;
	@Column(name = "professor_regente", columnDefinition = "text")
	private String professorRegente;
	@Column(name = "sala_recursos", columnDefinition = "text")
	private String salaRecursos;
	@Column(name = "equipe_pedagogica", columnDefinition = "text")
	private String equipePedagogica;
	@Column(name = "observacoes_gerais", columnDefinition = "text")
	private String observacoesGerais;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "criado_por_id")
	private Usuario criadoPor;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "atualizado_por_id")
	private Usuario atualizadoPor;
	@Column(name = "criado_em", nullable = false, updatable = false)
	private Instant criadoEm;
	@Column(name = "atualizado_em", nullable = false)
	private Instant atualizadoEm;

	@OneToMany(mappedBy = "anamnese", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("ordem ASC")
	private List<AnamneseMedicamento> medicamentos = new ArrayList<>();
	@OneToMany(mappedBy = "anamnese", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("ordem ASC")
	private List<AnamneseTerapia> terapias = new ArrayList<>();
	@OneToMany(mappedBy = "anamnese", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("ordem ASC")
	private List<AnamneseDiagnostico> diagnosticos = new ArrayList<>();
	@OneToMany(mappedBy = "anamnese", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("criadoEm DESC")
	private List<AnamneseAnexo> anexos = new ArrayList<>();
	@OneToMany(mappedBy = "anamnese", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("editadoEm DESC")
	private List<AnamneseHistorico> historico = new ArrayList<>();

	@PrePersist
	void antesDeCriar() { criadoEm = Instant.now(); atualizadoEm = criadoEm; }
	@PreUpdate
	void antesDeAtualizar() { atualizadoEm = Instant.now(); }

	public UUID getId() { return id; }
	public Aluno getAluno() { return aluno; }
	public void setAluno(Aluno aluno) { this.aluno = aluno; }
	public int getEtapaAtual() { return etapaAtual; }
	public void setEtapaAtual(int etapaAtual) { this.etapaAtual = etapaAtual; }
	public int getPercentualPreenchimento() { return percentualPreenchimento; }
	public void setPercentualPreenchimento(int percentualPreenchimento) { this.percentualPreenchimento = percentualPreenchimento; }
	public String getProfessorSalaRecursos() { return professorSalaRecursos; }
	public void setProfessorSalaRecursos(String v) { professorSalaRecursos = v; }
	public String getProfissionalApoio() { return profissionalApoio; }
	public void setProfissionalApoio(String v) { profissionalApoio = v; }
	public String getFuncaoProfissionalApoio() { return funcaoProfissionalApoio; }
	public void setFuncaoProfissionalApoio(String v) { funcaoProfissionalApoio = v; }
	public String getMotivoMatriculaSrm() { return motivoMatriculaSrm; }
	public void setMotivoMatriculaSrm(String v) { motivoMatriculaSrm = v; }
	public String getQuemEAluno() { return quemEAluno; }
	public void setQuemEAluno(String v) { quemEAluno = v; }
	public String getOndeMora() { return ondeMora; }
	public void setOndeMora(String v) { ondeMora = v; }
	public String getComQuemMora() { return comQuemMora; }
	public void setComQuemMora(String v) { comQuemMora = v; }
	public String getDesenvolvimento() { return desenvolvimento; }
	public void setDesenvolvimento(String v) { desenvolvimento = v; }
	public String getGestacao() { return gestacao; }
	public void setGestacao(String v) { gestacao = v; }
	public String getComplicacoesParto() { return complicacoesParto; }
	public void setComplicacoesParto(String v) { complicacoesParto = v; }
	public Boolean getPossuiIrmaos() { return possuiIrmaos; }
	public void setPossuiIrmaos(Boolean v) { possuiIrmaos = v; }
	public Integer getQuantidadeIrmaos() { return quantidadeIrmaos; }
	public void setQuantidadeIrmaos(Integer v) { quantidadeIrmaos = v; }
	public String getComunicacao() { return comunicacao; }
	public void setComunicacao(String v) { comunicacao = v; }
	public Boolean getUsaMedicacao() { return usaMedicacao; }
	public void setUsaMedicacao(Boolean v) { usaMedicacao = v; }
	public String getAlergias() { return alergias; }
	public void setAlergias(String v) { alergias = v; }
	public String getRestricoesAlimentares() { return restricoesAlimentares; }
	public void setRestricoesAlimentares(String v) { restricoesAlimentares = v; }
	public String getCrisesRecorrentes() { return crisesRecorrentes; }
	public void setCrisesRecorrentes(String v) { crisesRecorrentes = v; }
	public String getInformacoesMedicas() { return informacoesMedicas; }
	public void setInformacoesMedicas(String v) { informacoesMedicas = v; }
	public String getPotencialidades() { return potencialidades; }
	public void setPotencialidades(String v) { potencialidades = v; }
	public String getInteresses() { return interesses; }
	public void setInteresses(String v) { interesses = v; }
	public String getMaiorFacilidade() { return maiorFacilidade; }
	public void setMaiorFacilidade(String v) { maiorFacilidade = v; }
	public String getMaiorDificuldade() { return maiorDificuldade; }
	public void setMaiorDificuldade(String v) { maiorDificuldade = v; }
	public String getNecessitaAdaptacoes() { return necessitaAdaptacoes; }
	public void setNecessitaAdaptacoes(String v) { necessitaAdaptacoes = v; }
	public String getReacaoMudancas() { return reacaoMudancas; }
	public void setReacaoMudancas(String v) { reacaoMudancas = v; }
	public String getHiperfoco() { return hiperfoco; }
	public void setHiperfoco(String v) { hiperfoco = v; }
	public String getFormasAprendizagem() { return formasAprendizagem; }
	public void setFormasAprendizagem(String v) { formasAprendizagem = v; }
	public String getResponsavelRespondente() { return responsavelRespondente; }
	public void setResponsavelRespondente(String v) { responsavelRespondente = v; }
	public String getRotinaCasa() { return rotinaCasa; }
	public void setRotinaCasa(String v) { rotinaCasa = v; }
	public String getExpectativasFamilia() { return expectativasFamilia; }
	public void setExpectativasFamilia(String v) { expectativasFamilia = v; }
	public String getOrientacaoImportante() { return orientacaoImportante; }
	public void setOrientacaoImportante(String v) { orientacaoImportante = v; }
	public String getComportamentosForaEscola() { return comportamentosForaEscola; }
	public void setComportamentosForaEscola(String v) { comportamentosForaEscola = v; }
	public String getObservacaoSalaOutrosEspacos() { return observacaoSalaOutrosEspacos; }
	public void setObservacaoSalaOutrosEspacos(String v) { observacaoSalaOutrosEspacos = v; }
	public String getProfessorRegente() { return professorRegente; }
	public void setProfessorRegente(String v) { professorRegente = v; }
	public String getSalaRecursos() { return salaRecursos; }
	public void setSalaRecursos(String v) { salaRecursos = v; }
	public String getEquipePedagogica() { return equipePedagogica; }
	public void setEquipePedagogica(String v) { equipePedagogica = v; }
	public String getObservacoesGerais() { return observacoesGerais; }
	public void setObservacoesGerais(String v) { observacoesGerais = v; }
	public Usuario getCriadoPor() { return criadoPor; }
	public void setCriadoPor(Usuario v) { criadoPor = v; }
	public Usuario getAtualizadoPor() { return atualizadoPor; }
	public void setAtualizadoPor(Usuario v) { atualizadoPor = v; }
	public Instant getCriadoEm() { return criadoEm; }
	public Instant getAtualizadoEm() { return atualizadoEm; }
	public List<AnamneseMedicamento> getMedicamentos() { return medicamentos; }
	public List<AnamneseTerapia> getTerapias() { return terapias; }
	public List<AnamneseDiagnostico> getDiagnosticos() { return diagnosticos; }
	public List<AnamneseAnexo> getAnexos() { return anexos; }
	public List<AnamneseHistorico> getHistorico() { return historico; }
	public void addMedicamento(AnamneseMedicamento v) { v.setAnamnese(this); medicamentos.add(v); }
	public void addTerapia(AnamneseTerapia v) { v.setAnamnese(this); terapias.add(v); }
	public void addDiagnostico(AnamneseDiagnostico v) { v.setAnamnese(this); diagnosticos.add(v); }
	public void addAnexo(AnamneseAnexo v) { v.setAnamnese(this); anexos.add(v); }
	public void addHistorico(AnamneseHistorico v) { v.setAnamnese(this); historico.add(v); }
}
