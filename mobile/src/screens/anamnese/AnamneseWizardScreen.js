import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  HelperText,
  ProgressBar,
  Snackbar,
  Text,
} from 'react-native-paper';

import ChoiceChips from '../../components/ChoiceChips';
import TextInput from '../../components/FormTextInput';
import FormSection from '../../components/FormSection';
import InfoGrid from '../../components/InfoGrid';
import RepeatableAnamneseList from '../../components/RepeatableAnamneseList';
import Screen from '../../components/Screen';
import {
  ANAMNESE_STEPS,
  APRENDIZAGEM_OPTIONS,
  COMUNICACAO_OPTIONS,
  EMPTY_ANAMNESE,
  MORADIA_OPTIONS,
  anamnesePayload,
  normalizeAnamnese,
} from '../../constants/anamnese';
import { useAuth } from '../../context/AuthContext';
import { buscarAnamnese, salvarEtapaAnamnese } from '../../services/anamneseApi';
import { colors } from '../../theme';
import { styles } from '../../theme/styles';
import { isoToDisplayDate } from '../../utils/date';

const MEDICAMENTO_FIELDS = [
  { key: 'nome', label: 'Nome do medicamento' },
  { key: 'dosagem', label: 'Dosagem' },
  { key: 'horario', label: 'Horário' },
  { key: 'observacoes', label: 'Observações', multiline: true },
];

const TERAPIA_FIELDS = [
  { key: 'tipo', label: 'Terapia' },
  { key: 'frequencia', label: 'Frequência' },
  { key: 'profissional', label: 'Profissional' },
  { key: 'observacoes', label: 'Observações', multiline: true },
];

function LongField({ label, value, onChange }) {
  return (
    <TextInput
      label={label}
      value={value || ''}
      onChangeText={onChange}
      multiline
      numberOfLines={4}
    />
  );
}

