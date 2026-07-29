import { useEffect, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Keyboard } from 'react-native';
import { Button, Text } from 'react-native-paper';

import AppDialog from './AppDialog';
import { styles } from '../theme/styles';

export default function TemporaryPasswordDialog({ visible, password, mediatorName, onDismiss }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (visible) {
      Keyboard.dismiss();
      setCopied(false);
    }
  }, [visible, password]);

  async function copyPassword() {
    await Clipboard.setStringAsync(password);
    setCopied(true);
  }

  return (
    <AppDialog
      visible={visible}
      onDismiss={onDismiss}
      title="Senha temporária"
      actions={[
        <Button key="copy-password" icon="content-copy" onPress={copyPassword}>
          {copied ? 'Copiada' : 'Copiar senha'}
        </Button>,
        <Button key="finish" mode="contained" onPress={onDismiss}>Concluir</Button>,
      ]}
    >
      <Text style={styles.appDialogText}>
        Envie esta senha para {mediatorName || 'o mediador'}. Ela será substituída no primeiro acesso.
      </Text>
      <Text selectable variant="headlineSmall" style={styles.temporaryPassword}>{password}</Text>
      <Text style={styles.muted}>Você pode tirar um print desta tela ou copiar a senha.</Text>
    </AppDialog>
  );
}
