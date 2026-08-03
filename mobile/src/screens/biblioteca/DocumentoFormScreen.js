import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Platform, View } from 'react-native';
import { Button, Card, IconButton, Text } from 'react-native-paper';
import FeedbackMessage from '../../components/FeedbackMessage';

import TextInput from '../../components/FormTextInput';
import AppSnackbar from '../../components/AppSnackbar';

import DateField from '../../components/DateField';
import FormSection from '../../components/FormSection';
import Screen from '../../components/Screen';
import SelectField from '../../components/SelectField';
import { DOCUMENT_CATEGORIES, categoryLabel } from '../../constants/documentCategories';
import { ANAMNESE_ATTACHMENT_CATEGORIES } from '../../constants/anamnese';
import { useAuth } from '../../context/AuthContext';
import { salvarDocumentoAluno } from '../../services/documentosApi';
import { salvarAnexoAnamnese } from '../../services/anamneseApi';
import { styles } from '../../theme/styles';

export default function DocumentoFormScreen({ route, navigation }) {
  const { token } = useAuth();
  const { aluno, documento, anamnese = false } = route.params;
  const [values, setValues] = useState({
    titulo: documento?.titulo || '',
    descricao: documento?.descricao || '',
    categoria: documento?.categoria || 'LAUDO',
    dataDocumento: documento?.dataDocumento || '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState('');
  const canUseCamera = Platform.OS !== 'web';

  function setField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: '' }));
  }

  async function pickDocument() {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (!result.canceled) {
      const selected = result.assets[0];
      setFile(selected);
      setFieldErrors((current) => ({ ...current, file: '' }));
      if (!values.titulo.trim()) setField('titulo', selected.name.replace(/\.[^.]+$/, ''));
    }
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setMessage('Permita o acesso à câmera para anexar fotos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      const asset = result.assets[0];
      setFile({
        uri: asset.uri,
        name: asset.fileName || `foto-${Date.now()}.jpg`,
        mimeType: asset.mimeType || 'image/jpeg',
        size: asset.fileSize || 0,
      });
      setFieldErrors((current) => ({ ...current, file: '' }));
      if (!values.titulo.trim()) setField('titulo', 'Foto do documento');
      if (!anamnese) {
        setField('categoria', 'FOTO');
      }
    }
  }

  async function save() {
    setError('');
    setFieldErrors({});
    const nextFieldErrors = {
      categoria: !values.categoria ? 'Selecione a categoria.' : '',
      titulo: !values.titulo.trim() ? 'Informe o titulo do documento.' : '',
    };

    if (Object.values(nextFieldErrors).some(Boolean)) {
      setFieldErrors(nextFieldErrors);
      setError('Revise os campos destacados.');
      return;
    }

    setLoading(true);
    try {
      if (anamnese) {
        await salvarAnexoAnamnese({ alunoId: aluno.id, token, values, file });
      } else {
        await salvarDocumentoAluno({
          alunoId: aluno.id,
          documentoId: documento?.id,
          token,
          values,
          file,
        });
      }
      setMessage('Documento salvo.');
      setTimeout(() => navigation.goBack(), 700);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <FormSection title={documento ? 'Editar documento' : 'Adicionar documento'}>
        <SelectField
          label="Categoria"
          value={categoryLabel(values.categoria)}
          options={(anamnese ? ANAMNESE_ATTACHMENT_CATEGORIES : DOCUMENT_CATEGORIES).map((item) => ({ value: item.value, label: item.label }))}
          onChange={(value) => setField('categoria', value)}
          required
          errorMessage={fieldErrors.categoria}
        />
        <TextInput label="Titulo" mode="outlined" value={values.titulo} onChangeText={(value) => setField('titulo', value)} required errorMessage={fieldErrors.titulo} />
        <TextInput
          label="Descrição"
          mode="outlined"
          value={values.descricao}
          onChangeText={(value) => setField('descricao', value)}
          multiline
          numberOfLines={4}
        />
        <DateField label="Data do documento" value={values.dataDocumento} onChange={(value) => setField('dataDocumento', value)} />
      </FormSection>

      <FormSection title="Arquivo">
        <View style={styles.filePickerBox}>
          <View style={styles.fileActions}>
            <Button mode="outlined" icon="file-upload-outline" onPress={pickDocument}>Selecionar arquivo</Button>
            {canUseCamera && <Button mode="outlined" icon="camera-outline" onPress={takePhoto}>Usar camera</Button>}
          </View>
          {(file || documento?.nomeArquivo) ? (
            <Card mode="outlined" style={styles.card}>
              <Card.Content style={styles.itemRow}>
                <View style={styles.flex}>
                  <Text style={styles.itemTitle}>{file?.name || documento.nomeArquivo}</Text>
                  <Text style={styles.muted}>
                    {file?.size ? `${Math.round(file.size / 1024)} KB` : 'Arquivo ja salvo'}
                  </Text>
                </View>
                {!!file && <IconButton icon="delete-outline" iconColor="#B42318" accessibilityLabel="Remover arquivo selecionado" onPress={() => setFile(null)} />}
              </Card.Content>
            </Card>
          ) : <Text style={styles.muted}>Selecione PDF, Word, planilhas, imagens ou outros arquivos.</Text>}
        </View>
      </FormSection>
      <FeedbackMessage type="error" message={error} />
      <Button mode="contained" icon="content-save" loading={loading} onPress={save}>
        Salvar Documento
      </Button>
      <AppSnackbar visible={!!message} message={message} onDismiss={() => setMessage('')} />
    </Screen>
  );
}
