import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { Card, HelperText, Text } from 'react-native-paper';

import AppLayout from '../../components/AppLayout';
import { AlunoListItem, MediadorListItem } from '../../components/ListItems';
import QuickActionTile from '../../components/QuickActionTile';
import SectionTitle from '../../components/SectionTitle';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { colors } from '../../theme';
import { styles } from '../../theme/styles';

export default function AdminHomeScreen({ navigation }) {
  const { token, user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [mediadores, setMediadores] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [dash, alunosData, mediadoresData] = await Promise.all([
        apiRequest('/api/admin/dashboard', { token }),
        apiRequest('/api/alunos', { token }),
        apiRequest('/api/mediadores', { token }),
      ]);
      setDashboard(dash);
      setAlunos(alunosData.filter((aluno) => aluno.administradorId === user?.id));
      setMediadores(mediadoresData.filter((mediador) => mediador.administradorId === user?.id));
    } catch (err) {
      setError(err.message);
    }
  }, [token, user?.id]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <AppLayout
      navigation={navigation}
      role="ADMIN"
      active="home"
      title="Painel Administrativo"
      subtitle="Gerencie alunos, mediadores e dados da escola."
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.tealDark} />}
    >
      {!!error && <HelperText type="error" visible>{error}</HelperText>}

      <Card style={styles.welcomeCard} mode="contained">
        <Card.Content style={styles.brandHeroContent}>
          <View style={styles.flex}>
            <Text variant="titleLarge" style={styles.title}>Organize, acompanhe e cuide</Text>
            <Text style={styles.muted}>Acesse rapidamente os cadastros e indicadores da sua escola.</Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.statsGrid}>
        <StatCard label="Alunos" value={dashboard?.quantidadeAlunos ?? '-'} color={colors.teal} icon="school" />
        <StatCard label="Mediadores" value={dashboard?.quantidadeMediadores ?? '-'} color={colors.purple} icon="account-heart" />
        <StatCard label="Sem mediador" value={dashboard?.quantidadeAlunosSemMediador ?? '-'} color={colors.yellow} icon="account-alert" />
      </View>

      <SectionTitle title="Acesso rapido" />
      <View style={styles.actionGrid}>
        <QuickActionTile label="Alunos" icon="account-school-outline" color={colors.tealDark} onPress={() => navigation.navigate('Alunos')} />
        <QuickActionTile label="Mediadores" icon="account-heart-outline" onPress={() => navigation.navigate('Mediadores')} />
        <QuickActionTile label="Novo aluno" icon="school-outline" color={colors.yellow} onPress={() => navigation.navigate('AlunoForm')} />
        <QuickActionTile label="Novo mediador" icon="account-plus-outline" onPress={() => navigation.navigate('MediadorForm')} />
      </View>

      <SectionTitle title="Últimos cadastros" />
      {alunos.slice(0, 3).map((aluno) => (
        <AlunoListItem
          key={aluno.id}
          aluno={aluno}
          onPress={() => navigation.navigate('AlunoProfile', { aluno })}
        />
      ))}
      {mediadores.slice(0, 3).map((mediador) => (
        <MediadorListItem
          key={mediador.id}
          mediador={mediador}
          onPress={() => navigation.navigate('MediadorForm', { mediador })}
        />
      ))}
    </AppLayout>
  );
}
