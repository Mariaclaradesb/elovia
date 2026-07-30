import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Button, Card, ProgressBar, Text } from 'react-native-paper';
import FeedbackMessage from '../../components/FeedbackMessage';

import AppSnackbar from '../../components/AppSnackbar';
import ChoiceChips from '../../components/ChoiceChips';
import TextInput from '../../components/FormTextInput';
import FormSection from '../../components/FormSection';
import InfoGrid from '../../components/InfoGrid';
import RepeatableAnamneseList from '../../components/RepeatableAnamneseList';
import Screen from '../../components/Screen';
import {
  ANAMNESE_STEPS,
  COMUNICACAO_OPTIONS,
  EMPTY_ANAMNESE,
  MORADIA_OPTIONS,
  TERAPIA_OPTIONS,
  anamnesePayload,
  normalizeAnamnese,
} from '../../constants/anamnese';
import { useAuth } from '../../context/AuthContext';
import { buscarAnamnese, salvarEtapaAnamnese } from '../../services/anamneseApi';
import { colors } from '../../theme';
import { styles } from '../../theme/styles';
import { isoToDisplayDate } from '../../utils/date';
import { formatPhone } from '../../utils/masks';

const DIAGNOSTICO_FIELDS = [
  { key: 'nome', label: 'Diagnóstico' },
  { key: 'cid', label: 'CID' },
];

const MEDICAMENTO_FIELDS = [
  { key: 'nome', label: 'Medicamento' },
  { key: 'dosagem', label: 'Dosagem' },
  { key: 'observacao', label: 'Observação', multiline: true },
];

