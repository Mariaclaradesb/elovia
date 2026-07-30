import { View } from 'react-native';
import { Avatar, Card, Text } from 'react-native-paper';

import { styles } from '../theme/styles';

export default function EmptyState({ text = 'Ainda não há registros.', compact = false }) {
  if (compact) {
    return (
      <View style={styles.emptyInline}>
        <Avatar.Icon icon="clipboard-text-outline" size={44} style={styles.avatarLavender} />
        <Text style={styles.muted}>{text}</Text>
      </View>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.empty}>
        <Avatar.Icon icon="clipboard-text-outline" size={54} style={styles.avatarLavender} />
        <Text style={styles.muted}>{text}</Text>
      </Card.Content>
    </Card>
  );
}
