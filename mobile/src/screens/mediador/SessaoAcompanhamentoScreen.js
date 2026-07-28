import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { Button, Card, Chip, Dialog, HelperText, IconButton, Portal, Text, TextInput } from 'react-native-paper';

import TimelineItem from '../../components/TimelineItem';
import { ATALHOS_OBSERVACAO, OBSERVACAO_CATEGORIAS, categoriaObservacaoLabel } from '../../constants/acompanhamento';
import { useAuth } from '../../context/AuthContext';
import {
  atualizarObservacao,
  buscarTimeline,
  criarObservacao,
  encerrarSessao,
  excluirObservacao,
} from '../../services/acompanhamentoApi';
import { styles } from '../../theme/styles';

function elapsed(inicio) {
  const diff = Math.max(0, Date.now() - new Date(inicio).getTime());
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours}h${String(rest).padStart(2, '0')}min`;
}

export default function SessaoAcompanhamentoScreen({ route, navigation }) {
  const { token } = useAuth();
  const [sessao, setSessao] = useState(route.params?.sessao);
  const [timeline, setTimeline] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [error, setError] = useState('');
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

  async function duplicate() {
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

  return (
    <View style={styles.flex}>
      <Card style={[styles.card, styles.sessionHeader]}>
        <Card.Content style={styles.formGap}>
          <View style={styles.documentHeader}>
            <View>
              <Text style={styles.muted}>Sessao em andamento</Text>
              <Text variant="headlineSmall" style={styles.title}>{elapsed(sessao.inicio)}</Text>
            </View>
            {aberta && <IconButton icon="stop-circle-outline" onPress={() => setConfirmEnd(true)} />}
          </View>
          <Text style={styles.muted}>{sessao.periodo} - {new Date(sessao.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
          <View style={styles.chipWrap}>
            {sessao.alunos?.map((aluno) => (
              <Chip key={aluno.id} icon="school-outline">{aluno.nome} ({counts[aluno.id] || 0})</Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      <View style={styles.sessionContent}>
        <ScrollView contentContainerStyle={styles.sessionScroll} keyboardShouldPersistTaps="handled">
          {aberta ? (
            <>
              <Button mode="contained" icon="plus" contentStyle={styles.primaryButtonContent} onPress={() => openNew()}>
                Nova Observacao
              </Button>
              <View style={styles.chipWrap}>
                {ATALHOS_OBSERVACAO.map((atalho) => (
                  <Chip key={atalho.label} onPress={() => openNew(atalho)}>{atalho.label}</Chip>
                ))}
              </View>
            </>
          ) : (
            <Chip icon="lock-outline" style={styles.inactiveChip}>Sessao finalizada para consulta</Chip>
          )}
          <Text style={styles.sectionTitle}>Timeline do dia</Text>
          {timeline.map((item) => <TimelineItem key={item.id} item={item} onPress={() => openEdit(item)} />)}
        </ScrollView>
      </View>

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
        <Dialog visible={confirmEnd} onDismiss={() => setConfirmEnd(false)}>
          <Dialog.Title>Encerrar acompanhamento</Dialog.Title>
          <Dialog.Content>
            {sessao.alunos?.map((aluno) => (
              <Text key={aluno.id}>{aluno.nome}: {counts[aluno.id] || 0} registros</Text>
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmEnd(false)}>Cancelar</Button>
            <Button onPress={finish}>Finalizar Sessao</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

function ObservationSheet({ visible, onDismiss, sessao, multiAluno, form, setField, error, onSave, editing, onDuplicate, onDelete }) {
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
                onPress={() => setField('categoria', categoria.value)}
              >
                {categoria.label}
              </Chip>
            ))}
          </View>

          <TextInput label="Descricao" mode="outlined" value={form.descricao} onChangeText={(value) => setField('descricao', value)} multiline />
          <Button mode="outlined" icon="microphone-outline" onPress={() => setField('observacaoComplementar', 'Use o ditado do teclado do celular para registrar por voz.')}>
            Registrar por voz
          </Button>
          <Text style={styles.muted}>Categoria: {categoriaObservacaoLabel(form.categoria)}</Text>
          <TextInput label="Disciplina" mode="outlined" value={form.disciplina} onChangeText={(value) => setField('disciplina', value)} />
          <TextInput label="Local" mode="outlined" value={form.local} onChangeText={(value) => setField('local', value)} />
          <TextInput label="Estrategia utilizada" mode="outlined" value={form.estrategia} onChangeText={(value) => setField('estrategia', value)} />
          <TextInput label="Resultado" mode="outlined" value={form.resultado} onChangeText={(value) => setField('resultado', value)} />
          <TextInput label="Observacao complementar" mode="outlined" value={form.observacaoComplementar} onChangeText={(value) => setField('observacaoComplementar', value)} />
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
