import { Image, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Text } from 'react-native-paper';
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

  return <WebView source={{ uri: url }} style={styles.webViewer} />;
}
