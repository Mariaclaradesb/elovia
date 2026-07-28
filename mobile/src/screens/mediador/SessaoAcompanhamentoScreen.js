import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { Avatar, Button, Card, Chip, Dialog, HelperText, Icon, Portal, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

import TextInput from '../../components/FormTextInput';
import EmptyState from '../../components/EmptyState';
import TimelineItem from '../../components/TimelineItem';
import {
  ATALHOS_OBSERVACAO,
  OBSERVACAO_CATEGORIAS,
  categoriaObservacaoColor,
  categoriaObservacaoDescricao,
  categoriaObservacaoLabel,
} from '../../constants/acompanhamento';
import { useAuth } from '../../context/AuthContext';
import {
  atualizarObservacao,
  buscarTimeline,
  criarObservacao,
  encerrarSessao,
  excluirObservacao,
} from '../../services/acompanhamentoApi';
import { colors } from '../../theme';
import { styles } from '../../theme/styles';
import { initials } from '../../utils/text';

const STUDENT_ACCENTS = [colors.teal, colors.purple, colors.yellow];

function elapsed(inicio, now) {
  const diff = Math.max(0, now - new Date(inicio).getTime());
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${String(hours).padStart(2, '0')}h${String(rest).padStart(2, '0')}min`;
}

function periodLabel(periodo) {
  const labels = { MANHA: 'Manha', TARDE: 'Tarde', NOITE: 'Noite' };
  return labels[periodo] || periodo;
}

function startTime(value) {
  return new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function SessaoAcompanhamentoScreen({ route, navigation }) {
  const { token } = useAuth();
  const [sessao, setSessao] = useState(route.params?.sessao);
  const [timeline, setTimeline] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());
  const [form, setForm] = useState(defaultForm(sessao));

  const multiAluno = (sessao?.alunos?.length || 0) > 1;
  const aberta = sessao?.status === 'ABERTA';
  const counts = useMemo(() => {
    const map = {};
    timeline.forEach((item) => {
      map[item.alunoId] = (map[item.alunoId] || 0) + 1;
    });
    return map;
  }, [timeline]);

  const loadTimeline = useCallback(async () => {
    if (!sessao?.id) return;
    try {
      setTimeline(await buscarTimeline(token, sessao.id));
    } catch (err) {
      setError(err.message);
    }
  }, [sessao?.id, token]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  useEffect(() => {
    if (!aberta) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, [aberta]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openNew(shortcut) {
    setEditing(null);
    setForm(defaultForm(sessao, shortcut));
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      alunoId: item.alunoId,
      categoria: item.categoria,
      descricao: item.descricao,
      disciplina: item.disciplina || '',
      local: item.local || '',
      estrategia: item.estrategia || '',
      resultado: item.resultado || '',
      observacaoComplementar: item.observacaoComplementar || '',
      tipoRegistro: item.tipoRegistro || 'MANUAL',
      audioUrl: item.audioUrl || '',
    });
    setModalOpen(true);
  }

  async function save() {
    setError('');
    try {
      const payload = { ...form, sessaoId: sessao.id };
      const saved = editing
        ? await atualizarObservacao(token, editing.id, payload)
        : await criarObservacao(token, payload);
      setTimeline((current) => editing
        ? current.map((item) => (item.id === saved.id ? saved : item))
        : [saved, ...current]);
      setModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  }

  function duplicate() {
    if (!editing) return;
    setEditing(null);
    setForm((current) => ({ ...current, tipoRegistro: 'MANUAL' }));
  }

  async function remove() {
    if (!editing) return;
    try {
      await excluirObservacao(token, editing.id);
      setTimeline((current) => current.filter((item) => item.id !== editing.id));
      setModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  }

  async function finish() {
    try {
      const next = await encerrarSessao(token, sessao.id);
      setSessao(next);
      setConfirmEnd(false);
      navigation.goBack();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!sessao) {
    return (
      <View style={styles.centered}>
        <Text>Nao foi possivel carregar a sessao.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.flex, styles.sessionPage]}>
      <ScrollView contentContainerStyle={styles.sessionPageScroll} keyboardShouldPersistTaps="handled">
        <LinearGradient
          colors={[colors.teal, colors.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sessionHero}
        >
          <Card style={styles.sessionSummaryCard} mode="contained">
            <Card.Content style={styles.sessionSummaryContent}>
              <View style={styles.flex}>
                <Text style={styles.sessionMeta}>Periodo: <Text style={styles.sessionMetaStrong}>{periodLabel(sessao.periodo)}</Text></Text>
                <Text style={styles.sessionMeta}>Inicio: <Text style={styles.sessionMetaStrong}>{startTime(sessao.inicio)}</Text></Text>
              </View>
              <View style={styles.sessionElapsedBox}>
                <Avatar.Icon size={46} icon="clock-outline" style={styles.sessionClockIcon} color={colors.purple} />
                <View>
                  <Text style={styles.muted}>Tempo decorrido</Text>
                  <Text variant="titleLarge" style={styles.sessionElapsed}>{elapsed(sessao.inicio, now)}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </LinearGradient>

        <View style={styles.sessionSectionHeader}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Alunos da sessao</Text>
          <Text style={styles.muted}>{sessao.alunos?.length || 0} selecionado(s)</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sessionStudentsRow}>
          {sessao.alunos?.map((aluno, index) => (
            <Card
              key={aluno.id}
              mode="contained"
              style={[styles.sessionStudentCard, { borderBottomColor: STUDENT_ACCENTS[index % STUDENT_ACCENTS.length] }]}
            >
              <Card.Content style={styles.sessionStudentContent}>
                {aluno.foto ? (
                  <Avatar.Image size={52} source={{ uri: aluno.foto }} />
                ) : (
                  <Avatar.Text size={52} label={initials(aluno.nome)} style={{ backgroundColor: colors.lavender }} />
                )}
                <View style={styles.flex}>
                  <Text numberOfLines={1} style={styles.itemTitle}>{aluno.nome}</Text>
                  <Text style={styles.sessionRecordCount}>{counts[aluno.id] || 0} registro(s)</Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>

        {aberta ? (
          <>
            <View style={styles.sessionSectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Atalhos rapidos</Text>
            </View>
            <View style={styles.sessionShortcutGrid}>
              {ATALHOS_OBSERVACAO.map((atalho) => {
                const color = categoriaObservacaoColor(atalho.categoria);
                const categoria = OBSERVACAO_CATEGORIAS.find((item) => item.value === atalho.categoria);
                return (
                  <Pressable key={atalho.label} style={styles.sessionShortcutCard} onPress={() => openNew(atalho)}>
                    <View style={[styles.sessionShortcutIcon, { backgroundColor: `${color}18` }]}>
                      <Icon source={categoria?.icon || 'note-outline'} size={27} color={color} />
                    </View>
                    <Text numberOfLines={2} style={styles.sessionShortcutText}>{atalho.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable onPress={() => openNew()}>
              <LinearGradient
                colors={[colors.teal, colors.purple]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.newObservationButton}
              >
                <Icon source="plus" size={28} color={colors.white} />
                <Text variant="titleMedium" style={styles.newObservationText}>Nova observacao</Text>
              </LinearGradient>
            </Pressable>

            <Button
              mode="contained"
              icon="stop-circle-outline"
              buttonColor={colors.tealDark}
              textColor={colors.white}
              contentStyle={styles.sessionStopButtonContent}
              style={styles.sessionStopButton}
              onPress={() => setConfirmEnd(true)}
            >
              Encerrar acompanhamento
            </Button>
          </>
        ) : (
          <Chip icon="lock-outline" style={styles.inactiveChip}>Sessao finalizada para consulta</Chip>
        )}

        {!!error && <HelperText type="error" visible>{error}</HelperText>}
        <Text variant="titleMedium" style={styles.sectionTitle}>Timeline de observacoes</Text>
        {timeline.length === 0 && <EmptyState text="Nenhuma observação encontrada." />}
        {timeline.map((item) => <TimelineItem key={item.id} item={item} onPress={() => openEdit(item)} />)}
      </ScrollView>

      <ObservationSheet
        visible={modalOpen}
        onDismiss={() => setModalOpen(false)}
        sessao={sessao}
        multiAluno={multiAluno}
        form={form}
        setField={setField}
        error={error}
        onSave={save}
        editing={editing}
        onDuplicate={duplicate}
        onDelete={remove}
      />

      <Portal>
        <Dialog visible={confirmEnd} onDismiss={() => setConfirmEnd(false)} style={styles.appDialog}>
          <Dialog.Title>Encerrar acompanhamento</Dialog.Title>
          <Dialog.Content>
            {sessao.alunos?.map((aluno) => (
              <Text key={aluno.id}>{aluno.nome}: {counts[aluno.id] || 0} registros</Text>
            ))}
          </Dialog.Content>
          <Dialog.Actions style={styles.appDialogActions}>
            <Button onPress={() => setConfirmEnd(false)}>Cancelar</Button>
            <Button mode="contained" buttonColor={colors.tealDark} onPress={finish}>Finalizar sessao</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

function ObservationSheet({ visible, onDismiss, sessao, multiAluno, form, setField, error, onSave, editing, onDuplicate, onDelete }) {
  function selectCategory(categoria) {
    setField('categoria', categoria.value);
    setField('descricao', categoriaObservacaoDescricao(categoria.value));
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.sheetBackdrop}>
        <ScrollView style={styles.bottomSheet} contentContainerStyle={styles.bottomSheetContent} keyboardShouldPersistTaps="handled">
          <Text variant="titleLarge" style={styles.title}>{editing ? 'Editar observacao' : 'Nova observacao'}</Text>
          {multiAluno && (
            <>
              <Text style={styles.sectionTitle}>Aluno</Text>
              <View style={styles.chipWrap}>
                {sessao.alunos?.map((aluno) => (
                  <Chip key={aluno.id} selected={form.alunoId === aluno.id} onPress={() => setField('alunoId', aluno.id)}>
                    {aluno.nome}
                  </Chip>
                ))}
              </View>
            </>
          )}

          <Text style={styles.sectionTitle}>Categoria</Text>
          <View style={styles.categoryGrid}>
            {OBSERVACAO_CATEGORIAS.map((categoria) => (
              <Chip
                key={categoria.value}
                selected={form.categoria === categoria.value}
                icon={categoria.icon}
                onPress={() => selectCategory(categoria)}
              >
                {categoria.label}
              </Chip>
            ))}
          </View>

          <TextInput label="Descricao" value={form.descricao} onChangeText={(value) => setField('descricao', value)} multiline />
          <Text style={styles.muted}>Categoria: {categoriaObservacaoLabel(form.categoria)}</Text>
          <TextInput label="Disciplina" value={form.disciplina} onChangeText={(value) => setField('disciplina', value)} />
          <TextInput label="Local" value={form.local} onChangeText={(value) => setField('local', value)} />
          <TextInput label="Estrategia utilizada" value={form.estrategia} onChangeText={(value) => setField('estrategia', value)} />
          <TextInput label="Resultado" value={form.resultado} onChangeText={(value) => setField('resultado', value)} />
          <TextInput label="Observacao complementar" value={form.observacaoComplementar} onChangeText={(value) => setField('observacaoComplementar', value)} />
          {!!error && <HelperText type="error" visible>{error}</HelperText>}
          <Button mode="contained" icon="content-save" onPress={onSave}>Salvar</Button>
          {editing && <Button mode="outlined" icon="content-copy" onPress={onDuplicate}>Duplicar</Button>}
          {editing && <Button mode="outlined" icon="delete-outline" onPress={onDelete}>Excluir</Button>}
          <Button mode="text" onPress={onDismiss}>Cancelar</Button>
        </ScrollView>
      </View>
    </Modal>
  );
}

function defaultForm(sessao, shortcut) {
  return {
    alunoId: sessao?.alunos?.[0]?.id || '',
    categoria: shortcut?.categoria || 'PARTICIPACAO',
    descricao: shortcut?.descricao || '',
    disciplina: '',
    local: '',
    estrategia: '',
    resultado: '',
    observacaoComplementar: '',
    tipoRegistro: shortcut ? 'ATALHO' : 'MANUAL',
    audioUrl: '',
  };
}
