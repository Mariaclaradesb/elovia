import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, Card, Chip, HelperText, SegmentedButtons, Text } from 'react-native-paper';

import EmptyState from '../../components/EmptyState';
import Screen from '../../components/Screen';
import { PERIODOS } from '../../constants/acompanhamento';
import { useAuth } from '../../context/AuthContext';
import { iniciarSessao } from '../../services/acompanhamentoApi';
import { apiRequest } from '../../services/api';
import { styles } from '../../theme/styles';

export default function IniciarSessaoScreen({ navigation }) {
  const { token } = useAuth();
  const [modo, setModo] = useState('um');
  const [periodo, setPeriodo] = useState('MANHA');
  const [alunos, setAlunos] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/api/alunos', { token })
      .then(setAlunos)
      .catch((err) => setError(err.message));
  }, [token]);

  function toggleAluno(id) {
    setSelecionados((current) => {
      if (modo === 'um') {
        return [id];
      }
      return current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    });
  }

  async function start() {
    if (selecionados.length === 0) {
      setError('Selecione ao menos um aluno.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const sessao = await iniciarSessao(token, {
        alunoIds: selecionados,
        periodo,
        data: new Date().toISOString().slice(0, 10),
      });
      navigation.replace('SessaoAcompanhamento', { sessao });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Card style={styles.card}>
        <Card.Content style={styles.formGap}>
          <Text variant="titleLarge" style={styles.title}>Iniciar Acompanhamento</Text>
          <Text style={styles.muted}>Quantos alunos voce acompanhara nesta sessao?</Text>
          <SegmentedButtons
            value={modo}
            onValueChange={(value) => {
              setModo(value);
              setSelecionados([]);
            }}
            buttons={[
              { value: 'um', label: 'Apenas 1 aluno' },
              { value: 'varios', label: 'Mais de 1 aluno' },
            ]}
          />
          <SegmentedButtons
            value={periodo}
            onValueChange={setPeriodo}
            buttons={PERIODOS.map((item) => ({ value: item.value, label: item.label }))}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content style={styles.formGap}>
          <Text style={styles.sectionTitle}>Alunos vinculados</Text>
          {alunos.length === 0 ? <EmptyState text="Nenhum aluno vinculado." /> : (
            <View style={styles.chipWrap}>
              {alunos.map((aluno) => (
                <Chip
                  key={aluno.id}
                  selected={selecionados.includes(aluno.id)}
                  icon={selecionados.includes(aluno.id) ? 'check' : 'school-outline'}
                  onPress={() => toggleAluno(aluno.id)}
                >
                  {aluno.nome}
                </Chip>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>

      {!!error && <HelperText type="error" visible>{error}</HelperText>}
      <Button mode="contained" icon="play-circle-outline" loading={loading} onPress={start}>Iniciar Sessao</Button>
    </Screen>
  );
}
