import { useEffect, useState } from 'react';
import { Button, Card, Text } from 'react-native-paper';
import FeedbackMessage from '../../components/FeedbackMessage';

import TextInput from '../../components/FormTextInput';
import AppLayout from '../../components/AppLayout';
import AppSnackbar from '../../components/AppSnackbar';
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
  const [fieldErrors, setFieldErrors] = useState({});

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
    setFieldErrors((current) => ({ ...current, [field]: '' }));
  }

  async function save() {
    setError('');
    setFieldErrors({});
    const nextFieldErrors = {
      nome: !form.nome.trim() ? 'Informe seu nome completo.' : '',
      cpf: !cleanCpf(form.cpf) ? 'Informe seu CPF.' : '',
      email: !form.email.trim() ? 'Informe seu e-mail.' : '',
    };

    if (Object.values(nextFieldErrors).some(Boolean)) {
      setFieldErrors(nextFieldErrors);
      setError('Revise os campos destacados.');
      return;
    }

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
      subtitle="Atualize seus dados de acesso e identificação."
    >
      <Card style={styles.gradientCard} mode="contained">
        <Card.Content style={styles.formGap}>
          <Text variant="titleLarge" style={styles.gradientCardTitle}>{form.nome || 'Seu perfil'}</Text>
          <Text style={styles.gradientCardSubtitle}>{role === 'ADMIN' ? 'Administrador' : 'Mediador'} - {form.escola || 'Escola não informada'}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content style={styles.formGap}>
          <ProfilePhotoPicker
            value={foto}
            onChange={(asset) => {
              setFotoArquivo(asset);
              if (asset.skipPreview) {
                setMessage('Foto capturada. Toque em Salvar perfil para atualizar.');
                return;
              }
              setFoto(asset.uri);
            }}
            onError={setMessage}
          />
          <TextInput label="Nome completo" value={form.nome} onChangeText={(value) => setField('nome', value)} required errorMessage={fieldErrors.nome} />
          <TextInput label="CPF" value={form.cpf} onChangeText={(value) => setField('cpf', formatCpf(value))} keyboardType="number-pad" required errorMessage={fieldErrors.cpf} />
          <TextInput label="E-mail" value={form.email} onChangeText={(value) => setField('email', value)} keyboardType="email-address" autoCapitalize="none" required errorMessage={fieldErrors.email} />
          <TextInput label="Telefone" placeholder="(00) 0 0000-0000" value={form.telefone} onChangeText={(value) => setField('telefone', formatPhone(value))} keyboardType="phone-pad" />
          <TextInput label="Escola" value={form.escola} onChangeText={(value) => setField('escola', value)} />
          <TextInput label="Cargo" value={form.cargo} onChangeText={(value) => setField('cargo', value)} />
          <TextInput label="Matrícula" value={form.matricula} onChangeText={(value) => setField('matricula', value)} />
        </Card.Content>
      </Card>

      <FeedbackMessage type="error" message={error} />
      <Button mode="contained" icon="content-save" buttonColor={colors.tealDark} onPress={save} loading={loading}>
        Salvar perfil
      </Button>
      <AppSnackbar visible={!!message} message={message} onDismiss={() => setMessage('')} />
    </AppLayout>
  );
}
