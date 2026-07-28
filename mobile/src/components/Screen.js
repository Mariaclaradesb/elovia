import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar } from 'react-native';

import { styles } from '../theme/styles';

export default function Screen({ children, refreshControl }) {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex} keyboardVerticalOffset={80}>
        <ScrollView
          contentContainerStyle={[
            styles.screen,
            Platform.OS === 'android' && { paddingTop: (StatusBar.currentHeight || 0) + 18 },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
