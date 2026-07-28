import { Dialog, Portal } from 'react-native-paper';

import { styles } from '../theme/styles';

export default function AppDialog({ visible, onDismiss, title, children, actions }) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.appDialog}>
        <Dialog.Title style={styles.appDialogTitle}>{title}</Dialog.Title>
        <Dialog.Content style={styles.appDialogContent}>{children}</Dialog.Content>
        {!!actions && <Dialog.Actions style={styles.appDialogActions}>{actions}</Dialog.Actions>}
      </Dialog>
    </Portal>
  );
}
