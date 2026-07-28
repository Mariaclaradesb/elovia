import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, HelperText, Snackbar, Text } from 'react-native-paper';

import TextInput from '../../components/FormTextInput';

import DateField from '../../components/DateField';
import FormSection from '../../components/FormSection';
import Screen from '../../components/Screen';
import SelectField from '../../components/SelectField';
import { DOCUMENT_CATEGORIES, categoryLabel } from '../../constants/documentCategories';
import { useAuth } from '../../context/AuthContext';
import { salvarDocumentoAluno } from '../../services/documentosApi';
import { styles } from '../../theme/styles';

export default function DocumentoFormScreen({ route, navigation }) {
  const { token } = useAuth();
  const { aluno, documento } = route.params;
  const [values, setValues] = useState({
    titulo: documento?.titulo || '',
    descricao: documento?.descricao || '',
    categoria: documento?.categoria || 'LAUDO',
    dataDocumento: documento?.dataDocumento || '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function setField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function pickDocument() {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
      ],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setMessage('Permita o acesso a camera para anexar fotos.');
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
      setField('categoria', 'FOTO');
    }
  }

  async function save() {
    setError('');
    setLoading(true);
    try {
      await salvarDocumentoAluno({
        alunoId: aluno.id,
        documentoId: documento?.id,
        token,
        values,
        file,
      });
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
          options={DOCUMENT_CATEGORIES.map((item) => ({ value: item.value, label: item.label }))}
          onChange={(value) => setField('categoria', value)}
        />
        <TextInput label="Titulo" mode="outlined" value={values.titulo} onChangeText={(value) => setField('titulo', value)} />
        <TextInput
          label="Descricao"
          mode="outlined"
          value={values.descricao}
          onChangeText={(value) => setField('descricao', value)}
          multiline
          numberOfLines={4}
        />
        <DateField label="Data do documento" value={values.dataDocumento} onChange={(value) => setField('dataDocumento', value)} />
      </FormSection>

      <FormSection title="Arquivo">
        <View style={styles.fileActions}>
          <Button mode="outlined" icon="file-upload-outline" onPress={pickDocument}>Selecionar arquivo</Button>
          <Button mode="outlined" icon="camera-outline" onPress={takePhoto}>Usar camera</Button>
        </View>
        <Text style={styles.muted}>
          {file ? `${file.name} ${file.size ? `(${Math.round(file.size / 1024)} KB)` : ''}` : documento?.nomeArquivo || 'PDF, DOC, DOCX, PNG, JPG ou JPEG'}
        </Text>
      </FormSection>

      {!!error && <HelperText type="error" visible>{error}</HelperText>}
      <Button mode="contained" icon="content-save" loading={loading} onPress={save}>
        Salvar Documento
      </Button>
      <Snackbar visible={!!message} onDismiss={() => setMessage('')}>{message}</Snackbar>
    </Screen>
  );
}
