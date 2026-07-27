import { Avatar, Card, Text } from 'react-native-paper';

import { colors } from '../theme';
import { styles } from '../theme/styles';

export default function EmptyState({ text }) {
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.empty}>
        <Avatar.Icon icon="clipboard-text-outline" size={54} style={{ backgroundColor: colors.lavender }} />
        <Text style={styles.muted}>{text}</Text>
      </Card.Content>
    </Card>
  );
}
