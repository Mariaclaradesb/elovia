import { useEffect, useState } from 'react';
import { Button, Card, HelperText, Snackbar, Text } from 'react-native-paper';

import TextInput from '../../components/FormTextInput';
import AppLayout from '../../components/AppLayout';
import ProfilePhotoPicker from '../../components/ProfilePhotoPicker';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { atualizarFotoPerfil } from '../../services/perfilApi';
import { colors } from '../../theme';
import { styles } from '../../theme/styles';
import { cleanCpf, cleanPhone, formatCpf, formatPhone } from '../../utils/masks';

export default function PerfilUsuarioScreen({ navigation }) {
  const { token, user, updateUser } = useAuth();
  const role = user?.role === 'ADMIN' ? 'ADMIN' : 'MEDIADOR';
  const [form, setForm] = useState({
    nome: user?.nome || '',
    cpf: formatCpf(user?.cpf || ''),
    email: user?.email || '',
    telefone: formatPhone(user?.telefone || ''),
    escola: user?.escola || '',
    cargo: user?.cargo || '',
    matricula: user?.matricula || '',
  });
  const [loading, setLoading] = useState(false);
  const [foto, setFoto] = useState(user?.foto || '');
  const [fotoArquivo, setFotoArquivo] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/api/auth/me', { token })
      .then((freshUser) => {
        updateUser(freshUser);
        setFoto(freshUser?.foto || '');
        setForm({
          nome: freshUser?.nome || '',
          cpf: formatCpf(freshUser?.cpf || ''),
          email: freshUser?.email || '',
          telefone: formatPhone(freshUser?.telefone || ''),
          escola: freshUser?.escola || '',
          cargo: freshUser?.cargo || '',
          matricula: freshUser?.matricula || '',
        });
      })
      .catch(() => {});
  }, [token, updateUser]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function save() {
    setError('');
    setLoading(true);
    try {
      let updated = await apiRequest('/api/auth/me', {
        method: 'PATCH',
        token,
        body: {
          ...form,
          cpf: cleanCpf(form.cpf),
          telefone: cleanPhone(form.telefone),
        },
      });
      if (fotoArquivo) {
        updated = await atualizarFotoPerfil(token, fotoArquivo);
        setFoto(updated.foto || fotoArquivo.uri);
        setFotoArquivo(null);
      }
      await updateUser(updated);
      setMessage('Perfil atualizado.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout
      navigation={navigation}
      role={role}
      active="more"
      title="Meu perfil"
      subtitle="Atualize seus dados de acesso e identificacao."
    >
      <Card style={styles.gradientCard} mode="contained">
        <Card.Content style={styles.formGap}>
          <Text variant="titleLarge" style={styles.gradientCardTitle}>{form.nome || 'Seu perfil'}</Text>
          <Text style={styles.gradientCardSubtitle}>{role === 'ADMIN' ? 'Administrador' : 'Mediador'} - {form.escola || 'Escola nao informada'}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content style={styles.formGap}>
          <ProfilePhotoPicker
            value={fotoArquivo?.uri || foto}
            onChange={(asset) => {
              setFotoArquivo(asset);
              setFoto(asset.uri);
            }}
            onError={setMessage}
          />
          <TextInput label="Nome completo" value={form.nome} onChangeText={(value) => setField('nome', value)} />
          <TextInput label="CPF" value={form.cpf} onChangeText={(value) => setField('cpf', formatCpf(value))} keyboardType="number-pad" />
          <TextInput label="E-mail" value={form.email} onChangeText={(value) => setField('email', value)} keyboardType="email-address" autoCapitalize="none" />
          <TextInput label="Telefone" value={form.telefone} onChangeText={(value) => setField('telefone', formatPhone(value))} keyboardType="phone-pad" />
          <TextInput label="Escola" value={form.escola} onChangeText={(value) => setField('escola', value)} />
          <TextInput label="Cargo" value={form.cargo} onChangeText={(value) => setField('cargo', value)} />
          <TextInput label="Matricula" value={form.matricula} onChangeText={(value) => setField('matricula', value)} />
        </Card.Content>
      </Card>

      {!!error && <HelperText type="error" visible>{error}</HelperText>}
      <Button mode="contained" icon="content-save" buttonColor={colors.tealDark} onPress={save} loading={loading}>
        Salvar perfil
      </Button>
      <Snackbar visible={!!message} onDismiss={() => setMessage('')}>{message}</Snackbar>
    </AppLayout>
  );
}
