import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { Button, HelperText } from 'react-native-paper';

import HeaderBlock from '../../components/HeaderBlock';
import { AlunoListItem, MediadorListItem } from '../../components/ListItems';
import Screen from '../../components/Screen';
import SectionTitle from '../../components/SectionTitle';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { colors } from '../../theme';
import { styles } from '../../theme/styles';
import { firstName } from '../../utils/text';

export default function AdminHomeScreen({ navigation }) {
  const { token, user, signOut } = useAuth();
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
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.tealDark} />}>
      <HeaderBlock title={`Ola, ${firstName(user?.nome)}`} subtitle="Painel administrativo" onLogout={signOut} />
      {!!error && <HelperText type="error" visible>{error}</HelperText>}

      <View style={styles.statsGrid}>
        <StatCard label="Alunos" value={dashboard?.quantidadeAlunos ?? '-'} color={colors.teal} icon="school" />
        <StatCard label="Mediadores" value={dashboard?.quantidadeMediadores ?? '-'} color={colors.purple} icon="account-heart" />
        <StatCard label="Sem mediador" value={dashboard?.quantidadeAlunosSemMediador ?? '-'} color={colors.yellow} icon="account-alert" />
      </View>

      <View style={styles.quickGrid}>
        <Button mode="contained" icon="account-plus" onPress={() => navigation.navigate('MediadorForm')}>Cadastrar mediador</Button>
        <Button mode="contained-tonal" icon="school" onPress={() => navigation.navigate('AlunoForm')}>Cadastrar aluno</Button>
        <Button mode="outlined" icon="format-list-bulleted" onPress={() => navigation.navigate('Mediadores')}>Lista de mediadores</Button>
        <Button mode="outlined" icon="clipboard-list-outline" onPress={() => navigation.navigate('Alunos')}>Lista de alunos</Button>
      </View>

      <SectionTitle title="Ultimos cadastros" />
      {alunos.slice(0, 3).map((aluno) => (
        <AlunoListItem
          key={aluno.id}
          aluno={aluno}
          onPress={() => navigation.navigate('AlunoForm', { aluno })}
        />
      ))}
      {mediadores.slice(0, 3).map((mediador) => (
        <MediadorListItem
          key={mediador.id}
          mediador={mediador}
          onPress={() => navigation.navigate('MediadorForm', { mediador })}
        />
      ))}
    </Screen>
  );
}
