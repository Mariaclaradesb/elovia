import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import FeedbackMessage from '../../components/FeedbackMessage';

import AppLayout from '../../components/AppLayout';
import EmptyState from '../../components/EmptyState';
import AlunoListItem from '../../components/lists/AlunoListItem';
import QuickActionTile from '../../components/QuickActionTile';
import SectionTitle from '../../components/SectionTitle';
import { useAuth } from '../../context/AuthContext';
import { buscarSessaoAtiva } from '../../services/acompanhamentoApi';
import { apiRequest } from '../../services/api';
import { colors } from '../../theme';
import { styles } from '../../theme/styles';

export default function MediadorHomeScreen({ navigation }) {
  const { token } = useAuth();
  const [alunos, setAlunos] = useState([]);
  const [sessaoAtiva, setSessaoAtiva] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setAlunos(await apiRequest('/api/alunos', { token }));
      try {
        setSessaoAtiva(await buscarSessaoAtiva(token));
      } catch {
        setSessaoAtiva(null);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <AppLayout
      navigation={navigation}
      role="MEDIADOR"
      active="home"
      title="Acompanhe, registre e transforme vidas"
      subtitle="O Elovia está aqui para apoiar você no dia a dia."
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.tealDark} />}
    >
      <FeedbackMessage type="error" message={error} />

      <SectionTitle title="Acesso rápido" />
      <View style={styles.actionGrid}>
        <QuickActionTile label="Meus alunos" icon="account-school-outline" color={colors.tealDark} onPress={() => navigation.navigate('MediadorAlunos')} />
        <QuickActionTile label="Sessões" icon="calendar-clock" onPress={() => navigation.navigate('Sessoes')} />
        <QuickActionTile label="Iniciar" icon="play-circle-outline" color={colors.yellow} onPress={() => navigation.navigate('IniciarSessao')} />
      </View>

      {sessaoAtiva ? (
        <Card style={styles.card}>
          <Card.Content style={styles.formGap}>
            <Text variant="titleLarge" style={styles.title}>Sessão em andamento</Text>
            <Text style={styles.muted}>{sessaoAtiva.periodo} - {sessaoAtiva.alunos?.length || 0} aluno(s)</Text>
            <Button mode="contained" icon="play-circle-outline" onPress={() => navigation.navigate('SessaoAcompanhamento', { sessao: sessaoAtiva })}>
              Continuar acompanhamento
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <Button mode="contained" icon="plus-circle-outline" contentStyle={styles.primaryButtonContent} onPress={() => navigation.navigate('IniciarSessao')}>
          Iniciar Acompanhamento
        </Button>
      )}
      <Button mode="outlined" icon="calendar-clock" onPress={() => navigation.navigate('Sessoes')}>
        Ver sessões
      </Button>
      {alunos.length === 0 ? <EmptyState text="Nenhum aluno vinculado." /> : alunos.map((aluno) => (
        <AlunoListItem key={aluno.id} aluno={aluno} onPress={() => navigation.navigate('AlunoProfile', { aluno })} />
      ))}
    </AppLayout>
  );
}
