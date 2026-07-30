import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import FeedbackMessage from '../../components/FeedbackMessage';

import TextInput from '../../components/FormTextInput';
import AuthScreen from '../../components/AuthScreen';
import AppSnackbar from '../../components/AppSnackbar';
import { useAuth } from '../../context/AuthContext';
import { styles } from '../../theme/styles';

export default function LoginScreen({ navigation, route }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState(route.params?.email || '');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState(route.params?.message || '');
  const [showSenha, setShowSenha] = useState(false);

  useEffect(() => {
    if (route.params?.email) setEmail(route.params.email);
    if (route.params?.message) setMessage(route.params.message);
  }, [route.params?.email, route.params?.message]);

  async function handleLogin() {
    setError('');
    setFieldErrors({});

    const nextFieldErrors = {
      email: !email.trim() ? 'Informe seu e-mail.' : '',
      senha: !senha ? 'Informe sua senha.' : '',
    };
    if (Object.values(nextFieldErrors).some(Boolean)) {
      setFieldErrors(nextFieldErrors);
      setError('Revise os campos destacados.');
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

  return (
    <AuthScreen
      contentContainerStyle={styles.loginScroll}
      footer={<AppSnackbar visible={!!message} message={message} onDismiss={() => setMessage('')} />}
    >
        <View style={styles.authHero}>
          <Image source={require('../../../assets/logo_completa.png')} style={styles.loginLogo} resizeMode="contain" />
          <View style={styles.authCurve} />
        </View>

        <Card style={styles.authCard} mode="contained">
          <Card.Content style={styles.formGap}>
            <Text variant="headlineSmall" style={styles.authTitle}>Bem-vindo(a)!</Text>
            <Text style={styles.authSubtitle}>Faça login para acessar sua conta</Text>
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
              required
              errorMessage={fieldErrors.email}
              left={<TextInput.Icon icon="email-outline" />}
            />
            <TextInput
              label="Senha"
              value={senha}
              onChangeText={(value) => {
                setSenha(value);
                setFieldErrors((current) => ({ ...current, senha: '' }));
              }}
              secureTextEntry={!showSenha}
              autoComplete="current-password"
              required
              errorMessage={fieldErrors.senha}
              left={<TextInput.Icon icon="lock-outline" />}
              right={<TextInput.Icon icon={showSenha ? 'eye-off-outline' : 'eye-outline'} onPress={() => setShowSenha((value) => !value)} />}
            />
            <FeedbackMessage type="error" message={error} />
            {/*
            <Button mode="text" style={styles.alignEnd} onPress={() => navigation.navigate('ForgotPassword', { email: email.trim() })}>
              Esqueci minha senha
            </Button>
            */}
            <Button mode="contained" contentStyle={styles.primaryButtonContent} onPress={handleLogin} loading={loading} disabled={loading}>
              Entrar
            </Button>
            <View style={styles.authFooter}>
              <Text style={styles.muted}>Não tem uma conta?</Text>
              <Button mode="text" onPress={() => navigation.navigate('Register')}>Cadastre-se</Button>
            </View>
          </Card.Content>
        </Card>
    </AuthScreen>
  );
}
