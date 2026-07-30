import { useState } from 'react';
import { Image } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import FeedbackMessage from '../../components/FeedbackMessage';

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
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function requestCode() {
    setError('');
    setMessage('');
    setFieldErrors({});
    if (!email.trim()) {
      setFieldErrors({ email: 'Informe seu e-mail.' });
      setError('Revise os campos destacados.');
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
    setFieldErrors({});
    const nextFieldErrors = {
      codigo: !codigo ? 'Informe o codigo recebido.' : '',
      novaSenha: !novaSenha ? 'Informe a nova senha.' : '',
      confirmarSenha: !confirmarSenha ? 'Confirme a nova senha.' : '',
    };

    if (!/^\d{8}$/.test(codigo)) {
      nextFieldErrors.codigo = 'Informe o codigo de 8 digitos recebido por e-mail.';
    }
    if (novaSenha.length < 8) {
      nextFieldErrors.novaSenha = 'A nova senha deve ter pelo menos 8 caracteres.';
    }
    if (novaSenha !== confirmarSenha) {
      nextFieldErrors.confirmarSenha = 'A confirmacao da senha nao confere.';
    }

    if (Object.values(nextFieldErrors).some(Boolean)) {
      setFieldErrors(nextFieldErrors);
      setError('Revise os campos destacados.');
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
              onChangeText={(value) => {
                setEmail(value);
                setFieldErrors((current) => ({ ...current, email: '' }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!codeRequested}
              required
              errorMessage={fieldErrors.email}
              left={<TextInput.Icon icon="email-outline" />}
            />

            {codeRequested && (
              <>
                <TextInput
                  label="Código de 8 dígitos"
                  value={codigo}
                  onChangeText={(value) => {
                    setCodigo(value.replace(/\D/g, '').slice(0, 8));
                    setFieldErrors((current) => ({ ...current, codigo: '' }));
                  }}
                  keyboardType="number-pad"
                  maxLength={8}
                  autoComplete="one-time-code"
                  required
                  errorMessage={fieldErrors.codigo}
                  left={<TextInput.Icon icon="shield-key-outline" />}
                />
                <TextInput
                  label="Nova senha"
                  value={novaSenha}
                  onChangeText={(value) => {
                    setNovaSenha(value);
                    setFieldErrors((current) => ({ ...current, novaSenha: '' }));
                  }}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  required
                  errorMessage={fieldErrors.novaSenha}
                  left={<TextInput.Icon icon="lock-outline" />}
                  right={<TextInput.Icon icon={showPassword ? 'eye-off-outline' : 'eye-outline'} onPress={() => setShowPassword((value) => !value)} />}
                />
                <TextInput
                  label="Confirmar nova senha"
                  value={confirmarSenha}
                  onChangeText={(value) => {
                    setConfirmarSenha(value);
                    setFieldErrors((current) => ({ ...current, confirmarSenha: '' }));
                  }}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  required
                  errorMessage={fieldErrors.confirmarSenha}
                  left={<TextInput.Icon icon="lock-check-outline" />}
                />
              </>
            )}

            <FeedbackMessage type="info" message={message} />
            <FeedbackMessage type="error" message={error} />

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
