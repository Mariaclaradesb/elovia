import { useCallback, useEffect, useState } from 'react';
import { RefreshControl } from 'react-native';
import { HelperText } from 'react-native-paper';

import EmptyState from '../../components/EmptyState';
import HeaderBlock from '../../components/HeaderBlock';
import { AlunoListItem } from '../../components/ListItems';
import Screen from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { colors } from '../../theme';
import { firstName } from '../../utils/text';

export default function MediadorHomeScreen() {
  const { token, user, signOut } = useAuth();
  const [alunos, setAlunos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setAlunos(await apiRequest('/api/alunos', { token }));
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
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.tealDark} />}>
      <HeaderBlock title={`Ola, ${firstName(user?.nome)}`} subtitle="Alunos vinculados" onLogout={signOut} />
      {!!error && <HelperText type="error" visible>{error}</HelperText>}
      {alunos.length === 0 ? <EmptyState text="Nenhum aluno vinculado." /> : alunos.map((aluno) => <AlunoListItem key={aluno.id} aluno={aluno} />)}
    </Screen>
  );
}
