import { ScrollView } from 'react-native';
import { Chip } from 'react-native-paper';

import { DOCUMENT_TABS } from '../constants/documentCategories';
import { styles } from '../theme/styles';

export default function DocumentTabs({ value, onChange }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalTabs}>
      {DOCUMENT_TABS.map((tab) => (
        <Chip
          key={tab}
          selected={value === tab}
          onPress={() => onChange(tab)}
          style={styles.tabChip}
          compact
        >
          {tab}
        </Chip>
      ))}
    </ScrollView>
  );
}
