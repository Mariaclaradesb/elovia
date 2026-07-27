import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { ActivityIndicator, FAB, IconButton, Searchbar, SegmentedButtons, Snackbar } from 'react-native-paper';

import { AlunoListItem } from '../../components/ListItems';
import Screen from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { colors } from '../../theme';
import { styles } from '../../theme/styles';

export default function AlunosScreen({ navigation }) {
  const { token, user } = useAuth();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
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

  const filtered = items.filter((item) => {
    const matchesSearch = `${item.nome} ${item.turma} ${item.escola}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'todos'
      || (filter === 'precisa' && item.necessitaMediador)
      || (filter === 'sem' && item.mediadorIds?.length === 0);
    return matchesSearch && matchesFilter;
  });

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
      <Screen>
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
        {loading ? <ActivityIndicator color={colors.tealDark} /> : filtered.map((aluno) => (
          <AlunoListItem
            key={aluno.id}
            aluno={aluno}
            onPress={() => navigation.navigate('AlunoForm', { aluno })}
            actions={(
              <View style={styles.rowEnd}>
                <IconButton icon="pencil-outline" onPress={() => navigation.navigate('AlunoForm', { aluno })} />
                {aluno.ativo && <IconButton icon="account-cancel-outline" iconColor={colors.danger} onPress={() => archive(aluno.id)} />}
              </View>
            )}
          />
        ))}
      </Screen>
      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate('AlunoForm')} />
      <Snackbar visible={!!message} onDismiss={() => setMessage('')}>{message}</Snackbar>
    </View>
  );
}
