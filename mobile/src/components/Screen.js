import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { styles } from '../theme/styles';

export default function Screen({ children, refreshControl }) {
  const insets = useSafeAreaInsets();
  // keyboardVerticalOffset precisa somar a altura do header (≈56) + inset do topo
  // para que o padding compense corretamente em todas as telas e dispositivos.
  const keyboardOffset = 56 + insets.top;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.flex}
        keyboardVerticalOffset={keyboardOffset}
      >
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
