import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Button, Checkbox, Chip, HelperText, IconButton, ProgressBar, Snackbar, Text, TextInput } from 'react-native-paper';

import DateField from '../../components/DateField';
import FormSection from '../../components/FormSection';
import ListInput from '../../components/ListInput';
import Screen from '../../components/Screen';
import SelectField from '../../components/SelectField';
import StudentPhotoPicker from '../../components/StudentPhotoPicker';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { colors } from '../../theme';
import { styles } from '../../theme/styles';
import { listToText, textToList } from '../../utils/listFields';
import { cleanPhone, formatPhone } from '../../utils/masks';

const STEPS = [
  'Dados pessoais',
  'Responsaveis',
  'Clinico',
  'Associacao',
  'Pedagogico',
];

function initialResponsaveis(aluno) {
  if (aluno?.responsaveis?.length) {
    return aluno.responsaveis.map((item) => ({
      nome: item.nome || '',
      telefone: formatPhone(item.telefone || ''),
      email: item.email || '',
    }));
  }

  return [{
    nome: aluno?.responsavel || '',
    telefone: formatPhone(aluno?.telefoneResponsavel || ''),
    email: aluno?.emailResponsavel || '',
  }];
}

export default function AlunoFormScreen({ route, navigation }) {
  const { token, user } = useAuth();
  const aluno = route.params?.aluno;
  const [step, setStep] = useState(0);
  const [mediadores, setMediadores] = useState([]);
  const [form, setForm] = useState({
    nome: aluno?.nome || '',
    foto: aluno?.foto || '',
    dataNascimento: aluno?.dataNascimento || '',
    sexo: aluno?.sexo || '',
    escola: aluno?.escola || user?.escola || '',
    turma: aluno?.turma || '',
    turno: aluno?.turno || '',
    responsaveis: initialResponsaveis(aluno),
    diagnostico: textToList(aluno?.diagnostico),
    cid: aluno?.cid || '',
    necessitaMediador: aluno?.necessitaMediador || false,
    observacoesIniciais: textToList(aluno?.observacoesIniciais),
    estrategias: textToList(aluno?.estrategias),
    gatilhos: textToList(aluno?.gatilhos),
    preferencias: textToList(aluno?.preferencias),
    interesses: textToList(aluno?.interesses),
    objetivosPdi: textToList(aluno?.objetivosPdi),
    formaComunicacao: textToList(aluno?.formaComunicacao),
    observacoes: aluno?.observacoes || '',
    mediadorIds: aluno?.mediadorIds || [],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/api/mediadores', { token })
      .then((data) => setMediadores(data.filter((item) => item.ativo && item.administradorId === user?.id)))
      .catch((err) => setMessage(err.message));
  }, [token, user?.id]);

  const progress = useMemo(() => (step + 1) / STEPS.length, [step]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function setResponsavel(index, field, value) {
    setForm((current) => ({
      ...current,
      responsaveis: current.responsaveis.map((responsavel, currentIndex) => (
        currentIndex === index ? { ...responsavel, [field]: value } : responsavel
      )),
    }));
  }

  function addResponsavel() {
    setForm((current) => ({
      ...current,
      responsaveis: [...current.responsaveis, { nome: '', telefone: '', email: '' }],
    }));
  }

  function removeResponsavel(index) {
    setForm((current) => ({
      ...current,
      responsaveis: current.responsaveis.length === 1
        ? current.responsaveis
        : current.responsaveis.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function toggleMediador(id) {
    setForm((current) => {
      const selected = current.mediadorIds.includes(id);
      return {
        ...current,
        mediadorIds: selected ? current.mediadorIds.filter((item) => item !== id) : [...current.mediadorIds, id],
      };
    });
  }

  function validatePersonalStep() {
    if (!form.nome.trim() || !form.dataNascimento || !form.sexo || !form.escola.trim() || !form.turma.trim() || !form.turno) {
      return 'Preencha os dados pessoais obrigatorios.';
    }
    return '';
  }

  function validateResponsaveisStep() {
    const validResponsavel = form.responsaveis.some((item) => item.nome.trim() && cleanPhone(item.telefone));
    if (!validResponsavel) {
      return 'Informe pelo menos um responsavel com nome e telefone.';
    }
    return '';
  }

  function validateRequiredSteps() {
    return validatePersonalStep() || validateResponsaveisStep();
  }

  function nextStep() {
    setError('');
    if (step === 0) {
      const validation = validatePersonalStep();
      if (validation) {
        setError(validation);
        return;
      }
    }
    if (step === 1) {
      const validation = validateResponsaveisStep();
      if (validation) {
        setError(validation);
        return;
      }
    }
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  async function save() {
    setError('');
    const validation = validateRequiredSteps();
    if (validation) {
      setError(validation);
      setStep(validation.includes('pessoais') ? 0 : 1);
      return;
    }

    setLoading(true);
    try {
      const responsaveis = form.responsaveis
        .filter((item) => item.nome.trim() || cleanPhone(item.telefone) || item.email.trim())
        .map((item) => ({
          nome: item.nome.trim(),
          telefone: cleanPhone(item.telefone),
          email: item.email.trim(),
        }));
      const principal = responsaveis[0];
      const payload = {
        ...form,
        responsaveis,
        responsavel: principal.nome,
        telefoneResponsavel: principal.telefone,
        emailResponsavel: principal.email,
        diagnostico: listToText(form.diagnostico),
        observacoesIniciais: listToText(form.observacoesIniciais),
        estrategias: listToText(form.estrategias),
        gatilhos: listToText(form.gatilhos),
        preferencias: listToText(form.preferencias),
        interesses: listToText(form.interesses),
        objetivosPdi: listToText(form.objetivosPdi),
        formaComunicacao: listToText(form.formaComunicacao),
      };

      await apiRequest(aluno ? `/api/alunos/${aluno.id}` : '/api/alunos', {
        method: aluno ? 'PUT' : 'POST',
        token,
        body: payload,
      });
      setMessage('Aluno salvo.');
      setTimeout(() => navigation.goBack(), 700);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.stepHeader}>
        <Text style={styles.infoLabel}>Etapa {step + 1} de {STEPS.length}</Text>
        <Text variant="headlineSmall" style={styles.title}>{STEPS[step]}</Text>
        <ProgressBar progress={progress} color={colors.tealDark} style={styles.stepProgress} />
      </View>

      {step === 0 && (
        <FormSection title="Dados pessoais obrigatorios">
          <StudentPhotoPicker value={form.foto} onChange={(value) => setField('foto', value)} onError={setMessage} />
          <TextInput label="Nome" value={form.nome} onChangeText={(value) => setField('nome', value)} />
          <DateField label="Data de nascimento" value={form.dataNascimento} onChange={(value) => setField('dataNascimento', value)} />
          <SelectField
            label="Genero"
            value={form.sexo}
            options={[
              { value: 'Feminino', label: 'Feminino' },
              { value: 'Masculino', label: 'Masculino' },
              { value: 'Outro', label: 'Outro' },
            ]}
            onChange={(value) => setField('sexo', value)}
          />
          <TextInput label="Escola" value={form.escola} editable={false} onChangeText={(value) => setField('escola', value)} />
          <TextInput label="Turma" value={form.turma} onChangeText={(value) => setField('turma', value)} />
          <SelectField
            label="Turno"
            value={form.turno}
            options={[
              { value: 'Matutino', label: 'Matutino' },
              { value: 'Vespertino', label: 'Vespertino' },
              { value: 'Integral', label: 'Integral' },
            ]}
            onChange={(value) => setField('turno', value)}
          />
        </FormSection>
      )}

      {step === 1 && (
        <FormSection title="Responsaveis obrigatorios">
          {form.responsaveis.map((responsavel, index) => (
            <View key={`responsavel-${index}`} style={styles.responsavelBox}>
              <View style={styles.documentHeader}>
                <Text style={styles.sectionTitle}>Responsavel {index + 1}</Text>
                {form.responsaveis.length > 1 && (
                  <IconButton icon="trash-can-outline" iconColor={colors.danger} onPress={() => removeResponsavel(index)} />
                )}
              </View>
              <TextInput label="Nome" value={responsavel.nome} onChangeText={(value) => setResponsavel(index, 'nome', value)} />
              <TextInput label="Telefone" value={responsavel.telefone} onChangeText={(value) => setResponsavel(index, 'telefone', formatPhone(value))} keyboardType="phone-pad" />
              <TextInput label="Email" value={responsavel.email} onChangeText={(value) => setResponsavel(index, 'email', value)} keyboardType="email-address" autoCapitalize="none" />
            </View>
          ))}
          <Button mode="outlined" icon="account-plus-outline" onPress={addResponsavel}>
            Adicionar outro responsavel
          </Button>
        </FormSection>
      )}

      {step === 2 && (
        <FormSection title="Informacoes clinicas">
          <Text style={styles.muted}>Esta etapa pode ser preenchida depois.</Text>
          <ListInput label="Diagnostico" items={form.diagnostico} onChange={(items) => setField('diagnostico', items)} />
          <TextInput label="CID" value={form.cid} onChangeText={(value) => setField('cid', value)} />
          <Checkbox.Item label="Necessita mediador" status={form.necessitaMediador ? 'checked' : 'unchecked'} onPress={() => setField('necessitaMediador', !form.necessitaMediador)} />
          <ListInput label="Observacoes iniciais" items={form.observacoesIniciais} onChange={(items) => setField('observacoesIniciais', items)} />
        </FormSection>
      )}

      {step === 3 && (
        <FormSection title="Associacao com mediadores">
          <Text style={styles.muted}>Voce pode associar agora ou deixar para depois.</Text>
          <View style={styles.chipWrap}>
            {mediadores.map((mediador) => (
              <Chip
                key={mediador.id}
                selected={form.mediadorIds.includes(mediador.id)}
                onPress={() => toggleMediador(mediador.id)}
                icon={form.mediadorIds.includes(mediador.id) ? 'check' : 'account-outline'}
              >
                {mediador.nome}
              </Chip>
            ))}
          </View>
        </FormSection>
      )}

      {step === 4 && (
        <FormSection title="Pedagogico">
          <Text style={styles.muted}>Campos opcionais para complementar o perfil do aluno.</Text>
          <ListInput label="Estrategias que funcionam" items={form.estrategias} onChange={(items) => setField('estrategias', items)} />
          <ListInput label="Gatilhos" items={form.gatilhos} onChange={(items) => setField('gatilhos', items)} />
          <ListInput label="Preferencias" items={form.preferencias} onChange={(items) => setField('preferencias', items)} />
          <ListInput label="Interesses" items={form.interesses} onChange={(items) => setField('interesses', items)} />
          <ListInput label="Objetivos do PDI" items={form.objetivosPdi} onChange={(items) => setField('objetivosPdi', items)} />
          <ListInput label="Forma de comunicacao" items={form.formaComunicacao} onChange={(items) => setField('formaComunicacao', items)} />
        </FormSection>
      )}

      {!!error && <HelperText type="error" visible>{error}</HelperText>}

      <View style={styles.stepActions}>
        {step > 0 && <Button mode="outlined" onPress={() => setStep((current) => current - 1)}>Voltar</Button>}
        {step < STEPS.length - 1 && <Button mode="contained-tonal" onPress={nextStep}>{step <= 1 ? 'Proximo' : 'Pular/Proximo'}</Button>}
        {step >= 2 && step < STEPS.length - 1 && <Button mode="contained" icon="content-save" onPress={save} loading={loading}>Salvar agora</Button>}
        {step === STEPS.length - 1 && <Button mode="contained" icon="check" onPress={save} loading={loading}>Finalizar</Button>}
      </View>

      <Snackbar visible={!!message} onDismiss={() => setMessage('')}>{message}</Snackbar>
    </Screen>
  );
}
