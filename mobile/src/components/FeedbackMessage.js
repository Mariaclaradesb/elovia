import { View } from 'react-native';
import { Icon, Text } from 'react-native-paper';

import { feedbackMeta, normalizeFeedback } from '../context/FeedbackContext';
import { styles } from '../theme/styles';

export default function FeedbackMessage({ message, type = 'error', style }) {
  const feedback = normalizeFeedback({ type, message }, type);
  if (!feedback.message) return null;

  const meta = feedbackMeta(feedback.type);

  return (
    <View style={[styles.inlineFeedback, styles[`inlineFeedback${capitalize(feedback.type)}`], style]}>
      <Icon source={meta.icon} size={20} color={meta.color} />
      <Text style={styles.inlineFeedbackText}>{feedback.message}</Text>
    </View>
  );
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
}
