import { useCallback, useState } from 'react';
import { Linking, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Button, Card, Chip, List, ProgressBar, Searchbar, Text } from 'react-native-paper';
import FeedbackMessage from '../../components/FeedbackMessage';

import AppSnackbar from '../../components/AppSnackbar';
import InfoGrid from '../../components/InfoGrid';
import Screen from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import { buscarAnamnese, buscarNaAnamnese, gerarRelatorioAnamnese, listarHistoricoAnamnese } from '../../services/anamneseApi';
import { obterLinkDocumento } from '../../services/documentosApi';
import { colors } from '../../theme';
import { styles } from '../../theme/styles';
import { isoToDisplayDate } from '../../utils/date';

function textList(value, other) {
  const base = Array.isArray(value) ? value.filter((item) => item !== 'Outros').join(', ') : value;
  return [base, other].filter(Boolean).join(', ');
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
      setAnamnese(await buscarAnamnese(aluno.id, token));
      setHistorico(await listarHistoricoAnamnese(aluno.id, token).catch(() => []));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [aluno?.id, token]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function search() {
    if (!query.trim()) return setResults([]);
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
      if (document.id) {
        const link = await obterLinkDocumento(document.id, token);
        if (link?.urlArquivo) await Linking.openURL(link.urlArquivo);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <Screen><ActivityIndicator size="large" color={colors.tealDark} /></Screen>;
  if (!anamnese) {
    return (
      <Screen><Card style={styles.card}><Card.Content style={styles.formGap}>
        <Text variant="titleLarge" style={styles.title}>Anamnese ainda não preenchida</Text>
        <Text style={styles.muted}>{error || 'O administrador poderá iniciar o questionário no perfil deste aluno.'}</Text>
        {user?.role === 'ADMIN' && <Button mode="contained" onPress={() => navigation.replace('AnamneseWizard', { aluno })}>Iniciar anamnese</Button>}
      </Card.Content></Card></Screen>
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

      <Searchbar placeholder="Pesquisar qualquer informação" value={query} onChangeText={(value) => { setQuery(value); if (!value) setResults([]); }} onSubmitEditing={search} onIconPress={search} style={styles.search} />
      {!!query && <Card style={styles.card}><Card.Content style={styles.formGap}>
        <View style={styles.documentHeader}><Text style={styles.sectionTitle}>Resultados da pesquisa</Text><Chip compact>{results.length}</Chip></View>
        {results.map((item, index) => <View key={`${item.secao}-${item.campo}-${index}`} style={styles.anamneseSearchResult}><Text style={styles.infoLabel}>{item.secao} · {item.campo}</Text><Text style={styles.infoValue}>{item.valor}</Text></View>)}
        {!results.length && <Text style={styles.muted}>Nenhum resultado encontrado.</Text>}
      </Card.Content></Card>}

      <AccordionSection title="Identificação" icon="account-school-outline" items={[
        { label: 'Nome', value: aluno.nome, full: true },
        { label: 'Data de nascimento', value: isoToDisplayDate(aluno.dataNascimento) },
        { label: 'Série', value: anamnese.serie }, { label: 'Turma', value: aluno.turma }, { label: 'Turno', value: aluno.turno },
        { label: 'Responsável', value: anamnese.responsavelNome, full: true },
        { label: 'Parentesco', value: anamnese.responsavelParentesco }, { label: 'Telefone', value: anamnese.responsavelTelefone },
      ]} />

      <AccordionSection title="Informações familiares" icon="home-heart" items={[
        { label: 'Com quem mora?', value: textList(anamnese.comQuemMora, anamnese.comQuemMoraOutro), full: true },
        { label: 'Onde mora?', value: anamnese.ondeMora, full: true },
        { label: 'Quem acompanha a rotina escolar?', value: anamnese.acompanhaRotinaEscolar, full: true },
      ]} />

      <AccordionSection title="Informações gerais" icon="account-details-outline" items={[
        { label: 'Como a família descreve o aluno?', value: anamnese.descricaoFamilia, full: true },
        { label: 'Interesses e potencialidades', value: anamnese.interessesPotencialidades, full: true },
        { label: 'Atividades preferidas', value: anamnese.atividadesPreferidas, full: true },
        { label: 'Dificuldade importante', value: anamnese.dificuldadeImportante, full: true },
        { label: 'Orientação para a escola', value: anamnese.orientacaoEscola, full: true },
      ]} />

      <AccordionSection title="Saúde" icon="heart-pulse" items={[
        { label: 'Uso de medicação', value: anamnese.usaMedicacao == null ? null : anamnese.usaMedicacao ? 'Sim' : 'Não' },
        { label: 'Terapias', value: textList(anamnese.terapias, anamnese.terapiaOutra), full: true },
        { label: 'Alergias', value: anamnese.alergias, full: true },
        { label: 'Restrições alimentares', value: anamnese.restricoesAlimentares, full: true },
      ]}>
        <View style={styles.chipWrap}>{anamnese.diagnosticos?.map((item) => <Chip key={item.id || `${item.nome}-${item.cid}`} icon="medical-bag">{item.nome}{item.cid ? ` · CID ${item.cid}` : ''}</Chip>)}</View>
        {anamnese.medicamentos?.map((item, index) => <InfoGrid key={`med-${index}`} items={[
          { label: 'Medicamento', value: item.nome, full: true }, { label: 'Dosagem', value: item.dosagem }, { label: 'Observação', value: item.observacao, full: true },
        ]} />)}
      </AccordionSection>

      <AccordionSection title="Comunicação" icon="message-text-outline" items={[
        { label: 'Como se comunica?', value: textList(anamnese.comunicacaoTipo, anamnese.comunicacaoOutra), full: true },
        { label: 'Como demonstra que precisa de ajuda?', value: anamnese.comoPedeAjuda, full: true },
      ]} />

      <AccordionSection title="Escola" icon="school-outline" items={[
        { label: 'Adaptação escolar', value: anamnese.adaptacaoEscolar, full: true },
        { label: 'Estratégias que funcionam', value: anamnese.estrategiasFuncionam, full: true },
        { label: 'Recomendação do professor anterior', value: anamnese.recomendacaoProfessorAnterior, full: true },
        { label: 'Observações gerais', value: anamnese.observacoesGerais, full: true },
      ]} />

      <AccordionSection title="Documentos" icon="folder-multiple-outline">
        {anamnese.anexos?.map((document) => <Button key={document.id} mode="outlined" icon="file-document-outline" onPress={() => navigation.navigate('DocumentoDetails', { documento: document, aluno })}>{document.titulo}</Button>)}
        {!anamnese.anexos?.length && <Text style={styles.muted}>Nenhum documento vinculado.</Text>}
      </AccordionSection>

      <AccordionSection title="Histórico de edições" icon="clock-edit-outline">
        {historico.slice(0, 20).map((item) => <View key={item.id} style={styles.infoTile}><Text style={styles.infoLabel}>Etapa {item.etapa} · {item.usuarioNome || 'Sistema'}</Text><Text style={styles.infoValue}>{item.resumo}</Text>{!!item.editadoEm && <Text style={styles.muted}>{new Date(item.editadoEm).toLocaleString('pt-BR')}</Text>}</View>)}
        {!historico.length && <Text style={styles.muted}>Nenhuma edição registrada.</Text>}
      </AccordionSection>

      <FeedbackMessage type="error" message={error} />
      {user?.role === 'ADMIN' && <Button mode="contained" icon="pencil-outline" onPress={() => navigation.navigate('AnamneseWizard', { aluno, startAt: anamnese.etapaAtual })}>Editar anamnese</Button>}
      <Button mode="contained-tonal" icon="file-word-outline" loading={generating} onPress={generateDocx}>Gerar DOCX</Button>
      <Button mode="outlined" icon="folder-open-outline" onPress={() => navigation.navigate('BibliotecaAluno', { aluno })}>Abrir Biblioteca</Button>
      <AppSnackbar visible={!!message} message={message} onDismiss={() => setMessage('')} />
    </Screen>
  );
}
