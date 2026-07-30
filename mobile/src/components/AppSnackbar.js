import { View } from 'react-native';
import { Icon, Snackbar, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { feedbackMeta, normalizeFeedback } from '../context/FeedbackContext';
import { styles } from '../theme/styles';

export default function AppSnackbar({ message, visible, onDismiss, type, duration }) {
  const insets = useSafeAreaInsets();
  const resolvedType = type || inferType(message);
  const feedback = normalizeFeedback({ type: resolvedType, message }, resolvedType);
  const meta = feedbackMeta(feedback.type);

  return (
    <Snackbar
      visible={visible && !!feedback.message}
      duration={duration || (feedback.type === 'error' ? 5200 : 3600)}
      onDismiss={onDismiss}
      wrapperStyle={[styles.feedbackSnackbarWrapper, { bottom: Math.max(insets.bottom, 12) }]}
      style={[styles.feedbackSnackbar, styles[`feedbackSnackbar${capitalize(feedback.type)}`]]}
    >
      <View style={styles.feedbackSnackbarContent}>
        <Icon source={meta.icon} size={22} color={meta.color} />
        <Text style={styles.feedbackSnackbarText}>{feedback.message}</Text>
      </View>
    </Snackbar>
  );
}

function inferType(message) {
  if (!message) return 'info';
  if (/salv|atualiz|adicionad|gerad|desativad|enviad|conclu|sucesso|código chegará/i.test(message)) {
    return 'success';
  }
  if (/permita|atenção|aviso|selecione|preencha|informe/i.test(message)) {
    return 'warning';
  }
  if (/erro|falha|failed|não|nao|inv[aá]lid|indispon[ií]vel|negad|expir|obrigat[oó]ri/i.test(message)) {
    return 'error';
  }
  return 'info';
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
}
