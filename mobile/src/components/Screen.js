import { SafeAreaView, ScrollView } from 'react-native';

import { styles } from '../theme/styles';

export default function Screen({ children, refreshControl }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.screen}
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
