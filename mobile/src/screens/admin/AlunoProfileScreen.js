import { useState } from 'react';
import { Image, View } from 'react-native';
import { Avatar, Button, Card, Chip, HelperText, SegmentedButtons, Text } from 'react-native-paper';

import InfoGrid from '../../components/InfoGrid';
import ListInput from '../../components/ListInput';
import Screen from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { colors } from '../../theme';
import { styles } from '../../theme/styles';
import { isoToDisplayDate } from '../../utils/date';
import { listToText, textToList } from '../../utils/listFields';
import { initials } from '../../utils/text';

export default function AlunoProfileScreen({ route, navigation }) {
  const { token, user } = useAuth();
  const [aluno, setAluno] = useState(route.params?.aluno || null);
  const [tab, setTab] = useState('info');
  const [editingObservacoes, setEditingObservacoes] = useState(false);
  const [savingObservacoes, setSavingObservacoes] = useState(false);
  const [error, setError] = useState('');
  const [observacoesForm, setObservacoesForm] = useState(() => ({
    observacoesIniciais: textToList(route.params?.aluno?.observacoesIniciais),
    estrategias: textToList(route.params?.aluno?.estrategias),
    gatilhos: textToList(route.params?.aluno?.gatilhos),
    preferencias: textToList(route.params?.aluno?.preferencias),
    interesses: textToList(route.params?.aluno?.interesses),
    objetivosPdi: textToList(route.params?.aluno?.objetivosPdi),
    formaComunicacao: textToList(route.params?.aluno?.formaComunicacao),
    observacoes: textToList(route.params?.aluno?.observacoes),
  }));

  if (!aluno) {
    return (
      <Screen>
        <Text>Aluno não encontrado.</Text>
      </Screen>
    );
  }

  function renderInfo() {
    const responsaveis = aluno.responsaveis?.length
      ? aluno.responsaveis.map((item, index) => `${index + 1}. ${item.nome} - ${item.telefone || 'sem telefone'}${item.email ? ` - ${item.email}` : ''}`).join('\n')
      : `${aluno.responsavel || 'Não informado'}${aluno.telefoneResponsavel ? ` - ${aluno.telefoneResponsavel}` : ''}`;
    const comprometimentos = aluno.comprometimentos?.length
      ? aluno.comprometimentos
        .map((item) => `${item.nome}${item.cid ? ` - CID ${item.cid}` : ' - CID não informado'}`)
        .join('\n')
      : 'Nenhum comprometimento informado';

    return (
      <InfoGrid
        items={[
          { label: 'Escola', value: aluno.escola },
          { label: 'Turma', value: aluno.turma },
          { label: 'Turno', value: aluno.turno },
          { label: 'Gênero', value: aluno.sexo },
          { label: 'Nascimento', value: isoToDisplayDate(aluno.dataNascimento) },
          { label: 'Responsáveis', value: responsaveis, full: true },
          { label: 'Comprometimentos', value: comprometimentos, full: true },
          ...(aluno.emInvestigacao ? [{ label: 'Situação', value: 'Em investigação', full: true }] : []),
        ]}
      />
    );
  }

  function setObservationField(field, value) {
    setObservacoesForm((current) => ({ ...current, [field]: value }));
  }

  async function saveObservacoes() {
    setSavingObservacoes(true);
    setError('');
    try {
      const updated = await apiRequest(`/api/alunos/${aluno.id}/observacoes`, {
        method: 'PATCH',
        token,
        body: {
          observacoesIniciais: listToText(observacoesForm.observacoesIniciais),
          estrategias: listToText(observacoesForm.estrategias),
          gatilhos: listToText(observacoesForm.gatilhos),
          preferencias: listToText(observacoesForm.preferencias),
          interesses: listToText(observacoesForm.interesses),
          objetivosPdi: listToText(observacoesForm.objetivosPdi),
          formaComunicacao: listToText(observacoesForm.formaComunicacao),
          observacoes: listToText(observacoesForm.observacoes),
        },
      });
      setAluno(updated);
      setEditingObservacoes(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingObservacoes(false);
    }
  }

  function renderObservacoes() {
    if (editingObservacoes) {
      return (
        <Card style={styles.card}>
          <Card.Content style={styles.formGap}>
            <ListInput label="Observações iniciais" items={observacoesForm.observacoesIniciais} onChange={(items) => setObservationField('observacoesIniciais', items)} />
            <ListInput label="Estratégias que funcionam" items={observacoesForm.estrategias} onChange={(items) => setObservationField('estrategias', items)} />
            <ListInput label="Gatilhos" items={observacoesForm.gatilhos} onChange={(items) => setObservationField('gatilhos', items)} />
            <ListInput label="Preferências" items={observacoesForm.preferencias} onChange={(items) => setObservationField('preferencias', items)} />
            <ListInput label="Interesses" items={observacoesForm.interesses} onChange={(items) => setObservationField('interesses', items)} />
            <ListInput label="Objetivos do PDI" items={observacoesForm.objetivosPdi} onChange={(items) => setObservationField('objetivosPdi', items)} />
            <ListInput label="Forma de comunicação" items={observacoesForm.formaComunicacao} onChange={(items) => setObservationField('formaComunicacao', items)} />
            <ListInput label="Observações pedagógicas" items={observacoesForm.observacoes} onChange={(items) => setObservationField('observacoes', items)} />
            {!!error && <HelperText type="error" visible>{error}</HelperText>}
            <Button mode="contained" icon="content-save" loading={savingObservacoes} onPress={saveObservacoes}>Salvar observações</Button>
            <Button mode="text" onPress={() => setEditingObservacoes(false)}>Cancelar</Button>
          </Card.Content>
        </Card>
      );
    }

    return (
      <>
        <InfoGrid
          items={[
            { label: 'Observações iniciais', value: aluno.observacoesIniciais, full: true },
            { label: 'Estratégias', value: aluno.estrategias, full: true },
            { label: 'Gatilhos', value: aluno.gatilhos, full: true },
            { label: 'Preferências', value: aluno.preferencias, full: true },
            { label: 'Interesses', value: aluno.interesses, full: true },
            { label: 'Objetivos do PDI', value: aluno.objetivosPdi, full: true },
            { label: 'Forma de comunicação', value: aluno.formaComunicacao, full: true },
            { label: 'Observações pedagógicas', value: aluno.observacoes, full: true },
          ]}
        />
        <Button mode="outlined" icon="note-edit-outline" onPress={() => setEditingObservacoes(true)}>
          Editar observações
        </Button>
      </>
    );
  }

  return (
    <Screen>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.profileHeader}>
            {aluno.foto ? (
              <Image source={{ uri: aluno.foto }} style={styles.profilePhoto} />
            ) : (
              <Avatar.Text size={76} label={initials(aluno.nome)} style={{ backgroundColor: colors.teal }} />
            )}
            <View style={styles.flex}>
              <Text variant="headlineSmall" style={styles.title}>{aluno.nome}</Text>
              <Text style={styles.muted}>{aluno.turma || 'Turma não informada'} - {aluno.turno || 'Turno não informado'}</Text>
              <View style={styles.chipWrap}>
                {!aluno.ativo && <Chip compact style={styles.inactiveChip} textStyle={styles.inactiveChipText}>Desativado</Chip>}
                {aluno.necessitaMediador && <Chip compact>Necessita mediador</Chip>}
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      <SegmentedButtons
        value={tab}
        onValueChange={(nextTab) => {
          if (nextTab === 'biblioteca') {
            navigation.navigate('BibliotecaAluno', { aluno });
            return;
          }
          setTab(nextTab);
        }}
        buttons={[
          { value: 'info', label: 'Informações' },
          { value: 'observacoes', label: 'Observações' },
          { value: 'biblioteca', label: 'Biblioteca' },
          // { value: 'relatorios', label: 'Relatórios' },
        ]}
      />

      {tab === 'info' && renderInfo()}
      {tab === 'observacoes' && renderObservacoes()}
      {/* {tab === 'relatorios' && (
        <Card style={styles.card}>
          <Card.Content style={styles.formGap}>
            <Text style={styles.muted}>Os relatorios ficarao disponiveis nas proximas etapas.</Text>
          </Card.Content>
        </Card> */}

      <Button mode="contained" icon="folder-open-outline" onPress={() => navigation.navigate('BibliotecaAluno', { aluno })}>
        Abrir Biblioteca
      </Button>
      <Button mode="contained-tonal" icon="clipboard-text-outline" onPress={() => navigation.navigate('AnamneseView', { aluno })}>
        Abrir Anamnese
      </Button>
      {user?.role === 'ADMIN' && (
        <Button mode="outlined" icon="pencil-outline" onPress={() => navigation.navigate('AlunoForm', { aluno })}>
          Editar cadastro
        </Button>
      )}
    </Screen>
  );
}
