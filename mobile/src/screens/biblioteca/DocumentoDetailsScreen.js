import { Linking } from 'react-native';
import { Button, Card, Dialog, Portal, Text } from 'react-native-paper';
import { useEffect, useState } from 'react';

import InfoGrid from '../../components/InfoGrid';
import Screen from '../../components/Screen';
import { categoryLabel } from '../../constants/documentCategories';
import { useAuth } from '../../context/AuthContext';
import { buscarDocumento, excluirDocumento, obterLinkDocumento } from '../../services/documentosApi';
import { styles } from '../../theme/styles';
import { isoToDisplayDate } from '../../utils/date';

export default function DocumentoDetailsScreen({ route, navigation }) {
  const { token } = useAuth();
  const { aluno } = route.params;
  const documentoId = route.params.documentoId || route.params.documento?.id;
  const [documento, setDocumento] = useState(route.params.documento || null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!documentoId) {
      setError('Documento não encontrado.');
      return;
    }
    buscarDocumento(documentoId, token)
      .then(setDocumento)
      .catch((err) => setError(err.message));
  }, [documentoId, token]);

  async function remove() {
    try {
      await excluirDocumento(documento.id, token);
      setConfirmDelete(false);
      navigation.goBack();
    } catch (err) {
      setError(err.message);
    }
  }

  async function download() {
    try {
      const link = await obterLinkDocumento(documento.id, token);
      if (link?.urlArquivo) {
        await Linking.openURL(link.urlArquivo);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  if (!documento) {
    return (
      <Screen>
        <Text>Carregando documento...</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card style={styles.card}>
        <Card.Content style={styles.formGap}>
          <Text variant="headlineSmall" style={styles.title}>{documento.titulo}</Text>
          <InfoGrid
            items={[
              { label: 'Categoria', value: categoryLabel(documento.categoria) },
              { label: 'Aluno', value: documento.alunoNome },
              { label: 'Enviado por', value: documento.usuarioUploadNome },
              { label: 'Data do documento', value: isoToDisplayDate(documento.dataDocumento) },
              { label: 'Data do upload', value: isoToDisplayDate(documento.dataUpload) },
              { label: 'Descrição', value: documento.descricao, full: true },
              { label: 'Arquivo', value: documento.nomeArquivo, full: true },
              { label: 'Última edição', value: documento.usuarioUltimaEdicaoNome ? `${documento.usuarioUltimaEdicaoNome} em ${isoToDisplayDate(documento.dataUltimaEdicao)}` : 'Não editado', full: true },
            ]}
          />
          {!!error && <Text style={styles.errorText}>{error}</Text>}
        </Card.Content>
      </Card>

      <Button mode="contained" icon="eye-outline" onPress={() => navigation.navigate('DocumentoViewer', { documento })}>
        Visualizar
      </Button>
      <Button mode="outlined" icon="download-outline" onPress={download}>
        Baixar
      </Button>
      <Button mode="outlined" icon="pencil-outline" onPress={() => navigation.navigate('DocumentoForm', { aluno, documento })}>
        Editar
      </Button>
      {documento.ativo && (
        <Button mode="outlined" icon="delete-outline" onPress={() => setConfirmDelete(true)}>
          Excluir
        </Button>
      )}

      <Portal>
        <Dialog visible={confirmDelete} onDismiss={() => setConfirmDelete(false)} style={styles.appDialog}>
          <Dialog.Title>Excluir documento?</Dialog.Title>
          <Dialog.Content>
            <Text>O documento será desativado e continuará registrado no histórico.</Text>
          </Dialog.Content>
          <Dialog.Actions style={styles.appDialogActions}>
            <Button onPress={() => setConfirmDelete(false)}>Cancelar</Button>
            <Button onPress={remove}>Confirmar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Screen>
  );
}
