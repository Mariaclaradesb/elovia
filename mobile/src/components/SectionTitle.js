import { Text } from 'react-native-paper';

import { styles } from '../theme/styles';

export default function SectionTitle({ title }) {
  return <Text variant="titleMedium" style={styles.sectionTitle}>{title}</Text>;
}
