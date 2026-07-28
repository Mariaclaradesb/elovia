import { useCallback, useEffect, useState } from 'react';
import { RefreshControl } from 'react-native';
import { ActivityIndicator, HelperText, Searchbar, SegmentedButtons, Text } from 'react-native-paper';

import AppLayout from '../../components/AppLayout';
import EmptyState from '../../components/EmptyState';
import { AlunoListItem } from '../../components/ListItems';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { colors } from '../../theme';
import { styles } from '../../theme/styles';

export default function MediadorAlunosScreen({ navigation }) {
  const { token } = useAuth();
  const [alunos, setAlunos] = useState([]);
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState('cadastro');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      setAlunos(await apiRequest('/api/alunos', { token }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const filtered = alunos
    .filter((aluno) => (
      `${aluno.nome} ${aluno.escola} ${aluno.turma}`.toLowerCase().includes(search.toLowerCase())
    ))
    .sort((a, b) => (
      order === 'az'
        ? a.nome.localeCompare(b.nome)
        : new Date(b.criadoEm || 0).getTime() - new Date(a.criadoEm || 0).getTime()
    ));

  return (
    <AppLayout
      navigation={navigation}
      role="MEDIADOR"
      active="alunos"
      title="Meus alunos"
      subtitle="Alunos vinculados ao seu acompanhamento."
      showHero={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.tealDark} />}
    >
      <Text variant="headlineSmall" style={styles.title}>Meus alunos</Text>
      <Text style={styles.muted}>Visualize apenas os alunos vinculados a voce.</Text>
      <Searchbar placeholder="Pesquisar aluno" value={search} onChangeText={setSearch} style={styles.search} />
      <SegmentedButtons
        value={order}
        onValueChange={setOrder}
        buttons={[
          { value: 'cadastro', label: 'Cadastro' },
          { value: 'az', label: 'A-Z' },
        ]}
      />
      {!!error && <HelperText type="error" visible>{error}</HelperText>}
      {loading ? <ActivityIndicator color={colors.tealDark} /> : (
        filtered.length === 0
          ? <EmptyState text="Nenhum aluno encontrado." />
          : filtered.map((aluno) => (
            <AlunoListItem key={aluno.id} aluno={aluno} onPress={() => navigation.navigate('AlunoProfile', { aluno })} />
          ))
      )}
    </AppLayout>
  );
}
