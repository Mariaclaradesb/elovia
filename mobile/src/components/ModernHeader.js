import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StatusBar, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme';
import { styles } from '../theme/styles';

export default function ModernHeader({ navigation, route, options, back }) {
  const insets = useSafeAreaInsets();
  const safeTop = Math.max(
    insets.top,
    Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  );
  const title = options.title || route.name;

  return (
    <LinearGradient
      colors={[colors.lavenderSoft, colors.tealSoft, colors.yellowSoft]}
      locations={[0, 0.64, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.modernHeader, { paddingTop: safeTop }]}
    >
      <View style={styles.modernHeaderRow}>
        {back ? (
          <IconButton icon="arrow-left" iconColor={colors.ink} onPress={navigation.goBack} style={styles.modernHeaderAction} />
        ) : (
          <View style={styles.modernHeaderAction} />
        )}
        <Text numberOfLines={1} variant="titleLarge" style={styles.modernHeaderTitle}>{title}</Text>
        <View style={styles.modernHeaderAction} />
      </View>
    </LinearGradient>
  );
}
