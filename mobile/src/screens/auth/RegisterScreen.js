import { useState } from 'react';
import { Image, View } from 'react-native';
import { Button, Card, Checkbox, IconButton, Text } from 'react-native-paper';
import FeedbackMessage from '../../components/FeedbackMessage';

import TextInput from '../../components/FormTextInput';
import AuthScreen from '../../components/AuthScreen';
import AppSnackbar from '../../components/AppSnackbar';

import SelectField from '../../components/SelectField';
import { useAuth } from '../../context/AuthContext';
import { styles } from '../../theme/styles';
import { cleanCpf, cleanPhone, formatCpf, formatPhone } from '../../utils/masks';

export default function RegisterScreen({ navigation }) {
  const { signUpAdmin } = useAuth();
  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    escola: '',
    tipoConta: 'ADMIN',
    senha: '',
    confirmarSenha: '',
  });
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: '' }));
  }

  async function handleRegister() {
    setError('');
    setFieldErrors({});

    if (!accepted) {
      setError('Aceite os termos para continuar.');
      return;
    }

    const nextFieldErrors = {
      nome: !form.nome.trim() ? 'Informe seu nome completo.' : '',
      cpf: !cleanCpf(form.cpf) ? 'Informe seu CPF.' : '',
      email: !form.email.trim() ? 'Informe seu e-mail.' : '',
      telefone: !cleanPhone(form.telefone) ? 'Informe seu telefone.' : '',
      escola: !form.escola.trim() ? 'Informe a escola ou instituição.' : '',
      senha: !form.senha ? 'Informe uma senha.' : '',
      confirmarSenha: !form.confirmarSenha ? 'Confirme sua senha.' : '',
    };

    if (form.senha && form.confirmarSenha && form.senha !== form.confirmarSenha) {
      nextFieldErrors.confirmarSenha = 'A confirmação da senha não confere.';
    }

    if (Object.values(nextFieldErrors).some(Boolean)) {
      setFieldErrors(nextFieldErrors);
      setError('Revise os campos destacados.');
      return;
    }

    setLoading(true);
    try {
      await signUpAdmin({
        nome: form.nome,
        cpf: cleanCpf(form.cpf),
        email: form.email,
        telefone: cleanPhone(form.telefone),
        escola: form.escola,
        senha: form.senha,
        confirmarSenha: form.confirmarSenha,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      contentContainerStyle={styles.registerScroll}
      footer={<AppSnackbar visible={!!message} message={message} onDismiss={() => setMessage('')} />}
    >
        <View style={styles.registerHeader}>
          <IconButton icon="chevron-left" size={32} onPress={() => navigation.goBack()} />
          <View style={styles.flex}>
            <Text variant="headlineMedium" style={styles.authTitle}>Criar conta</Text>
            <Text style={styles.authSubtitle}>Preencha os dados para se cadastrar</Text>
          </View>
        </View>

        <Image source={require('../../../assets/logo_reduzida.png')} style={styles.registerLogo} resizeMode="contain" />

        <Card style={styles.authCard} mode="contained">
          <Card.Content style={styles.formGap}>
            <TextInput mode="outlined" label="Nome completo" value={form.nome} onChangeText={(value) => setField('nome', value)} required errorMessage={fieldErrors.nome} left={<TextInput.Icon icon="account-outline" />} />
            <TextInput mode="outlined" label="CPF" value={form.cpf} onChangeText={(value) => setField('cpf', formatCpf(value))} keyboardType="number-pad" required errorMessage={fieldErrors.cpf} left={<TextInput.Icon icon="card-account-details-outline" />} />
            <TextInput mode="outlined" label="E-mail" value={form.email} onChangeText={(value) => setField('email', value)} keyboardType="email-address" autoCapitalize="none" required errorMessage={fieldErrors.email} left={<TextInput.Icon icon="email-outline" />} />
            <TextInput mode="outlined" label="Telefone" placeholder="(00) 0 0000-0000" value={form.telefone} onChangeText={(value) => setField('telefone', formatPhone(value))} keyboardType="phone-pad" required errorMessage={fieldErrors.telefone} left={<TextInput.Icon icon="phone-outline" />} />
            <TextInput mode="outlined" label="Escola / Instituição" value={form.escola} onChangeText={(value) => setField('escola', value)} required errorMessage={fieldErrors.escola} left={<TextInput.Icon icon="domain" />} />
            <SelectField
              label="Tipo de conta"
              value="Administrador"
              options={[{ label: 'Administrador', value: 'ADMIN' }]}
              onChange={(value) => setField('tipoConta', value)}
            />
            <TextInput
              mode="outlined"
              label="Senha"
              value={form.senha}
              onChangeText={(value) => setField('senha', value)}
              secureTextEntry={!showSenha}
              required
              errorMessage={fieldErrors.senha}
              left={<TextInput.Icon icon="lock-outline" />}
              right={<TextInput.Icon icon={showSenha ? 'eye-off-outline' : 'eye-outline'} onPress={() => setShowSenha((value) => !value)} />}
            />
            <TextInput
              mode="outlined"
              label="Confirmar senha"
              value={form.confirmarSenha}
              onChangeText={(value) => setField('confirmarSenha', value)}
              secureTextEntry={!showConfirmarSenha}
              required
              errorMessage={fieldErrors.confirmarSenha}
              left={<TextInput.Icon icon="lock-check-outline" />}
              right={<TextInput.Icon icon={showConfirmarSenha ? 'eye-off-outline' : 'eye-outline'} onPress={() => setShowConfirmarSenha((value) => !value)} />}
            />

            <Checkbox.Item label="Eu aceito os Termos de Uso e a Política de Privacidade" status={accepted ? 'checked' : 'unchecked'} onPress={() => setAccepted(!accepted)} />
            <FeedbackMessage type="error" message={error} />
            <Button mode="contained" contentStyle={styles.primaryButtonContent} onPress={handleRegister} loading={loading}>Cadastrar</Button>
            <View style={styles.authFooter}>
              <Text style={styles.muted}>Já tem uma conta?</Text>
              <Button mode="text" onPress={() => navigation.goBack()}>Faça login</Button>
            </View>
          </Card.Content>
        </Card>
    </AuthScreen>
  );
}
