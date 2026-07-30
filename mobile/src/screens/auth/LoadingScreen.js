import { Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native-paper';

import { colors } from '../../theme';
import { styles } from '../../theme/styles';

export default function LoadingScreen() {
  return (
    <SafeAreaView style={styles.centered}>
      <Image source={require('../../../assets/logo_reduzida.png')} style={styles.loadingLogo} resizeMode="contain" />
      <ActivityIndicator color={colors.tealDark} />
    </SafeAreaView>
  );
}
