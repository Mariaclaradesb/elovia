import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Button, Searchbar, SegmentedButtons, Text } from 'react-native-paper';

import AppDialog from '../../components/AppDialog';
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
  const [alunoToArchive, setAlunoToArchive] = useState(null);

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

  async function archive(aluno) {
    if (!aluno?.id) return;
    try {
      await apiRequest(`/api/alunos/${aluno.id}/desativar`, { method: 'PATCH', token });
      setMessage('Aluno desativado.');
      setAlunoToArchive(null);
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
          <EmptyState />
        ) : filtered.map((aluno) => (
          <AlunoListItem
            key={aluno.id}
            aluno={aluno}
            onPress={() => navigation.navigate('AlunoProfile', { aluno })}
            actions={[
              { icon: 'pencil', label: 'Editar aluno', onPress: () => navigation.navigate('AlunoForm', { aluno }) },
              ...(aluno.ativo ? [{ icon: 'account-cancel-outline', label: 'Desativar aluno', color: colors.danger, onPress: () => setAlunoToArchive(aluno) }] : []),
            ]}
          />
        ))}
      </AppLayout>
      <AppDialog
        visible={!!alunoToArchive}
        title="Desativar aluno?"
        onDismiss={() => setAlunoToArchive(null)}
        actions={[
          <Button key="cancel" onPress={() => setAlunoToArchive(null)}>Cancelar</Button>,
          <Button key="confirm" mode="contained" buttonColor={colors.danger} onPress={() => archive(alunoToArchive)}>
            Desativar
          </Button>,
        ]}
      >
        <Text>Tem certeza que deseja desativar {alunoToArchive?.nome}? O cadastro ficará indisponível nas listas ativas.</Text>
      </AppDialog>
      <AppSnackbar visible={!!message} message={message} onDismiss={() => setMessage('')} />
    </View>
  );
}
