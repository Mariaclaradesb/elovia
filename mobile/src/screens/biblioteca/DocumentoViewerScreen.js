import { Image, Linking, Platform, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useEffect, useState } from 'react';

import FeedbackMessage from '../../components/FeedbackMessage';
import { isImageDocument } from '../../constants/documentCategories';
import { useAuth } from '../../context/AuthContext';
import { obterLinkDocumento } from '../../services/documentosApi';
import { styles } from '../../theme/styles';

export default function DocumentoViewerScreen({ route }) {
  const { token } = useAuth();
  const { documento } = route.params;
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  async function openFile() {
    if (!url) return;

    if (Platform.OS === 'web') {
      globalThis.window?.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    try {
      await Linking.openURL(url);
    } catch {
      setError('Nao foi possivel abrir este arquivo neste dispositivo.');
    }
  }

  useEffect(() => {
    if (!documento?.id) {
      setError('Arquivo indisponivel.');
      return;
    }

    obterLinkDocumento(documento.id, token)
      .then((link) => setUrl(link.urlArquivo))
      .catch((err) => setError(err.message));
  }, [documento?.id, token]);

  if (error) {
    return (
      <View style={styles.centered}>
        <FeedbackMessage type="error" message={error} />
      </View>
    );
  }

  if (!url) {
    return (
      <View style={styles.centered}>
        <Text>Carregando arquivo...</Text>
      </View>
    );
  }

  if (isImageDocument(documento)) {
    return (
      <View style={styles.viewer}>
        <Image source={{ uri: url }} style={styles.viewerImage} resizeMode="contain" />
      </View>
    );
  }

  return (
    <View style={styles.centered}>
      <Text variant="titleMedium" style={styles.title}>{documento?.titulo || 'Arquivo pronto'}</Text>
      <Text style={styles.muted}>Abra o arquivo no navegador ou aplicativo padrao do dispositivo.</Text>
      <Button mode="contained" icon="open-in-new" onPress={openFile}>
        Abrir arquivo
      </Button>
    </View>
  );
}
