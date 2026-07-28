import { Image, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';
import { styles } from '../../theme/styles';

export default function AboutScreen({ navigation }) {
  const { user } = useAuth();
  const role = user?.role === 'ADMIN' ? 'ADMIN' : 'MEDIADOR';

  return (
    <AppLayout
      navigation={navigation}
      role={role}
      active="more"
      title="Sobre o Elovia"
      subtitle="Um elo para cada jornada, um caminho para cada vida."
    >
      <Card style={styles.aboutCard}>
        <Card.Content style={styles.formGap}>
          <Image source={require('../../../assets/logo_completa.png')} style={styles.aboutLogo} resizeMode="contain" />
          <Text variant="titleLarge" style={styles.title}>Elovia</Text>
          <Text style={styles.infoValue}>
            O Elovia e um aplicativo de acompanhamento escolar criado para organizar cadastros,
            biblioteca digital, sessoes de mediacao e observacoes do dia a dia de forma simples,
            visual e acessivel.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.aboutCard}>
        <Card.Content style={styles.formGap}>
          <Text style={styles.infoLabel}>Desenvolvido por</Text>
          <Text variant="titleMedium" style={[styles.title, { color: colors.purple }]}>
            Maria Clara de Souza Barroso
          </Text>
          <Text style={styles.muted}>
            Projeto academico desenvolvido para apoiar a rotina de administradores e mediadores escolares.
          </Text>
        </Card.Content>
      </Card>
    </AppLayout>
  );
}
