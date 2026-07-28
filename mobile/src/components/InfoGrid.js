import { View } from 'react-native';
import { Text } from 'react-native-paper';

import { styles } from '../theme/styles';

export default function InfoGrid({ items }) {
  return (
    <View style={styles.infoGrid}>
      {items.map((item) => (
        <View key={item.label} style={[styles.infoTile, item.full && styles.infoTileFull]}>
          <Text style={styles.infoLabel}>{item.label}</Text>
          <Text style={styles.infoValue}>{item.value || 'Não informado'}</Text>
        </View>
      ))}
    </View>
  );
}
