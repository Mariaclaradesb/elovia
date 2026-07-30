import { useState } from 'react';
import { Image } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import FeedbackMessage from '../../components/FeedbackMessage';

import TextInput from '../../components/FormTextInput';

import Screen from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { styles } from '../../theme/styles';

export default function FirstAccessScreen() {
  const { token, updateUser, signOut } = useAuth();
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  async function handleSave() {
    setError('');
    setFieldErrors({});
    const nextFieldErrors = {
      novaSenha: !novaSenha ? 'Informe a nova senha.' : '',
      confirmarSenha: !confirmarSenha ? 'Confirme a nova senha.' : '',
    };

    if (novaSenha && novaSenha.length < 8) {
      nextFieldErrors.novaSenha = 'A senha deve ter pelo menos 8 caracteres.';
    }
    if (novaSenha && confirmarSenha && novaSenha !== confirmarSenha) {
      nextFieldErrors.confirmarSenha = 'A confirmacao da senha nao confere.';
    }

    if (Object.values(nextFieldErrors).some(Boolean)) {
      setFieldErrors(nextFieldErrors);
      setError('Revise os campos destacados.');
      return;
    }

    setLoading(true);
    try {
      const user = await apiRequest('/api/auth/alterar-senha', {
        method: 'PATCH',
        token,
        body: { senhaAtual: '', novaSenha, confirmarSenha },
      });
      await updateUser(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen topInset>
      <Image source={require('../../../assets/logo_reduzida.png')} style={styles.firstAccessLogo} resizeMode="contain" />
      <Card style={styles.card}>
        <Card.Content style={styles.formGap}>
          <Text variant="titleLarge" style={styles.title}>Primeiro acesso</Text>
          <Text style={styles.muted}>Para sua segurança, altere sua senha.</Text>
          <TextInput
            label="Nova senha"
            value={novaSenha}
            onChangeText={(value) => {
              setNovaSenha(value);
              setFieldErrors((current) => ({ ...current, novaSenha: '' }));
            }}
            secureTextEntry={!showNovaSenha}
            required
            errorMessage={fieldErrors.novaSenha}
            right={<TextInput.Icon icon={showNovaSenha ? 'eye-off-outline' : 'eye-outline'} onPress={() => setShowNovaSenha((value) => !value)} />}
          />
          <TextInput
            label="Confirmar senha"
            value={confirmarSenha}
            onChangeText={(value) => {
              setConfirmarSenha(value);
              setFieldErrors((current) => ({ ...current, confirmarSenha: '' }));
            }}
            secureTextEntry={!showConfirmarSenha}
            required
            errorMessage={fieldErrors.confirmarSenha}
            right={<TextInput.Icon icon={showConfirmarSenha ? 'eye-off-outline' : 'eye-outline'} onPress={() => setShowConfirmarSenha((value) => !value)} />}
          />
          <FeedbackMessage type="error" message={error} />
          <Button mode="contained" icon="content-save" onPress={handleSave} loading={loading}>Salvar</Button>
          <Button mode="text" icon="logout" onPress={signOut}>Sair</Button>
        </Card.Content>
      </Card>
    </Screen>
  );
}