function LongField({ label, value, onChange }) {
  return <TextInput label={label} value={value || ''} onChangeText={onChange} multiline numberOfLines={4} />;
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
  const formRef = useRef(EMPTY_ANAMNESE);
  const stepRef = useRef(1);
  const lastSavedRef = useRef('');
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
        const normalized = normalizeAnamnese(data);
        normalized.responsavelTelefone = formatPhone(normalized.responsavelTelefone);
        setForm(normalized);
        formRef.current = normalized;
        lastSavedRef.current = JSON.stringify(anamnesePayload(normalized));
        setStep(Math.min(ANAMNESE_STEPS.length, Math.max(1, route.params?.startAt || data?.etapaAtual || 1)));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [aluno?.id, route.params?.startAt, token]);

  useEffect(() => {
    formRef.current = form;
    stepRef.current = step;
  }, [form, step]);

  useEffect(() => navigation.addListener('blur', () => {
    if (!aluno?.id || loading) return;
    const payload = anamnesePayload(formRef.current);
    const serialized = JSON.stringify(payload);
    if (serialized === lastSavedRef.current) return;
    lastSavedRef.current = serialized;
    salvarEtapaAnamnese(aluno.id, stepRef.current, payload, token).catch(() => {
      lastSavedRef.current = '';
    });
  }), [aluno?.id, loading, navigation, token]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function persist(targetStep = step) {
    setSaving(true);
    setError('');
    try {
      const saved = await salvarEtapaAnamnese(aluno.id, targetStep, anamnesePayload(form), token);
      const normalized = normalizeAnamnese(saved);
      normalized.responsavelTelefone = formatPhone(normalized.responsavelTelefone);
      setForm(normalized);
      formRef.current = normalized;
      lastSavedRef.current = JSON.stringify(anamnesePayload(normalized));
      setMessage(`Seção ${targetStep} salva automaticamente.`);
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
    if (step === ANAMNESE_STEPS.length) {
      navigation.replace('AnamneseView', { aluno });
      return;
    }
    setStep((current) => current + 1);
  }

  async function back() {
    const saved = await persist();
    if (saved) setStep((current) => Math.max(1, current - 1));
  }

  if (loading) return <Screen><ActivityIndicator size="large" color={colors.tealDark} /></Screen>;

  function renderIdentification() {
    return (
      <>
        <FormSection title="Dados do aluno">
          <InfoGrid items={[
            { label: 'Nome', value: aluno.nome, full: true },
            { label: 'Data de nascimento', value: isoToDisplayDate(aluno.dataNascimento) },
            { label: 'Turma', value: aluno.turma },
            { label: 'Turno', value: aluno.turno },
          ]} />
          <TextInput label="Série" value={form.serie} onChangeText={(value) => setField('serie', value)} />
        </FormSection>
        <FormSection title="Responsável">
          <TextInput label="Nome" value={form.responsavelNome} onChangeText={(value) => setField('responsavelNome', value)} />
          <TextInput label="Parentesco" value={form.responsavelParentesco} onChangeText={(value) => setField('responsavelParentesco', value)} />
          <TextInput label="Telefone" placeholder="(00) 0 0000-0000" value={form.responsavelTelefone} keyboardType="phone-pad" onChangeText={(value) => setField('responsavelTelefone', formatPhone(value))} />
        </FormSection>
      </>
    );
  }

  function renderFamily() {
    return (
      <FormSection title="Informações familiares">
        <Text style={styles.formFieldLabel}>Com quem mora?</Text>
        <ChoiceChips options={MORADIA_OPTIONS} value={form.comQuemMora} onChange={(value) => setField('comQuemMora', value)} />
        {form.comQuemMora.includes('Outros') && <TextInput label="Outros" value={form.comQuemMoraOutro} onChangeText={(value) => setField('comQuemMoraOutro', value)} />}
        <TextInput label="Onde mora?" value={form.ondeMora} onChangeText={(value) => setField('ondeMora', value)} />
        <LongField label="Quem acompanha a rotina escolar?" value={form.acompanhaRotinaEscolar} onChange={(value) => setField('acompanhaRotinaEscolar', value)} />
      </FormSection>
    );
  }

  function renderGeneral() {
    return (
      <FormSection title="Informações gerais">
        <LongField label="Como a família descreve o aluno?" value={form.descricaoFamilia} onChange={(value) => setField('descricaoFamilia', value)} />
        <LongField label="Quais são seus principais interesses e/ou potencialidades?" value={form.interessesPotencialidades} onChange={(value) => setField('interessesPotencialidades', value)} />
        <LongField label="Quais atividades ele mais gosta?" value={form.atividadesPreferidas} onChange={(value) => setField('atividadesPreferidas', value)} />
        <LongField label="Existe alguma dificuldade importante?" value={form.dificuldadeImportante} onChange={(value) => setField('dificuldadeImportante', value)} />
        <LongField label="Existe alguma orientação importante para a escola?" value={form.orientacaoEscola} onChange={(value) => setField('orientacaoEscola', value)} />
      </FormSection>
    );
  }

  function renderHealth() {
    return (
      <>
        <FormSection title="Diagnósticos">
          <Text style={styles.muted}>Os diagnósticos do cadastro inicial já aparecem abaixo e podem ser complementados.</Text>
          <RepeatableAnamneseList title="Diagnósticos" addLabel="Adicionar diagnóstico" items={form.diagnosticos} emptyItem={{ nome: '', cid: '' }} fields={DIAGNOSTICO_FIELDS} onChange={(value) => setField('diagnosticos', value)} />
        </FormSection>
        <FormSection title="Medicação">
          <Text style={styles.formFieldLabel}>Faz uso de medicação?</Text>
          <ChoiceChips options={['Sim', 'Não']} value={form.usaMedicacao == null ? null : form.usaMedicacao ? 'Sim' : 'Não'} multiple={false} onChange={(value) => setField('usaMedicacao', value === 'Sim')} />
          {form.usaMedicacao && <RepeatableAnamneseList title="Medicamentos" addLabel="Adicionar medicamento" items={form.medicamentos} emptyItem={{ nome: '', dosagem: '', observacao: '' }} fields={MEDICAMENTO_FIELDS} onChange={(value) => setField('medicamentos', value)} />}
        </FormSection>
        <FormSection title="Terapias">
          <ChoiceChips options={TERAPIA_OPTIONS} value={form.terapias} onChange={(value) => setField('terapias', value)} />
          {form.terapias.includes('Outros') && <TextInput label="Outra terapia" value={form.terapiaOutra} onChangeText={(value) => setField('terapiaOutra', value)} />}
        </FormSection>
        <FormSection title="Outras informações de saúde">
          <LongField label="Possui alergias?" value={form.alergias} onChange={(value) => setField('alergias', value)} />
          <LongField label="Possui restrições alimentares?" value={form.restricoesAlimentares} onChange={(value) => setField('restricoesAlimentares', value)} />
        </FormSection>
      </>
    );
  }

  function renderCommunication() {
    return (
      <FormSection title="Comunicação">
        <Text style={styles.formFieldLabel}>Como o aluno se comunica?</Text>
        <ChoiceChips options={COMUNICACAO_OPTIONS} value={form.comunicacaoTipo} multiple={false} onChange={(value) => setField('comunicacaoTipo', value)} />
        {form.comunicacaoTipo === 'Outra' && <TextInput label="Outra forma de comunicação" value={form.comunicacaoOutra} onChangeText={(value) => setField('comunicacaoOutra', value)} />}
        <LongField label="Como demonstra que precisa de ajuda?" value={form.comoPedeAjuda} onChange={(value) => setField('comoPedeAjuda', value)} />
      </FormSection>
    );
  }

  function renderSchool() {
    return (
      <>
        <FormSection title="Escola">
          <LongField label="Como foi a adaptação escolar?" value={form.adaptacaoEscolar} onChange={(value) => setField('adaptacaoEscolar', value)} />
          <LongField label="Quais estratégias costumam funcionar?" value={form.estrategiasFuncionam} onChange={(value) => setField('estrategiasFuncionam', value)} />
          <LongField label="Existe alguma recomendação do professor anterior?" value={form.recomendacaoProfessorAnterior} onChange={(value) => setField('recomendacaoProfessorAnterior', value)} />
          <LongField label="Observações gerais" value={form.observacoesGerais} onChange={(value) => setField('observacoesGerais', value)} />
        </FormSection>
        <FormSection title="Documentos complementares">
          <Text style={styles.muted}>Os documentos serão vinculados à Anamnese e à Biblioteca do aluno.</Text>
          <Button mode="outlined" icon="paperclip" onPress={() => navigation.navigate('DocumentoForm', { aluno, anamnese: true })}>Adicionar anexo</Button>
          {!!form.anexos.length && <Text style={styles.muted}>{form.anexos.length} documento(s) vinculado(s).</Text>}
        </FormSection>
      </>
    );
  }

  const renders = [renderIdentification, renderFamily, renderGeneral, renderHealth, renderCommunication, renderSchool];

  return (
    <Screen>
      <View style={styles.stepHeader}>
        <View style={styles.documentHeader}>
          <Text style={styles.infoLabel}>Etapa {step} de {ANAMNESE_STEPS.length}</Text>
          <Text style={styles.infoLabel}>{Math.round(progress * 100)}%</Text>
        </View>
        <Text variant="headlineSmall" style={styles.title}>{currentStep.title}</Text>
        <Text style={styles.muted}>{currentStep.subtitle}</Text>
        <ProgressBar progress={progress} color={colors.tealDark} style={styles.stepProgress} />
      </View>
      {renders[step - 1]()}
      <FeedbackMessage type="error" message={error} />
      <View style={styles.stepActions}>
        {step > 1 && <Button mode="outlined" disabled={saving} onPress={back}>Voltar</Button>}
        <Button mode="text" icon="content-save-outline" loading={saving} onPress={() => persist()}>Salvar rascunho</Button>
        <Button mode="contained" icon={step === ANAMNESE_STEPS.length ? 'check' : 'arrow-right'} loading={saving} onPress={next}>
          {step === ANAMNESE_STEPS.length ? 'Concluir anamnese' : 'Salvar e continuar'}
        </Button>
      </View>
      <AppSnackbar visible={!!message} message={message} onDismiss={() => setMessage('')} />
    </Screen>
  );
}
