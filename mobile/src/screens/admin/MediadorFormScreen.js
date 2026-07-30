import { useState } from 'react';
import { Keyboard } from 'react-native';
import { Button, Card } from 'react-native-paper';
import FeedbackMessage from '../../components/FeedbackMessage';

import TextInput from '../../components/FormTextInput';
import AppSnackbar from '../../components/AppSnackbar';

import Screen from '../../components/Screen';
import TemporaryPasswordDialog from '../../components/TemporaryPasswordDialog';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { styles } from '../../theme/styles';
import { cleanCpf, cleanPhone, formatCpf, formatPhone } from '../../utils/masks';

export default function MediadorFormScreen({ route, navigation }) {
  const { token, user } = useAuth();
  const mediador = route.params?.mediador;
  const [form, setForm] = useState({
    nome: mediador?.nome || '',
    cpf: formatCpf(mediador?.cpf || ''),
    email: mediador?.email || '',
    telefone: formatPhone(mediador?.telefone || ''),
    escola: mediador?.escola || user?.escola || '',
    cargo: mediador?.cargo || '',
    matricula: mediador?.matricula || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [returnAfterPassword, setReturnAfterPassword] = useState(false);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: '' }));
  }

  async function save() {
    Keyboard.dismiss();
    setError('');
    setFieldErrors({});

    const nextFieldErrors = {
      nome: !form.nome.trim() ? 'Informe o nome do mediador.' : '',
      cpf: !cleanCpf(form.cpf) ? 'Informe o CPF do mediador.' : '',
      telefone: !cleanPhone(form.telefone) ? 'Informe o telefone.' : '',
      email: !form.email.trim() ? 'Informe o e-mail.' : '',
      escola: !form.escola.trim() ? 'Informe a escola.' : '',
      cargo: !form.cargo.trim() ? 'Informe o cargo.' : '',
    };

    if (Object.values(nextFieldErrors).some(Boolean)) {
      setFieldErrors(nextFieldErrors);
      setError('Revise os campos destacados.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        cpf: cleanCpf(form.cpf),
        telefone: cleanPhone(form.telefone),
        escola: user?.escola || form.escola,
      };

      const response = await apiRequest(mediador ? `/api/mediadores/${mediador.id}` : '/api/mediadores', {
        method: mediador ? 'PUT' : 'POST',
        token,
        body: payload,
      });
      if (response.senhaTemporaria) {
        setTemporaryPassword(response.senhaTemporaria);
        setReturnAfterPassword(true);
      } else {
        setMessage('Mediador salvo.');
        setTimeout(() => navigation.goBack(), 900);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function regenerateTemporaryPassword() {
    setError('');
    setLoading(true);
    try {
      const response = await apiRequest(`/api/mediadores/${mediador.id}/redefinir-senha`, {
        method: 'PATCH',
        token,
      });
      setTemporaryPassword(response.senhaTemporaria);
      setReturnAfterPassword(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function closePasswordDialog() {
    setTemporaryPassword('');
    if (returnAfterPassword) navigation.goBack();
  }

  return (
    <Screen>
      <Card style={styles.card}>
        <Card.Content style={styles.formGap}>
          <TextInput label="Nome" value={form.nome} onChangeText={(value) => setField('nome', value)} required errorMessage={fieldErrors.nome} />
          <TextInput label="CPF" value={form.cpf} onChangeText={(value) => setField('cpf', formatCpf(value))} keyboardType="number-pad" required errorMessage={fieldErrors.cpf} />
          <TextInput label="Telefone" placeholder="(00) 0 0000-0000" value={form.telefone} onChangeText={(value) => setField('telefone', formatPhone(value))} keyboardType="phone-pad" required errorMessage={fieldErrors.telefone} />
          <TextInput label="Email" value={form.email} onChangeText={(value) => setField('email', value)} keyboardType="email-address" autoCapitalize="none" required errorMessage={fieldErrors.email} />
          <TextInput label="Escola" value={form.escola} editable={false} required errorMessage={fieldErrors.escola} />
          <TextInput label="Cargo" value={form.cargo} onChangeText={(value) => setField('cargo', value)} required errorMessage={fieldErrors.cargo} />
          <TextInput label="Matrícula" value={form.matricula} onChangeText={(value) => setField('matricula', value)} />
          <FeedbackMessage type="error" message={error} />
          <Button mode="contained" icon="content-save" onPress={save} loading={loading}>Salvar</Button>
          {mediador?.primeiroAcesso && (
            <Button mode="outlined" icon="lock-reset" onPress={regenerateTemporaryPassword} loading={loading}>
              Gerar nova senha temporária
            </Button>
          )}
        </Card.Content>
      </Card>
      <TemporaryPasswordDialog
        visible={!!temporaryPassword}
        password={temporaryPassword}
        mediatorName={form.nome}
        onDismiss={closePasswordDialog}
      />
      <AppSnackbar visible={!!message} message={message} onDismiss={() => setMessage('')} />
    </Screen>
  );
}
