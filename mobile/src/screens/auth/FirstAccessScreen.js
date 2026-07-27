import { useState } from 'react';
import { Image } from 'react-native';
import { Button, Card, HelperText, Text, TextInput } from 'react-native-paper';

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

  async function handleSave() {
    setError('');
    if (!novaSenha || !confirmarSenha) {
      setError('Preencha todos os campos.');
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
    <Screen>
      <Image source={require('../../../assets/logo_reduzida.png')} style={styles.firstAccessLogo} resizeMode="contain" />
      <Card style={styles.card}>
        <Card.Content style={styles.formGap}>
          <Text variant="titleLarge" style={styles.title}>Primeiro acesso</Text>
          <Text style={styles.muted}>Para sua seguranca, altere sua senha.</Text>
          <TextInput label="Nova senha" value={novaSenha} onChangeText={setNovaSenha} secureTextEntry />
          <TextInput label="Confirmar senha" value={confirmarSenha} onChangeText={setConfirmarSenha} secureTextEntry />
          {!!error && <HelperText type="error" visible>{error}</HelperText>}
          <Button mode="contained" icon="content-save" onPress={handleSave} loading={loading}>Salvar</Button>
          <Button mode="text" icon="logout" onPress={signOut}>Sair</Button>
        </Card.Content>
      </Card>
    </Screen>
  );
}
