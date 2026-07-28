import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Button, Card, Checkbox, HelperText, IconButton, Snackbar, Text, TextInput } from 'react-native-paper';

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
  const [message, setMessage] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleRegister() {
    setError('');

    if (!accepted) {
      setError('Aceite os termos para continuar.');
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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.loginWrapper}>
      <ScrollView contentContainerStyle={styles.registerScroll} keyboardShouldPersistTaps="handled">
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
            <TextInput mode="outlined" label="Nome completo" value={form.nome} onChangeText={(value) => setField('nome', value)} left={<TextInput.Icon icon="account-outline" />} />
            <TextInput mode="outlined" label="CPF" value={form.cpf} onChangeText={(value) => setField('cpf', formatCpf(value))} keyboardType="number-pad" left={<TextInput.Icon icon="card-account-details-outline" />} />
            <TextInput mode="outlined" label="E-mail" value={form.email} onChangeText={(value) => setField('email', value)} keyboardType="email-address" autoCapitalize="none" left={<TextInput.Icon icon="email-outline" />} />
            <TextInput mode="outlined" label="Telefone" value={form.telefone} onChangeText={(value) => setField('telefone', formatPhone(value))} keyboardType="phone-pad" left={<TextInput.Icon icon="phone-outline" />} />
            <TextInput mode="outlined" label="Escola / Instituicao" value={form.escola} onChangeText={(value) => setField('escola', value)} left={<TextInput.Icon icon="domain" />} />
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
              left={<TextInput.Icon icon="lock-outline" />}
              right={<TextInput.Icon icon={showSenha ? 'eye-off-outline' : 'eye-outline'} onPress={() => setShowSenha((value) => !value)} />}
            />
            <TextInput
              mode="outlined"
              label="Confirmar senha"
              value={form.confirmarSenha}
              onChangeText={(value) => setField('confirmarSenha', value)}
              secureTextEntry={!showConfirmarSenha}
              left={<TextInput.Icon icon="lock-check-outline" />}
              right={<TextInput.Icon icon={showConfirmarSenha ? 'eye-off-outline' : 'eye-outline'} onPress={() => setShowConfirmarSenha((value) => !value)} />}
            />

            <Checkbox.Item label="Eu aceito os Termos de Uso e a Politica de Privacidade" status={accepted ? 'checked' : 'unchecked'} onPress={() => setAccepted(!accepted)} />
            {!!error && <HelperText type="error" visible>{error}</HelperText>}
            <Button mode="contained" contentStyle={styles.primaryButtonContent} onPress={handleRegister} loading={loading}>Cadastrar</Button>
            <View style={styles.authFooter}>
              <Text style={styles.muted}>Ja tem uma conta?</Text>
              <Button mode="text" onPress={() => navigation.goBack()}>Faça login</Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
      <Snackbar visible={!!message} onDismiss={() => setMessage('')}>{message}</Snackbar>
    </KeyboardAvoidingView>
  );
}
