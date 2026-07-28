import { Image, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Text } from 'react-native-paper';

import { isImageDocument } from '../../constants/documentCategories';
import { styles } from '../../theme/styles';

export default function DocumentoViewerScreen({ route }) {
  const { documento } = route.params;

  if (isImageDocument(documento)) {
    return (
      <View style={styles.viewer}>
        <Image source={{ uri: documento.urlArquivo }} style={styles.viewerImage} resizeMode="contain" />
      </View>
    );
  }

  if (!documento.urlArquivo) {
    return (
      <View style={styles.centered}>
        <Text>Arquivo indisponivel.</Text>
      </View>
    );
  }

  return <WebView source={{ uri: documento.urlArquivo }} style={styles.webViewer} />;
}
