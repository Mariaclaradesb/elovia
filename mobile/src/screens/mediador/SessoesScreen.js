import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { Button, Card, Chip, HelperText, Text } from 'react-native-paper';

import AppLayout from '../../components/AppLayout';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { listarSessoes } from '../../services/acompanhamentoApi';
import { colors } from '../../theme';
import { styles } from '../../theme/styles';
import { isoToDisplayDate } from '../../utils/date';

function hora(value) {
  if (!value) return '';
  return new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function SessoesScreen({ navigation }) {
  const { token } = useAuth();
  const [sessoes, setSessoes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setSessoes(await listarSessoes(token));
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const ativa = useMemo(() => sessoes.find((sessao) => sessao.status === 'ABERTA'), [sessoes]);
  const historico = sessoes.filter((sessao) => sessao.status !== 'ABERTA');

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <AppLayout
      navigation={navigation}
      role="MEDIADOR"
      active="sessoes"
      title="Acompanhamento"
      subtitle="Retome sessoes em andamento ou consulte o historico."
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.tealDark} />}
      showHero={false}
    >
      <View style={styles.documentHeader}>
        <View style={styles.flex}>
          <Text variant="headlineSmall" style={styles.title}>Sessoes</Text>
          <Text style={styles.muted}>Continue uma sessao ativa ou consulte registros anteriores.</Text>
        </View>
        <Button mode="contained" icon="plus" onPress={() => navigation.navigate('IniciarSessao')}>
          Nova
        </Button>
      </View>

      {!!error && <HelperText type="error" visible>{error}</HelperText>}

      {ativa && (
        <>
          <Text style={styles.sectionTitle}>Em andamento</Text>
          <SessaoCard sessao={ativa} onPress={() => navigation.navigate('SessaoAcompanhamento', { sessao: ativa })} />
        </>
      )}

      <Text style={styles.sectionTitle}>Historico</Text>
      {historico.length === 0 ? <EmptyState text="Nenhuma sessao finalizada." /> : historico.map((sessao) => (
        <SessaoCard key={sessao.id} sessao={sessao} onPress={() => navigation.navigate('SessaoAcompanhamento', { sessao })} />
      ))}
    </AppLayout>
  );
}

function SessaoCard({ sessao, onPress }) {
  const aberta = sessao.status === 'ABERTA';
  return (
    <Card style={[styles.card, aberta && styles.activeSessionCard]} onPress={onPress}>
      <Card.Content style={styles.formGap}>
        <View style={styles.documentHeader}>
          <View style={styles.flex}>
            <Text variant="titleMedium" style={styles.itemTitle}>
              {isoToDisplayDate(sessao.data)} - {sessao.periodo}
            </Text>
            <Text style={styles.muted}>
              Início {hora(sessao.inicio)} {sessao.fim ? `- Fim ${hora(sessao.fim)}` : ''}
            </Text>
          </View>
          <Chip compact style={aberta ? styles.activeChip : styles.inactiveChip}>
            {aberta ? 'Aberta' : 'Finalizada'}
          </Chip>
        </View>
        <View style={styles.chipWrap}>
          {sessao.alunos?.map((aluno) => (
            <Chip key={aluno.id} compact icon="school-outline">
              {aluno.nome} ({aluno.quantidadeRegistros || 0})
            </Chip>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
}
