import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Button, Chip, Dialog, IconButton, Portal, ProgressBar, Text } from 'react-native-paper';
import FeedbackMessage from '../../components/FeedbackMessage';

import AppSnackbar from '../../components/AppSnackbar';
import DateField from '../../components/DateField';
import ComprometimentosInput from '../../components/ComprometimentosInput';
import TextInput from '../../components/FormTextInput';
import FormSection from '../../components/FormSection';
import ListInput from '../../components/ListInput';
import Screen from '../../components/Screen';
import SelectField from '../../components/SelectField';
import StudentPhotoPicker from '../../components/StudentPhotoPicker';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { atualizarFotoAluno } from '../../services/alunoFotosApi';
import { colors } from '../../theme';
import { styles } from '../../theme/styles';
import { normalizeDateForApi } from '../../utils/date';
import { getDisplayImageUri } from '../../utils/imageUri';
import { listToText, textToList } from '../../utils/listFields';
import { cleanPhone, formatPhone } from '../../utils/masks';

const STEPS = [
  'Dados pessoais',
  'Responsáveis',
  'Clínico',
  'Associação',
  'Pedagógico',
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

function initialComprometimentos(aluno) {
  if (aluno?.comprometimentos?.length) {
    return aluno.comprometimentos.map((item) => ({
      nome: item.nome || '',
      cid: item.cid || '',
    }));
  }

  const legados = textToList(aluno?.diagnostico);
  if (legados.length) {
    return legados.map((nome, index) => ({
      nome,
      cid: index === 0 ? aluno?.cid || '' : '',
    }));
  }

  return [{ nome: '', cid: '' }];
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
    comprometimentos: initialComprometimentos(aluno),
    emInvestigacao: aluno?.emInvestigacao || false,
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [savedAluno, setSavedAluno] = useState(null);
  const [showAnamneseChoice, setShowAnamneseChoice] = useState(false);
  const [fotoArquivo, setFotoArquivo] = useState(null);

  useEffect(() => {
    apiRequest('/api/mediadores', { token })
      .then((data) => setMediadores(data.filter((item) => item.ativo && item.administradorId === user?.id)))
      .catch((err) => setMessage(err.message));
  }, [token, user?.id]);

  const progress = useMemo(() => (step + 1) / STEPS.length, [step]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: '' }));
  }

  function setResponsavel(index, field, value) {
    setForm((current) => ({
      ...current,
      responsaveis: current.responsaveis.map((responsavel, currentIndex) => (
        currentIndex === index ? { ...responsavel, [field]: value } : responsavel
      )),
    }));
    setFieldErrors((current) => ({ ...current, [`responsaveis.${index}.${field}`]: '' }));
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
    setFieldErrors((current) => {
      const next = {};
      Object.entries(current).forEach(([key, value]) => {
        if (!key.startsWith('responsaveis.')) next[key] = value;
      });
      return next;
    });
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

  function getPersonalFieldErrors() {
    const nextFieldErrors = {
      nome: !form.nome.trim() ? 'Informe o nome do aluno.' : '',
      dataNascimento: !form.dataNascimento ? 'Informe a data de nascimento.' : '',
      sexo: !form.sexo ? 'Selecione o genero.' : '',
      escola: !form.escola.trim() ? 'Informe a escola.' : '',
      turma: !form.turma.trim() ? 'Informe a turma.' : '',
      turno: !form.turno ? 'Selecione o turno.' : '',
    };

    if (form.dataNascimento && !normalizeDateForApi(form.dataNascimento)) {
      nextFieldErrors.dataNascimento = 'Informe uma data valida no formato DD-MM-AAAA.';
    }

    return nextFieldErrors;
  }

  function getResponsaveisFieldErrors() {
    const nextFieldErrors = {};

    if (!form.responsaveis.length) {
      nextFieldErrors['responsaveis.0.nome'] = 'Adicione pelo menos um responsavel.';
    }

    form.responsaveis.forEach((item, index) => {
      if (!item.nome.trim()) {
        nextFieldErrors[`responsaveis.${index}.nome`] = 'Informe o nome do responsavel.';
      }
      if (cleanPhone(item.telefone).length < 10) {
        nextFieldErrors[`responsaveis.${index}.telefone`] = 'Informe um telefone valido.';
      }
    });

    return nextFieldErrors;
  }

  function getRequiredFieldErrors() {
    return {
      ...getPersonalFieldErrors(),
      ...getResponsaveisFieldErrors(),
    };
  }

  function nextStep() {
    setError('');
    setFieldErrors({});
    if (step === 0) {
      const validationErrors = getPersonalFieldErrors();
      if (Object.values(validationErrors).some(Boolean)) {
        setFieldErrors(validationErrors);
        setError('Revise os campos destacados.');
        return;
      }
    }
    if (step === 1) {
      const validationErrors = getResponsaveisFieldErrors();
      if (Object.values(validationErrors).some(Boolean)) {
        setFieldErrors(validationErrors);
        setError('Revise os campos destacados.');
        return;
      }
    }
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  async function save() {
    setError('');
    setFieldErrors({});
    const validationErrors = getRequiredFieldErrors();
    if (Object.values(validationErrors).some(Boolean)) {
      setFieldErrors(validationErrors);
      setError('Revise os campos destacados.');
      setStep(Object.keys(validationErrors).some((key) => key.startsWith('responsaveis.')) ? 1 : 0);
      return;
    }

    const cidSemComprometimento = form.comprometimentos.some((item) => item.cid.trim() && !item.nome.trim());
    if (cidSemComprometimento) {
      setError('Informe o comprometimento associado ao CID preenchido.');
      setStep(2);
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
      const comprometimentos = form.comprometimentos
        .filter((item) => item.nome.trim())
        .map((item) => ({ nome: item.nome.trim(), cid: item.cid.trim() }));
      const payload = {
        ...form,
        foto: getDisplayImageUri(form.foto),
        dataNascimento: normalizeDateForApi(form.dataNascimento),
        responsaveis,
        responsavel: principal.nome,
        telefoneResponsavel: principal.telefone,
        emailResponsavel: principal.email,
        comprometimentos,
        observacoesIniciais: listToText(form.observacoesIniciais),
        estrategias: listToText(form.estrategias),
        gatilhos: listToText(form.gatilhos),
        preferencias: listToText(form.preferencias),
        interesses: listToText(form.interesses),
        objetivosPdi: listToText(form.objetivosPdi),
        formaComunicacao: listToText(form.formaComunicacao),
      };

      let saved = await apiRequest(aluno ? `/api/alunos/${aluno.id}` : '/api/alunos', {
        method: aluno ? 'PUT' : 'POST',
        token,
        body: payload,
      });
      if (fotoArquivo) {
        saved = await atualizarFotoAluno(saved.id, token, fotoArquivo);
        setFotoArquivo(null);
      }
      setMessage('Aluno salvo.');
      if (aluno) {
        setTimeout(() => navigation.goBack(), 700);
      } else {
        setSavedAluno(saved);
        setShowAnamneseChoice(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const canSaveNow = (aluno ? step >= 0 : step >= 1) && !Object.values(getRequiredFieldErrors()).some(Boolean);

  return (
    <Screen>
      <View style={styles.stepHeader}>
        <Text style={styles.infoLabel}>Etapa {step + 1} de {STEPS.length}</Text>
        <Text variant="headlineSmall" style={styles.title}>{STEPS[step]}</Text>
        <ProgressBar progress={progress} color={colors.tealDark} style={styles.stepProgress} />
      </View>

      {step === 0 && (
        <FormSection title="Dados pessoais obrigatórios">
          <StudentPhotoPicker
            value={form.foto}
            onChange={(value, asset) => {
              setField('foto', value);
              setFotoArquivo(asset);
            }}
            onError={setMessage}
          />
          <TextInput label="Nome" value={form.nome} onChangeText={(value) => setField('nome', value)} required errorMessage={fieldErrors.nome} />
          <DateField label="Data de nascimento" value={form.dataNascimento} onChange={(value) => setField('dataNascimento', value)} required errorMessage={fieldErrors.dataNascimento} />
          <SelectField
            label="Gênero"
            value={form.sexo}
            options={[
              { value: 'Feminino', label: 'Feminino' },
              { value: 'Masculino', label: 'Masculino' },
              { value: 'Outro', label: 'Outro' },
            ]}
            onChange={(value) => setField('sexo', value)}
            required
            errorMessage={fieldErrors.sexo}
          />
          <TextInput label="Escola" value={form.escola} editable={false} onChangeText={(value) => setField('escola', value)} required errorMessage={fieldErrors.escola} />
          <TextInput label="Turma" value={form.turma} onChangeText={(value) => setField('turma', value)} required errorMessage={fieldErrors.turma} />
          <SelectField
            label="Turno"
            value={form.turno}
            options={[
              { value: 'Matutino', label: 'Matutino' },
              { value: 'Vespertino', label: 'Vespertino' },
              { value: 'Integral', label: 'Integral' },
            ]}
            onChange={(value) => setField('turno', value)}
            required
            errorMessage={fieldErrors.turno}
          />
        </FormSection>
      )}

      {step === 1 && (
        <FormSection title="Responsáveis obrigatórios">
          {form.responsaveis.map((responsavel, index) => (
            <View key={`responsavel-${index}`} style={styles.responsavelBox}>
              <View style={styles.documentHeader}>
                <Text style={styles.sectionTitle}>Responsável {index + 1}</Text>
                {form.responsaveis.length > 1 && (
                  <IconButton icon="trash-can-outline" iconColor={colors.danger} onPress={() => removeResponsavel(index)} />
                )}
              </View>
              <TextInput label="Nome" value={responsavel.nome} onChangeText={(value) => setResponsavel(index, 'nome', value)} required errorMessage={fieldErrors[`responsaveis.${index}.nome`]} />
              <TextInput label="Telefone" placeholder="(00) 0 0000-0000" value={responsavel.telefone} onChangeText={(value) => setResponsavel(index, 'telefone', formatPhone(value))} keyboardType="phone-pad" required errorMessage={fieldErrors[`responsaveis.${index}.telefone`]} />
              <TextInput label="Email" value={responsavel.email} onChangeText={(value) => setResponsavel(index, 'email', value)} keyboardType="email-address" autoCapitalize="none" />
            </View>
          ))}
          <Button mode="outlined" icon="account-plus-outline" onPress={addResponsavel}>
            Adicionar outro responsável
          </Button>
        </FormSection>
      )}

      {step === 2 && (
        <FormSection title="Informações clínicas">
          <Text style={styles.muted}>Esta etapa pode ser preenchida depois.</Text>
          <ComprometimentosInput
            items={form.comprometimentos}
            onChange={(items) => setField('comprometimentos', items)}
            emInvestigacao={form.emInvestigacao}
            onInvestigacaoChange={(value) => setField('emInvestigacao', value)}
          />
          <ListInput label="Observações iniciais" items={form.observacoesIniciais} onChange={(items) => setField('observacoesIniciais', items)} />
        </FormSection>
      )}

      {step === 3 && (
        <FormSection title="Associação com mediadores">
          <Text style={styles.muted}>Você pode associar agora ou deixar para depois.</Text>
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
        <FormSection title="Pedagógico">
          <Text style={styles.muted}>Campos opcionais para complementar o perfil do aluno.</Text>
          <ListInput label="Estratégias que funcionam" items={form.estrategias} onChange={(items) => setField('estrategias', items)} />
          <ListInput label="Gatilhos" items={form.gatilhos} onChange={(items) => setField('gatilhos', items)} />
          <ListInput label="Preferências" items={form.preferencias} onChange={(items) => setField('preferencias', items)} />
          <ListInput label="Interesses" items={form.interesses} onChange={(items) => setField('interesses', items)} />
          <ListInput label="Objetivos do PDI" items={form.objetivosPdi} onChange={(items) => setField('objetivosPdi', items)} />
          <ListInput label="Forma de comunicação" items={form.formaComunicacao} onChange={(items) => setField('formaComunicacao', items)} />
        </FormSection>
      )}

      <FeedbackMessage type="error" message={error} />

      <View style={styles.stepActions}>
        {step > 0 && <Button mode="outlined" onPress={() => setStep((current) => current - 1)}>Voltar</Button>}
        {step < STEPS.length - 1 && <Button mode="contained-tonal" onPress={nextStep}>{step <= 1 ? 'Próximo' : 'Pular/Próximo'}</Button>}
        {canSaveNow && step < STEPS.length - 1 && <Button mode="contained" icon="content-save" onPress={save} loading={loading}>Salvar agora</Button>}
        {step === STEPS.length - 1 && <Button mode="contained" icon="check" onPress={save} loading={loading}>Finalizar</Button>}
      </View>

      <AppSnackbar visible={!!message} message={message} onDismiss={() => setMessage('')} />
      <Portal>
        <Dialog visible={showAnamneseChoice} onDismiss={() => {}} style={styles.appDialog}>
          <Dialog.Title>Aluno cadastrado</Dialog.Title>
          <Dialog.Content>
            <Text>Deseja iniciar a Anamnese de {savedAluno?.nome} agora? Você também poderá preenchê-la depois pelo perfil do aluno.</Text>
          </Dialog.Content>
          <Dialog.Actions style={styles.appDialogActions}>
            <Button onPress={() => {
              setShowAnamneseChoice(false);
              navigation.goBack();
            }}>
              Preencher depois
            </Button>
            <Button mode="contained" onPress={() => {
              setShowAnamneseChoice(false);
              navigation.replace('AnamneseWizard', { aluno: savedAluno });
            }}>
              Iniciar Anamnese
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Screen>
  );
}
