import { Card } from 'react-native-paper';

import { styles } from '../theme/styles';
import SectionTitle from './SectionTitle';

export default function FormSection({ title, children }) {
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.formGap}>
        <SectionTitle title={title} />
        {children}
      </Card.Content>
    </Card>
  );
}