export default function AnamneseWizardScreen({ route, navigation }) {
  const { token } = useAuth();
  const aluno = route.params?.aluno;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_ANAMNESE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const currentStep = ANAMNESE_STEPS[step - 1];
  const progress = useMemo(() => step / ANAMNESE_STEPS.length, [step]);

  useEffect(() => {
    if (!aluno?.id) {
      setError('Aluno não encontrado.');
      setLoading(false);
      return;
    }
    buscarAnamnese(aluno.id, token)
      .then((data) => {
        setForm(normalizeAnamnese(data));
        setStep(Math.min(7, Math.max(1, route.params?.startAt || data?.etapaAtual || 1)));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [aluno?.id, route.params?.startAt, token]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function persist(targetStep = step) {
    setSaving(true);
    setError('');
    try {
      const saved = await salvarEtapaAnamnese(aluno.id, targetStep, anamnesePayload(form), token);
      setForm(normalizeAnamnese(saved));
      setMessage(`Etapa ${targetStep} salva automaticamente.`);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function next() {
    const saved = await persist();
    if (!saved) return;
    if (step === 7) {
      navigation.replace('AnamneseView', { aluno });
      return;
    }
    setStep((current) => current + 1);
  }

  async function back() {
    const saved = await persist();
    if (saved) setStep((current) => Math.max(1, current - 1));
  }

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator size="large" color={colors.tealDark} />
      </Screen>
    );
  }

  function renderStepOne() {
    const responsaveis = aluno.responsaveis?.map((item) => item.nome).join(', ') || aluno.responsavel;
    return (
      <>
        <FormSection title="Dados do aluno">
          <InfoGrid items={[
            { label: 'Aluno', value: aluno.nome, full: true },
            { label: 'Nascimento', value: isoToDisplayDate(aluno.dataNascimento) },
            { label: 'Turma', value: aluno.turma },
            { label: 'Turno', value: aluno.turno },
            { label: 'Escola', value: aluno.escola, full: true },
            { label: 'Responsáveis', value: responsaveis, full: true },
          ]} />
        </FormSection>
        <FormSection title="Equipe de acompanhamento">
          <TextInput label="Professor(a) da sala de recursos" value={form.professorSalaRecursos} onChangeText={(value) => setField('professorSalaRecursos', value)} />
          <TextInput label="Profissional de apoio" value={form.profissionalApoio} onChangeText={(value) => setField('profissionalApoio', value)} />
          <TextInput label="Função do profissional de apoio" value={form.funcaoProfissionalApoio} onChangeText={(value) => setField('funcaoProfissionalApoio', value)} />
        </FormSection>
      </>
    );
  }

  function renderStepTwo() {
    return (
      <>
        <FormSection title="Comprometimentos cadastrados">
          <Text style={styles.muted}>Estes dados vêm do cadastro do aluno e permanecem associados aos respectivos CIDs.</Text>
          <View style={styles.formGap}>
            {aluno.comprometimentos?.map((item) => (
              <Card key={item.id || item.nome} style={styles.card}>
                <Card.Content>
                  <Text style={styles.sectionTitle}>{item.nome}</Text>
                  <Text style={styles.muted}>{item.cid ? `CID ${item.cid}` : 'CID não informado'}</Text>
                </Card.Content>
              </Card>
            ))}
            {!aluno.comprometimentos?.length && !aluno.emInvestigacao && (
              <Text style={styles.muted}>Nenhum comprometimento informado.</Text>
            )}
            {aluno.emInvestigacao && <Chip icon="magnify" selected>Em investigação</Chip>}
          </View>
        </FormSection>
        <FormSection title="Sala de recursos">
          <LongField label="Motivo da matrícula na sala de recursos" value={form.motivoMatriculaSrm} onChange={(value) => setField('motivoMatriculaSrm', value)} />
        </FormSection>
      </>
    );
  }

  function renderStepThree() {
    return (
      <FormSection title="Histórico do aluno">
        <LongField label="Quem é o aluno?" value={form.quemEAluno} onChange={(value) => setField('quemEAluno', value)} />
        <TextInput label="Onde mora?" value={form.ondeMora} onChangeText={(value) => setField('ondeMora', value)} />
        <Text style={styles.formFieldLabel}>Com quem mora?</Text>
        <ChoiceChips options={MORADIA_OPTIONS} value={form.comQuemMora} onChange={(value) => setField('comQuemMora', value)} />
        <LongField label="Como foi o desenvolvimento?" value={form.desenvolvimento} onChange={(value) => setField('desenvolvimento', value)} />
        <LongField label="Como ocorreu a gestação?" value={form.gestacao} onChange={(value) => setField('gestacao', value)} />
        <LongField label="Houve complicações no parto?" value={form.complicacoesParto} onChange={(value) => setField('complicacoesParto', value)} />
        <Text style={styles.formFieldLabel}>Possui irmãos?</Text>
        <ChoiceChips options={['Sim', 'Não']} value={form.possuiIrmaos == null ? null : form.possuiIrmaos ? 'Sim' : 'Não'} multiple={false} onChange={(value) => setField('possuiIrmaos', value === 'Sim')} />
        {form.possuiIrmaos && (
          <TextInput label="Quantidade de irmãos" value={form.quantidadeIrmaos} keyboardType="number-pad" onChangeText={(value) => setField('quantidadeIrmaos', value.replace(/\D/g, ''))} />
        )}
        <Text style={styles.formFieldLabel}>Comunicação</Text>
        <ChoiceChips options={COMUNICACAO_OPTIONS} value={form.comunicacao} onChange={(value) => setField('comunicacao', value)} />
      </FormSection>
    );
  }

  function renderStepFour() {
    return (
      <>
        <FormSection title="Medicação">
          <Text style={styles.formFieldLabel}>Faz uso de medicação?</Text>
          <ChoiceChips options={['Sim', 'Não']} value={form.usaMedicacao == null ? null : form.usaMedicacao ? 'Sim' : 'Não'} multiple={false} onChange={(value) => setField('usaMedicacao', value === 'Sim')} />
          {form.usaMedicacao && (
            <RepeatableAnamneseList
              title="Medicamentos"
              addLabel="Adicionar medicamento"
              items={form.medicamentos}
              emptyItem={{ nome: '', dosagem: '', horario: '', observacoes: '' }}
              fields={MEDICAMENTO_FIELDS}
              onChange={(value) => setField('medicamentos', value)}
            />
          )}
        </FormSection>
        <FormSection title="Terapias">
          <RepeatableAnamneseList
            title="Terapias"
            addLabel="Adicionar terapia"
            items={form.terapias}
            emptyItem={{ tipo: '', frequencia: '', profissional: '', observacoes: '' }}
            fields={TERAPIA_FIELDS}
            onChange={(value) => setField('terapias', value)}
          />
        </FormSection>
        <FormSection title="Outras informações de saúde">
          <LongField label="Alergias" value={form.alergias} onChange={(value) => setField('alergias', value)} />
          <LongField label="Restrições alimentares" value={form.restricoesAlimentares} onChange={(value) => setField('restricoesAlimentares', value)} />
          <LongField label="Crises recorrentes" value={form.crisesRecorrentes} onChange={(value) => setField('crisesRecorrentes', value)} />
          <LongField label="Informações médicas importantes" value={form.informacoesMedicas} onChange={(value) => setField('informacoesMedicas', value)} />
        </FormSection>
      </>
    );
  }

  function renderStepFive() {
    return (
      <FormSection title="Perfil pedagógico">
        <LongField label="Quais são suas potencialidades?" value={form.potencialidades} onChange={(value) => setField('potencialidades', value)} />
        <LongField label="Quais são seus interesses?" value={form.interesses} onChange={(value) => setField('interesses', value)} />
        <LongField label="Maior facilidade" value={form.maiorFacilidade} onChange={(value) => setField('maiorFacilidade', value)} />
        <LongField label="Maior dificuldade" value={form.maiorDificuldade} onChange={(value) => setField('maiorDificuldade', value)} />
        <LongField label="Necessita de adaptações?" value={form.necessitaAdaptacoes} onChange={(value) => setField('necessitaAdaptacoes', value)} />
        <LongField label="Como reage a mudanças?" value={form.reacaoMudancas} onChange={(value) => setField('reacaoMudancas', value)} />
        <LongField label="Possui hiperfoco?" value={form.hiperfoco} onChange={(value) => setField('hiperfoco', value)} />
        <Text style={styles.formFieldLabel}>Como aprende melhor?</Text>
        <ChoiceChips options={APRENDIZAGEM_OPTIONS} value={form.formasAprendizagem} onChange={(value) => setField('formasAprendizagem', value)} />
      </FormSection>
    );
  }

  function renderStepSix() {
    return (
      <FormSection title="Informações da família">
        <TextInput label="Responsável que respondeu" value={form.responsavelRespondente} onChangeText={(value) => setField('responsavelRespondente', value)} />
        <LongField label="Como é a rotina em casa?" value={form.rotinaCasa} onChange={(value) => setField('rotinaCasa', value)} />
        <LongField label="Quais são as expectativas da família?" value={form.expectativasFamilia} onChange={(value) => setField('expectativasFamilia', value)} />
        <LongField label="Existe alguma orientação importante?" value={form.orientacaoImportante} onChange={(value) => setField('orientacaoImportante', value)} />
        <LongField label="Comportamentos observados fora da escola" value={form.comportamentosForaEscola} onChange={(value) => setField('comportamentosForaEscola', value)} />
      </FormSection>
    );
  }

  function renderStepSeven() {
    return (
      <>
        <FormSection title="Observações da escola">
          <LongField label="Observação em sala e outros espaços" value={form.observacaoSalaOutrosEspacos} onChange={(value) => setField('observacaoSalaOutrosEspacos', value)} />
          <LongField label="Professor regente" value={form.professorRegente} onChange={(value) => setField('professorRegente', value)} />
          <LongField label="Sala de recursos" value={form.salaRecursos} onChange={(value) => setField('salaRecursos', value)} />
          <LongField label="Equipe pedagógica" value={form.equipePedagogica} onChange={(value) => setField('equipePedagogica', value)} />
          <LongField label="Observações gerais" value={form.observacoesGerais} onChange={(value) => setField('observacoesGerais', value)} />
        </FormSection>
        <FormSection title="Documentos complementares">
          <Text style={styles.muted}>Laudos, receitas, relatórios, avaliações, PDI e outros documentos serão vinculados à Anamnese e à Biblioteca.</Text>
          <Button mode="outlined" icon="paperclip" onPress={() => navigation.navigate('DocumentoForm', { aluno, anamnese: true })}>
            Adicionar anexo
          </Button>
          {!!form.anexos?.length && <Text style={styles.muted}>{form.anexos.length} documento(s) anexado(s).</Text>}
        </FormSection>
      </>
    );
  }

  const renders = [renderStepOne, renderStepTwo, renderStepThree, renderStepFour, renderStepFive, renderStepSix, renderStepSeven];

  return (
    <Screen>
      <View style={styles.stepHeader}>
        <View style={styles.documentHeader}>
          <Text style={styles.infoLabel}>Etapa {step} de 7</Text>
          <Text style={styles.infoLabel}>{Math.round(progress * 100)}%</Text>
        </View>
        <Text variant="headlineSmall" style={styles.title}>{currentStep.title}</Text>
        <Text style={styles.muted}>{currentStep.subtitle}</Text>
        <ProgressBar progress={progress} color={colors.tealDark} style={styles.stepProgress} />
      </View>

      {renders[step - 1]()}
      {!!error && <HelperText type="error" visible>{error}</HelperText>}

      <View style={styles.stepActions}>
        {step > 1 && <Button mode="outlined" disabled={saving} onPress={back}>Voltar</Button>}
        <Button mode="text" icon="content-save-outline" loading={saving} onPress={() => persist()}>
          Salvar rascunho
        </Button>
        <Button mode="contained" icon={step === 7 ? 'check' : 'arrow-right'} loading={saving} onPress={next}>
          {step === 7 ? 'Concluir anamnese' : 'Salvar e continuar'}
        </Button>
      </View>
      <Snackbar visible={!!message} onDismiss={() => setMessage('')}>{message}</Snackbar>
    </Screen>
  );
}
