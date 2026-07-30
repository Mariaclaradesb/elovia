import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { ActivityIndicator, IconButton, Searchbar, SegmentedButtons } from 'react-native-paper';

import AppLayout from '../../components/AppLayout';
import AppSnackbar from '../../components/AppSnackbar';
import AlunoListItem from '../../components/lists/AlunoListItem';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { colors } from '../../theme';
import { styles } from '../../theme/styles';

export default function AlunosScreen({ navigation }) {
  const { token, user } = useAuth();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [order, setOrder] = useState('cadastro');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/api/alunos', { token });
      setItems(data.filter((aluno) => aluno.administradorId === user?.id));
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const filtered = items
    .filter((item) => {
      const matchesSearch = `${item.nome} ${item.turma} ${item.escola}`.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'todos'
        || (filter === 'precisa' && item.necessitaMediador)
        || (filter === 'sem' && item.mediadorIds?.length === 0);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => (
      order === 'az'
        ? a.nome.localeCompare(b.nome)
        : new Date(b.criadoEm || 0).getTime() - new Date(a.criadoEm || 0).getTime()
    ));

  async function archive(id) {
    try {
      await apiRequest(`/api/alunos/${id}/desativar`, { method: 'PATCH', token });
      setMessage('Aluno desativado.');
      load();
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <View style={styles.flex}>
      <AppLayout navigation={navigation} role="ADMIN" active="alunos" title="Alunos" subtitle="Consulte e organize os cadastros da escola." showHero={false}>
        <Searchbar placeholder="Pesquisar aluno" value={search} onChangeText={setSearch} style={styles.search} />
        <SegmentedButtons
          value={filter}
          onValueChange={setFilter}
          buttons={[
            { value: 'todos', label: 'Todos' },
            { value: 'precisa', label: 'Necessita' },
            { value: 'sem', label: 'Sem mediador' },
          ]}
        />
        <SegmentedButtons
          value={order}
          onValueChange={setOrder}
          buttons={[
            { value: 'cadastro', label: 'Cadastro' },
            { value: 'az', label: 'A-Z' },
          ]}
        />
        {loading ? <ActivityIndicator color={colors.tealDark} /> : filtered.length === 0 ? (
          <EmptyState text="Nenhum aluno encontrado." />
        ) : filtered.map((aluno) => (
          <AlunoListItem
            key={aluno.id}
            aluno={aluno}
            onPress={() => navigation.navigate('AlunoProfile', { aluno })}
            actions={(
              <View style={styles.rowEnd}>
                <IconButton icon="pencil-outline" onPress={() => navigation.navigate('AlunoForm', { aluno })} />
                {aluno.ativo && <IconButton icon="account-cancel-outline" iconColor={colors.danger} onPress={() => archive(aluno.id)} />}
              </View>
            )}
          />
        ))}
      </AppLayout>
      <AppSnackbar visible={!!message} message={message} onDismiss={() => setMessage('')} />
    </View>
  );
}
