import { Avatar, Card, Text } from 'react-native-paper';

import { styles } from '../theme/styles';

export default function StatCard({ label, value, color, icon }) {
  return (
    <Card style={styles.statCard}>
      <Card.Content style={styles.statContent}>
        <Avatar.Icon icon={icon} size={42} style={{ backgroundColor: color }} />
        <Text variant="headlineSmall" style={styles.statValue}>{value}</Text>
        <Text style={styles.muted}>{label}</Text>
      </Card.Content>
    </Card>
  );
}
