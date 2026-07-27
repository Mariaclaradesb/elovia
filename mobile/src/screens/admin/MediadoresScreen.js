import { useCallback, useEffect, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { View } from 'react-native';
import { ActivityIndicator, FAB, IconButton, Searchbar, Snackbar } from 'react-native-paper';

import { MediadorListItem } from '../../components/ListItems';
import Screen from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { colors } from '../../theme';
import { styles } from '../../theme/styles';

export default function MediadoresScreen({ navigation }) {
  const { token, user } = useAuth();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

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
    .sort((a, b) => a.nome.localeCompare(b.nome));

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
      await Clipboard.setStringAsync(response.senhaTemporaria);
      setMessage(`Senha temporaria copiada: ${response.senhaTemporaria}`);
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <View style={styles.flex}>
      <Screen>
        <Searchbar placeholder="Pesquisar" value={search} onChangeText={setSearch} style={styles.search} />
        {loading ? <ActivityIndicator color={colors.tealDark} /> : filtered.map((mediador) => (
          <MediadorListItem
            key={mediador.id}
            mediador={mediador}
            onPress={() => navigation.navigate('MediadorForm', { mediador })}
            actions={(
              <View style={styles.rowEnd}>
                <IconButton icon="pencil-outline" onPress={() => navigation.navigate('MediadorForm', { mediador })} />
                <IconButton icon="lock-reset" onPress={() => resetPassword(mediador.id)} />
                {mediador.ativo && <IconButton icon="account-off-outline" iconColor={colors.danger} onPress={() => deactivate(mediador.id)} />}
              </View>
            )}
          />
        ))}
      </Screen>
      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate('MediadorForm')} />
      <Snackbar visible={!!message} onDismiss={() => setMessage('')}>{message}</Snackbar>
    </View>
  );
}
