import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Button, Searchbar, SegmentedButtons, Text } from 'react-native-paper';

import AppDialog from '../../components/AppDialog';
import AppLayout from '../../components/AppLayout';
import AppSnackbar from '../../components/AppSnackbar';
import EmptyState from '../../components/EmptyState';
import MediadorListItem from '../../components/lists/MediadorListItem';
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
  const [mediadorToDeactivate, setMediadorToDeactivate] = useState(null);

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

  async function deactivate(mediador) {
    if (!mediador?.id) return;
    try {
      await apiRequest(`/api/mediadores/${mediador.id}/desativar`, { method: 'PATCH', token });
      setMessage('Mediador desativado.');
      setMediadorToDeactivate(null);
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
          <EmptyState />
        ) : filtered.map((mediador) => (
          <MediadorListItem
            key={mediador.id}
            mediador={mediador}
            onPress={() => navigation.navigate('MediadorForm', { mediador })}
            actions={[
              { icon: 'pencil', label: 'Editar mediador', onPress: () => navigation.navigate('MediadorForm', { mediador }) },
              ...(mediador.primeiroAcesso ? [{ icon: 'lock-reset', label: 'Redefinir senha', onPress: () => resetPassword(mediador.id) }] : []),
              ...(mediador.ativo ? [{ icon: 'account-off-outline', label: 'Desativar mediador', color: colors.danger, onPress: () => setMediadorToDeactivate(mediador) }] : []),
            ]}
          />
        ))}
      </AppLayout>
      <AppDialog
        visible={!!mediadorToDeactivate}
        title="Desativar mediador?"
        onDismiss={() => setMediadorToDeactivate(null)}
        actions={[
          <Button key="cancel" onPress={() => setMediadorToDeactivate(null)}>Cancelar</Button>,
          <Button key="confirm" mode="contained" buttonColor={colors.danger} onPress={() => deactivate(mediadorToDeactivate)}>
            Desativar
          </Button>,
        ]}
      >
        <Text>Tem certeza que deseja desativar {mediadorToDeactivate?.nome}? Essa pessoa deixará de acessar os alunos vinculados.</Text>
      </AppDialog>
      <TemporaryPasswordDialog
        visible={!!temporaryPassword}
        password={temporaryPassword?.value || ''}
        mediatorName={temporaryPassword?.name}
        onDismiss={() => setTemporaryPassword(null)}
      />
      <AppSnackbar visible={!!message} message={message} onDismiss={() => setMessage('')} />
    </View>
  );
}
