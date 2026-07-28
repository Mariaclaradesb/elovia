import { useState } from 'react';
import { Image } from 'react-native';
import { Button, Card, HelperText, Text } from 'react-native-paper';

import TextInput from '../../components/FormTextInput';
import AuthScreen from '../../components/AuthScreen';
import { apiRequest } from '../../services/api';
import { styles } from '../../theme/styles';

export default function ForgotPasswordScreen({ navigation, route }) {
  const [email, setEmail] = useState(route.params?.email || '');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [codeRequested, setCodeRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function requestCode() {
    setError('');
    setMessage('');
    if (!email.trim()) {
      setError('Informe seu e-mail.');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/api/auth/esqueci-senha', {
        method: 'POST',
        body: { email: email.trim() },
      });
      setCodeRequested(true);
      setMessage('Se o e-mail estiver cadastrado, o código chegará em alguns minutos.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    setError('');
    if (!/^\d{8}$/.test(codigo)) {
      setError('Informe o código de 8 dígitos recebido por e-mail.');
      return;
    }
    if (novaSenha.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setError('A confirmação da senha não confere.');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/api/auth/redefinir-senha', {
        method: 'POST',
        body: {
          email: email.trim(),
          codigo,
          novaSenha,
          confirmarSenha,
        },
      });
      navigation.navigate('Login', {
        email: email.trim(),
        message: 'Senha redefinida. Entre com sua nova senha.',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen contentContainerStyle={styles.registerScroll}>
        <Image source={require('../../../assets/logo_completa.png')} style={styles.registerLogo} resizeMode="contain" />
        <Card style={styles.authCard} mode="contained">
          <Card.Content style={styles.formGap}>
            <Text variant="headlineSmall" style={styles.authTitle}>Recuperar senha</Text>
            <Text style={styles.authSubtitle}>
              {codeRequested ? 'Digite o código recebido e escolha uma nova senha.' : 'Enviaremos um código de verificação para seu e-mail.'}
            </Text>

            <TextInput
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!codeRequested}
              left={<TextInput.Icon icon="email-outline" />}
            />

            {codeRequested && (
              <>
                <TextInput
                  label="Código de 8 dígitos"
                  value={codigo}
                  onChangeText={(value) => setCodigo(value.replace(/\D/g, '').slice(0, 8))}
                  keyboardType="number-pad"
                  maxLength={8}
                  autoComplete="one-time-code"
                  left={<TextInput.Icon icon="shield-key-outline" />}
                />
                <TextInput
                  label="Nova senha"
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  left={<TextInput.Icon icon="lock-outline" />}
                  right={<TextInput.Icon icon={showPassword ? 'eye-off-outline' : 'eye-outline'} onPress={() => setShowPassword((value) => !value)} />}
                />
                <TextInput
                  label="Confirmar nova senha"
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  left={<TextInput.Icon icon="lock-check-outline" />}
                />
              </>
            )}

            {!!message && <HelperText type="info" visible>{message}</HelperText>}
            {!!error && <HelperText type="error" visible>{error}</HelperText>}

            {codeRequested ? (
              <>
                <Button mode="contained" contentStyle={styles.primaryButtonContent} onPress={resetPassword} loading={loading} disabled={loading}>
                  Redefinir senha
                </Button>
                <Button mode="text" onPress={requestCode} disabled={loading}>Reenviar código</Button>
                <Button mode="text" onPress={() => { setCodeRequested(false); setCodigo(''); setMessage(''); }} disabled={loading}>
                  Alterar e-mail
                </Button>
              </>
            ) : (
              <Button mode="contained" contentStyle={styles.primaryButtonContent} onPress={requestCode} loading={loading} disabled={loading}>
                Enviar código
              </Button>
            )}
            <Button mode="text" icon="arrow-left" onPress={() => navigation.navigate('Login')} disabled={loading}>
              Voltar para o login
            </Button>
          </Card.Content>
        </Card>
    </AuthScreen>
  );
}
