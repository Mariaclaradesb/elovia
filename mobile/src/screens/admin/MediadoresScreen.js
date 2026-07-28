import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { ActivityIndicator, IconButton, Searchbar, SegmentedButtons, Snackbar } from 'react-native-paper';

import AppLayout from '../../components/AppLayout';
import EmptyState from '../../components/EmptyState';
import { MediadorListItem } from '../../components/ListItems';
import TemporaryPasswordDialog from '../../components/TemporaryPasswordDialog';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { colors } from '../../theme';
import { styles } from '../../theme/styles';

export default function MediadoresScreen({ navigation }) {
  const { token, user } = useAuth();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState('cadastro');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/api/mediadores', { token });
      setItems(data.filter((mediador) => mediador.administradorId === user?.id));
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
    .filter((item) => `${item.nome} ${item.email} ${item.escola}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (
      order === 'az'
        ? a.nome.localeCompare(b.nome)
        : new Date(b.dataCriacao || 0).getTime() - new Date(a.dataCriacao || 0).getTime()
    ));

  async function deactivate(id) {
    try {
      await apiRequest(`/api/mediadores/${id}/desativar`, { method: 'PATCH', token });
      setMessage('Mediador desativado.');
      load();
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function resetPassword(id) {
    try {
      const response = await apiRequest(`/api/mediadores/${id}/redefinir-senha`, { method: 'PATCH', token });
      const mediator = items.find((item) => item.id === id);
      setTemporaryPassword({ value: response.senhaTemporaria, name: mediator?.nome });
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <View style={styles.flex}>
      <AppLayout navigation={navigation} role="ADMIN" active="mediadores" title="Mediadores" subtitle="Equipe vinculada à sua escola." showHero={false}>
        <Searchbar placeholder="Pesquisar" value={search} onChangeText={setSearch} style={styles.search} />
        <SegmentedButtons
          value={order}
          onValueChange={setOrder}
          buttons={[
            { value: 'cadastro', label: 'Cadastro' },
            { value: 'az', label: 'A-Z' },
          ]}
        />
        {loading ? <ActivityIndicator color={colors.tealDark} /> : filtered.length === 0 ? (
          <EmptyState text="Nenhum mediador encontrado." />
        ) : filtered.map((mediador) => (
          <MediadorListItem
            key={mediador.id}
            mediador={mediador}
            onPress={() => navigation.navigate('MediadorForm', { mediador })}
            actions={(
              <View style={styles.rowEnd}>
                <IconButton icon="pencil-outline" onPress={() => navigation.navigate('MediadorForm', { mediador })} />
                {mediador.primeiroAcesso && <IconButton icon="lock-reset" onPress={() => resetPassword(mediador.id)} />}
                {mediador.ativo && <IconButton icon="account-off-outline" iconColor={colors.danger} onPress={() => deactivate(mediador.id)} />}
              </View>
            )}
          />
        ))}
      </AppLayout>
      <TemporaryPasswordDialog
        visible={!!temporaryPassword}
        password={temporaryPassword?.value || ''}
        mediatorName={temporaryPassword?.name}
        onDismiss={() => setTemporaryPassword(null)}
      />
      <Snackbar visible={!!message} onDismiss={() => setMessage('')}>{message}</Snackbar>
    </View>
  );
}
