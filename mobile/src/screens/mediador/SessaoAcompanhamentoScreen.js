import { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
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
  const labels = { MANHA: 'Manhã', TARDE: 'Tarde', NOITE: 'Noite' };
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
        <Text>Não foi possível carregar a sessão.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.flex, styles.sessionPage]}>
      <ScrollView
        contentContainerStyle={[styles.sessionPageScroll, { gap: 18 }]}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={[colors.teal, colors.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sessionHero}
        >
          <Card style={styles.sessionSummaryCard} mode="contained">
            <Card.Content style={styles.sessionSummaryContent}>
              <View style={styles.flex}>
                <Text style={styles.sessionMeta}>Período: <Text style={styles.sessionMetaStrong}>{periodLabel(sessao.periodo)}</Text></Text>
                <Text style={styles.sessionMeta}>Início: <Text style={styles.sessionMetaStrong}>{startTime(sessao.inicio)}</Text></Text>
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

        <View style={[styles.sessionSectionHeader, { paddingHorizontal: 16 }]}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Alunos da sessão</Text>
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
            <View style={[styles.sessionSectionHeader, { paddingHorizontal: 16 }]}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Atalhos rápidos</Text>
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

            <View style={{ paddingHorizontal: 16, gap: 10 }}>
              <Pressable onPress={() => openNew()}>
                <LinearGradient
                  colors={[colors.teal, colors.purple]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.newObservationButton}
                >
                  <Icon source="plus" size={28} color={colors.white} />
                  <Text variant="titleMedium" style={styles.newObservationText}>Nova observação</Text>
                </LinearGradient>
              </Pressable>

              <Button
                mode="outlined"
                icon="stop-circle-outline"
                textColor={colors.danger}
                style={[styles.sessionStopButton, { borderColor: colors.danger }]}
                contentStyle={styles.sessionStopButtonContent}
                onPress={() => setConfirmEnd(true)}
              >
                Encerrar acompanhamento
              </Button>
            </View>
          </>
        ) : (
          <View style={{ paddingHorizontal: 16 }}>
            <Chip icon="lock-outline" style={styles.inactiveChip}>Sessão finalizada — somente consulta</Chip>
          </View>
        )}

        {!!error && <HelperText type="error" visible style={{ paddingHorizontal: 16 }}>{error}</HelperText>}
        <Text variant="titleMedium" style={[styles.sectionTitle, { paddingHorizontal: 16 }]}>Timeline de observações</Text>
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
          <Dialog.Content style={styles.appDialogContent}>
            <Text style={styles.appDialogText}>Resumo de registros desta sessão:</Text>
            {sessao.alunos?.map((aluno) => (
              <Text key={aluno.id} style={styles.appDialogText}>• {aluno.nome}: <Text style={{ fontWeight: '800' }}>{counts[aluno.id] || 0} registro(s)</Text></Text>
            ))}
          </Dialog.Content>
          <Dialog.Actions style={styles.appDialogActions}>
            <Button onPress={() => setConfirmEnd(false)}>Cancelar</Button>
            <Button mode="contained" buttonColor={colors.tealDark} onPress={finish}>Finalizar sessão</Button>
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.sheetBackdrop}
      >
        <ScrollView style={styles.bottomSheet} contentContainerStyle={styles.bottomSheetContent} keyboardShouldPersistTaps="handled">
          <Text variant="titleLarge" style={styles.title}>{editing ? 'Editar observação' : 'Nova observação'}</Text>

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
          <View style={styles.sessionShortcutGrid}>
            {OBSERVACAO_CATEGORIAS.map((categoria) => {
              const color = categoriaObservacaoColor(categoria.value);
              const selected = form.categoria === categoria.value;
              return (
                <Pressable
                  key={categoria.value}
                  style={[
                    styles.sessionShortcutCard,
                    selected && { borderColor: color, borderWidth: 2, backgroundColor: `${color}14` },
                  ]}
                  onPress={() => selectCategory(categoria)}
                >
                  <View style={[styles.sessionShortcutIcon, { backgroundColor: `${color}${selected ? '30' : '18'}` }]}>
                    <Icon source={categoria.icon || 'note-outline'} size={24} color={color} />
                  </View>
                  <Text numberOfLines={2} style={[styles.sessionShortcutText, selected && { color }]}>
                    {categoria.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput label="Descrição" value={form.descricao} onChangeText={(value) => setField('descricao', value)} multiline />
          <TextInput label="Disciplina" value={form.disciplina} onChangeText={(value) => setField('disciplina', value)} />
          <TextInput label="Local" value={form.local} onChangeText={(value) => setField('local', value)} />
          <TextInput label="Estratégia utilizada" value={form.estrategia} onChangeText={(value) => setField('estrategia', value)} />
          <TextInput label="Resultado" value={form.resultado} onChangeText={(value) => setField('resultado', value)} />
          <TextInput label="Observação complementar" value={form.observacaoComplementar} onChangeText={(value) => setField('observacaoComplementar', value)} />

          {!!error && <HelperText type="error" visible>{error}</HelperText>}

          <Button mode="contained" icon="content-save" contentStyle={{ minHeight: 52 }} onPress={onSave}>Salvar observação</Button>
          {editing && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button mode="outlined" icon="content-copy" style={{ flex: 1 }} onPress={onDuplicate}>Duplicar</Button>
              <Button mode="outlined" icon="delete-outline" textColor={colors.danger} style={{ flex: 1, borderColor: colors.danger }} onPress={onDelete}>Excluir</Button>
            </View>
          )}
          <Button mode="text" onPress={onDismiss}>Cancelar</Button>
        </ScrollView>
      </KeyboardAvoidingView>
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
