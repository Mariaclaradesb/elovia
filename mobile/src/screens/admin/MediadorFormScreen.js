import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Button, Card, HelperText, Snackbar } from 'react-native-paper';

import TextInput from '../../components/FormTextInput';

import Screen from '../../components/Screen';
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

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function save() {
    setError('');
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
        await Clipboard.setStringAsync(response.senhaTemporaria);
        setMessage(`Senha temporaria copiada: ${response.senhaTemporaria}`);
      } else {
        setMessage('Mediador salvo.');
      }
      setTimeout(() => navigation.goBack(), 900);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Card style={styles.card}>
        <Card.Content style={styles.formGap}>
          <TextInput label="Nome" value={form.nome} onChangeText={(value) => setField('nome', value)} />
          <TextInput label="CPF" value={form.cpf} onChangeText={(value) => setField('cpf', formatCpf(value))} keyboardType="number-pad" />
          <TextInput label="Telefone" value={form.telefone} onChangeText={(value) => setField('telefone', formatPhone(value))} keyboardType="phone-pad" />
          <TextInput label="Email" value={form.email} onChangeText={(value) => setField('email', value)} keyboardType="email-address" autoCapitalize="none" />
          <TextInput label="Escola" value={form.escola} editable={false} />
          <TextInput label="Cargo" value={form.cargo} onChangeText={(value) => setField('cargo', value)} />
          <TextInput label="Matricula" value={form.matricula} onChangeText={(value) => setField('matricula', value)} />
          {!!error && <HelperText type="error" visible>{error}</HelperText>}
          <Button mode="contained" icon="content-save" onPress={save} loading={loading}>Salvar</Button>
        </Card.Content>
      </Card>
      <Snackbar visible={!!message} onDismiss={() => setMessage('')}>{message}</Snackbar>
    </Screen>
  );
}
