import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Button, Card, Dialog, HelperText, Portal, Snackbar, Text } from 'react-native-paper';

import TextInput from '../../components/FormTextInput';

import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { styles } from '../../theme/styles';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('admin@elovia.test');
  const [senha, setSenha] = useState('Admin12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showSenha, setShowSenha] = useState(false);

  async function handleLogin() {
    setError('');

    if (!email || !senha) {
      setError('Informe email e senha.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, senha);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    try {
      await apiRequest('/api/auth/esqueci-senha', {
        method: 'POST',
        body: { email: forgotEmail.trim() },
      });
      setMessage('Se o email existir, enviaremos as instrucoes de redefinicao.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setForgotOpen(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.loginWrapper}>
      <ScrollView contentContainerStyle={styles.loginScroll} keyboardShouldPersistTaps="handled">
        <View style={styles.authHero}>
          <Image source={require('../../../assets/logo_completa.png')} style={styles.loginLogo} resizeMode="contain" />
          <View style={styles.authCurve} />
        </View>

        <Card style={styles.authCard} mode="contained">
          <Card.Content style={styles.formGap}>
            <Text variant="headlineSmall" style={styles.authTitle}>Bem-vindo(a)!</Text>
            <Text style={styles.authSubtitle}>Faça login para acessar sua conta</Text>
            <TextInput mode="outlined" label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" left={<TextInput.Icon icon="email-outline" />} />
            <TextInput
              mode="outlined"
              label="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!showSenha}
              left={<TextInput.Icon icon="lock-outline" />}
              right={<TextInput.Icon icon={showSenha ? 'eye-off-outline' : 'eye-outline'} onPress={() => setShowSenha((value) => !value)} />}
            />
            {!!error && <HelperText type="error" visible>{error}</HelperText>}
            <Button mode="text" style={styles.alignEnd} onPress={() => { setForgotEmail(email); setForgotOpen(true); }}>Esqueci minha senha</Button>
            <Button mode="contained" contentStyle={styles.primaryButtonContent} onPress={handleLogin} loading={loading} disabled={loading}>Entrar</Button>
            <View style={styles.authFooter}>
              <Text style={styles.muted}>Não tem uma conta?</Text>
              <Button mode="text" onPress={() => navigation.navigate('Register')}>Cadastre-se</Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <Portal>
        <Dialog visible={forgotOpen} onDismiss={() => setForgotOpen(false)} style={styles.appDialog}>
          <Dialog.Title>Recuperacao de senha</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Email" value={forgotEmail} onChangeText={setForgotEmail} keyboardType="email-address" autoCapitalize="none" />
          </Dialog.Content>
          <Dialog.Actions style={styles.appDialogActions}>
            <Button onPress={() => setForgotOpen(false)}>Cancelar</Button>
            <Button onPress={handleForgotPassword}>Enviar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Snackbar visible={!!message} onDismiss={() => setMessage('')}>{message}</Snackbar>
    </KeyboardAvoidingView>
  );
}
