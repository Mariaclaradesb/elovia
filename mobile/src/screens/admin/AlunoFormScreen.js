import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, Checkbox, Chip, HelperText, Snackbar, TextInput } from 'react-native-paper';

import DateField from '../../components/DateField';
import FormSection from '../../components/FormSection';
import ListInput from '../../components/ListInput';
import Screen from '../../components/Screen';
import SelectField from '../../components/SelectField';
import StudentPhotoPicker from '../../components/StudentPhotoPicker';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { styles } from '../../theme/styles';
import { listToText, textToList } from '../../utils/listFields';
import { cleanPhone, formatPhone } from '../../utils/masks';

export default function AlunoFormScreen({ route, navigation }) {
  const { token, user } = useAuth();
  const aluno = route.params?.aluno;
  const [mediadores, setMediadores] = useState([]);
  const [form, setForm] = useState({
    nome: aluno?.nome || '',
    foto: aluno?.foto || '',
    dataNascimento: aluno?.dataNascimento || '',
    sexo: aluno?.sexo || '',
    escola: aluno?.escola || '',
    turma: aluno?.turma || '',
    turno: aluno?.turno || '',
    responsavel: aluno?.responsavel || '',
    telefoneResponsavel: formatPhone(aluno?.telefoneResponsavel || ''),
    emailResponsavel: aluno?.emailResponsavel || '',
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

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
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

  async function save() {
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        diagnostico: listToText(form.diagnostico),
        observacoesIniciais: listToText(form.observacoesIniciais),
        estrategias: listToText(form.estrategias),
        gatilhos: listToText(form.gatilhos),
        preferencias: listToText(form.preferencias),
        interesses: listToText(form.interesses),
        objetivosPdi: listToText(form.objetivosPdi),
        formaComunicacao: listToText(form.formaComunicacao),
        telefoneResponsavel: cleanPhone(form.telefoneResponsavel),
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
      <FormSection title="Dados pessoais">
        <StudentPhotoPicker value={form.foto} onChange={(value) => setField('foto', value)} onError={setMessage} />
        <TextInput label="Nome" value={form.nome} onChangeText={(value) => setField('nome', value)} />
        <DateField label="Data de nascimento" value={form.dataNascimento} onChange={(value) => setField('dataNascimento', value)} />
        <SelectField
          label="Gênero"
          value={form.sexo}
          options={[
            { value: 'Feminino', label: 'Feminino' },
            { value: 'Masculino', label: 'Masculino' },
            { value: 'Outro', label: 'Outro' },
          ]}
          onChange={(value) => setField('sexo', value)}
        />
        <TextInput label="Escola" value={form.escola} onChangeText={(value) => setField('escola', value)} />
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

      <FormSection title="Responsavel">
        <TextInput label="Nome" value={form.responsavel} onChangeText={(value) => setField('responsavel', value)} />
        <TextInput label="Telefone" value={form.telefoneResponsavel} onChangeText={(value) => setField('telefoneResponsavel', formatPhone(value))} keyboardType="phone-pad" />
        <TextInput label="Email" value={form.emailResponsavel} onChangeText={(value) => setField('emailResponsavel', value)} keyboardType="email-address" autoCapitalize="none" />
      </FormSection>

      <FormSection title="Informações clínicas">
        <ListInput label="Diagnóstico" items={form.diagnostico} onChange={(items) => setField('diagnostico', items)} />
        <TextInput label="CID" value={form.cid} onChangeText={(value) => setField('cid', value)} />
        <Checkbox.Item label="Necessita mediador" status={form.necessitaMediador ? 'checked' : 'unchecked'} onPress={() => setField('necessitaMediador', !form.necessitaMediador)} />
        <ListInput label="Observações iniciais" items={form.observacoesIniciais} onChange={(items) => setField('observacoesIniciais', items)} />
      </FormSection>

      <FormSection title="Associação">
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

      <FormSection title="Pedagógico">
        <ListInput label="Estratégias que funcionam" items={form.estrategias} onChange={(items) => setField('estrategias', items)} />
        <ListInput label="Gatilhos" items={form.gatilhos} onChange={(items) => setField('gatilhos', items)} />
        <ListInput label="Preferências" items={form.preferencias} onChange={(items) => setField('preferencias', items)} />
        <ListInput label="Interesses" items={form.interesses} onChange={(items) => setField('interesses', items)} />
        <ListInput label="Objetivos do PDI" items={form.objetivosPdi} onChange={(items) => setField('objetivosPdi', items)} />
        <ListInput label="Forma de comunicação" items={form.formaComunicacao} onChange={(items) => setField('formaComunicacao', items)} />
      </FormSection>

      {!!error && <HelperText type="error" visible>{error}</HelperText>}
      <Button mode="contained" icon="content-save" onPress={save} loading={loading}>Salvar</Button>
      <Snackbar visible={!!message} onDismiss={() => setMessage('')}>{message}</Snackbar>
    </Screen>
  );
}
