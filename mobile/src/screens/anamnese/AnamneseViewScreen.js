import { useCallback, useState } from 'react';
import { Linking, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  HelperText,
  List,
  ProgressBar,
  Searchbar,
  Snackbar,
  Text,
} from 'react-native-paper';

import InfoGrid from '../../components/InfoGrid';
import Screen from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import {
  buscarAnamnese,
  buscarNaAnamnese,
  gerarRelatorioAnamnese,
  listarHistoricoAnamnese,
} from '../../services/anamneseApi';
import { colors } from '../../theme';
import { styles } from '../../theme/styles';
import { isoToDisplayDate } from '../../utils/date';

function textList(value) {
  if (Array.isArray(value)) return value.join(', ');
  return value;
}

function AccordionSection({ title, icon, items, children }) {
  return (
    <Card style={styles.card}>
      <List.Accordion title={title} left={(props) => <List.Icon {...props} icon={icon} color={colors.purple} />}>
        <View style={styles.anamneseAccordionContent}>
          {items && <InfoGrid items={items.filter((item) => item.value != null && item.value !== '')} />}
          {children}
        </View>
      </List.Accordion>
    </Card>
  );
}

export default function AnamneseViewScreen({ route, navigation }) {
  const { token, user } = useAuth();
  const aluno = route.params?.aluno;
  const [anamnese, setAnamnese] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await buscarAnamnese(aluno.id, token);
      setAnamnese(data);
      const historyData = await listarHistoricoAnamnese(aluno.id, token).catch(() => []);
      setHistorico(historyData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [aluno?.id, token]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  async function search() {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    try {
      setResults(await buscarNaAnamnese(aluno.id, query, token));
    } catch (err) {
      setError(err.message);
    }
  }

  async function generateDocx() {
    setGenerating(true);
    setError('');
    try {
      const document = await gerarRelatorioAnamnese(aluno.id, token);
      setMessage('DOCX gerado e adicionado à Biblioteca.');
      await load();
      if (document.urlArquivo) await Linking.openURL(document.urlArquivo);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return <Screen><ActivityIndicator size="large" color={colors.tealDark} /></Screen>;
  }

  if (!anamnese) {
    return (
      <Screen>
        <Card style={styles.card}>
          <Card.Content style={styles.formGap}>
            <Text variant="titleLarge" style={styles.title}>Anamnese ainda não preenchida</Text>
            <Text style={styles.muted}>{error || 'O administrador poderá iniciar o questionário no perfil deste aluno.'}</Text>
            {user?.role === 'ADMIN' && (
              <Button mode="contained" onPress={() => navigation.replace('AnamneseWizard', { aluno })}>Iniciar anamnese</Button>
            )}
          </Card.Content>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card style={styles.gradientCard}>
        <Card.Content style={styles.formGap}>
          <Text variant="headlineSmall" style={styles.gradientCardTitle}>Anamnese de {aluno.nome}</Text>
          <Text style={styles.gradientCardSubtitle}>{anamnese.percentualPreenchimento}% das informações preenchidas</Text>
          <ProgressBar progress={anamnese.percentualPreenchimento / 100} color={colors.yellow} style={styles.stepProgress} />
          <Text style={styles.gradientCardSubtitle}>Última atualização por {anamnese.atualizadoPorNome || 'não informado'}</Text>
        </Card.Content>
      </Card>

      <Searchbar
        placeholder="Pesquisar qualquer informação"
        value={query}
        onChangeText={(value) => {
          setQuery(value);
          if (!value) setResults([]);
        }}
        onSubmitEditing={search}
        onIconPress={search}
        style={styles.search}
      />

      {!!query && (
        <Card style={styles.card}>
          <Card.Content style={styles.formGap}>
            <View style={styles.documentHeader}>
              <Text style={styles.sectionTitle}>Resultados da pesquisa</Text>
              <Chip compact>{results.length}</Chip>
            </View>
            {results.map((item, index) => (
              <View key={`${item.secao}-${item.campo}-${index}`} style={styles.anamneseSearchResult}>
                <Text style={styles.infoLabel}>{item.secao} · {item.campo}</Text>
                <Text style={styles.infoValue}>{item.valor}</Text>
              </View>
            ))}
            {!results.length && <Text style={styles.muted}>Digite o termo e toque na lupa para pesquisar.</Text>}
          </Card.Content>
        </Card>
      )}

      <AccordionSection
        title="Identificação"
        icon="account-school-outline"
        items={[
          { label: 'Aluno', value: aluno.nome, full: true },
          { label: 'Escola', value: aluno.escola, full: true },
          { label: 'Turma', value: aluno.turma },
          { label: 'Turno', value: aluno.turno },
          { label: 'Nascimento', value: isoToDisplayDate(aluno.dataNascimento) },
          { label: 'Professor da sala de recursos', value: anamnese.professorSalaRecursos, full: true },
          { label: 'Profissional de apoio', value: anamnese.profissionalApoio, full: true },
          { label: 'Função', value: anamnese.funcaoProfissionalApoio, full: true },
        ]}
      />

      <AccordionSection title="Comprometimentos" icon="medical-bag" items={[
        { label: 'Motivo da matrícula na SRM', value: anamnese.motivoMatriculaSrm, full: true },
      ]}>
        <View style={styles.chipWrap}>
          {anamnese.diagnosticos?.map((item) => (
            <Chip key={item.id || item.nome} icon="heart-pulse">{item.nome}{item.cid ? ` · CID ${item.cid}` : ''}</Chip>
          ))}
        </View>
      </AccordionSection>

      <AccordionSection title="Histórico do aluno" icon="history" items={[
        { label: 'Quem é o aluno?', value: anamnese.quemEAluno, full: true },
        { label: 'Onde mora?', value: anamnese.ondeMora, full: true },
        { label: 'Com quem mora?', value: textList(anamnese.comQuemMora), full: true },
        { label: 'Desenvolvimento', value: anamnese.desenvolvimento, full: true },
        { label: 'Gestação', value: anamnese.gestacao, full: true },
        { label: 'Complicações no parto', value: anamnese.complicacoesParto, full: true },
        { label: 'Irmãos', value: anamnese.possuiIrmaos == null ? null : anamnese.possuiIrmaos ? `Sim (${anamnese.quantidadeIrmaos || 0})` : 'Não' },
        { label: 'Comunicação', value: textList(anamnese.comunicacao), full: true },
      ]} />

      <AccordionSection title="Saúde" icon="heart-pulse" items={[
        { label: 'Uso de medicação', value: anamnese.usaMedicacao == null ? null : anamnese.usaMedicacao ? 'Sim' : 'Não' },
        { label: 'Alergias', value: anamnese.alergias, full: true },
        { label: 'Restrições alimentares', value: anamnese.restricoesAlimentares, full: true },
        { label: 'Crises recorrentes', value: anamnese.crisesRecorrentes, full: true },
        { label: 'Informações médicas', value: anamnese.informacoesMedicas, full: true },
      ]}>
        {anamnese.medicamentos?.map((item, index) => (
          <InfoGrid key={`med-${index}`} items={[
            { label: 'Medicamento', value: item.nome, full: true },
            { label: 'Dosagem', value: item.dosagem },
            { label: 'Horário', value: item.horario },
            { label: 'Observações', value: item.observacoes, full: true },
          ]} />
        ))}
        {anamnese.terapias?.map((item, index) => (
          <InfoGrid key={`terapia-${index}`} items={[
            { label: 'Terapia', value: item.tipo, full: true },
            { label: 'Frequência', value: item.frequencia },
            { label: 'Profissional', value: item.profissional },
            { label: 'Observações', value: item.observacoes, full: true },
          ]} />
        ))}
      </AccordionSection>

      <AccordionSection title="Perfil pedagógico" icon="book-education-outline" items={[
        { label: 'Potencialidades', value: anamnese.potencialidades, full: true },
        { label: 'Interesses', value: anamnese.interesses, full: true },
        { label: 'Maior facilidade', value: anamnese.maiorFacilidade, full: true },
        { label: 'Maior dificuldade', value: anamnese.maiorDificuldade, full: true },
        { label: 'Adaptações', value: anamnese.necessitaAdaptacoes, full: true },
        { label: 'Reação a mudanças', value: anamnese.reacaoMudancas, full: true },
        { label: 'Hiperfoco', value: anamnese.hiperfoco, full: true },
        { label: 'Como aprende melhor', value: textList(anamnese.formasAprendizagem), full: true },
      ]} />

      <AccordionSection title="Família" icon="home-heart" items={[
        { label: 'Responsável respondente', value: anamnese.responsavelRespondente, full: true },
        { label: 'Rotina em casa', value: anamnese.rotinaCasa, full: true },
        { label: 'Expectativas', value: anamnese.expectativasFamilia, full: true },
        { label: 'Orientação importante', value: anamnese.orientacaoImportante, full: true },
        { label: 'Comportamentos fora da escola', value: anamnese.comportamentosForaEscola, full: true },
      ]} />

      <AccordionSection title="Escola" icon="school-outline" items={[
        { label: 'Sala e outros espaços', value: anamnese.observacaoSalaOutrosEspacos, full: true },
        { label: 'Professor regente', value: anamnese.professorRegente, full: true },
        { label: 'Sala de recursos', value: anamnese.salaRecursos, full: true },
        { label: 'Equipe pedagógica', value: anamnese.equipePedagogica, full: true },
        { label: 'Observações gerais', value: anamnese.observacoesGerais, full: true },
      ]} />

      <AccordionSection title="Documentos" icon="folder-multiple-outline">
        {anamnese.anexos?.map((document) => (
          <Button key={document.id} mode="outlined" icon="file-document-outline" onPress={() => navigation.navigate('DocumentoDetails', { documento: document, aluno })}>
            {document.titulo}
          </Button>
        ))}
        {!anamnese.anexos?.length && <Text style={styles.muted}>Nenhum documento vinculado.</Text>}
      </AccordionSection>

      <AccordionSection title="Histórico de edições" icon="clock-edit-outline">
        {historico.slice(0, 20).map((item) => (
          <View key={item.id} style={styles.infoTile}>
            <Text style={styles.infoLabel}>Etapa {item.etapa} · {item.usuarioNome || 'Sistema'}</Text>
            <Text style={styles.infoValue}>{item.resumo}</Text>
            {!!item.editadoEm && <Text style={styles.muted}>{new Date(item.editadoEm).toLocaleString('pt-BR')}</Text>}
          </View>
        ))}
        {!historico.length && <Text style={styles.muted}>Nenhuma edição registrada.</Text>}
      </AccordionSection>

      {!!error && <HelperText type="error" visible>{error}</HelperText>}
      {user?.role === 'ADMIN' && (
        <Button mode="contained" icon="pencil-outline" onPress={() => navigation.navigate('AnamneseWizard', { aluno, startAt: anamnese.etapaAtual })}>
          Editar anamnese
        </Button>
      )}
      <Button mode="contained-tonal" icon="file-word-outline" loading={generating} onPress={generateDocx}>
        Gerar DOCX
      </Button>
      <Button mode="outlined" icon="folder-open-outline" onPress={() => navigation.navigate('BibliotecaAluno', { aluno })}>
        Abrir Biblioteca
      </Button>
      <Snackbar visible={!!message} onDismiss={() => setMessage('')}>{message}</Snackbar>
    </Screen>
  );
}
