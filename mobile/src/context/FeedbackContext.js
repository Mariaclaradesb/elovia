import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Icon, Portal, Snackbar, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { styles } from '../theme/styles';
import { colors } from '../theme/colors';

const FeedbackContext = createContext(null);

const FEEDBACK_META = {
  success: { icon: 'check-circle-outline', color: colors.tealDark },
  error: { icon: 'alert-circle-outline', color: colors.danger },
  warning: { icon: 'alert-outline', color: '#946200' },
  info: { icon: 'information-outline', color: colors.purple },
};

export function FeedbackProvider({ children }) {
  const insets = useSafeAreaInsets();
  const [feedback, setFeedback] = useState(null);

  const showFeedback = useCallback((nextFeedback, fallbackType = 'info') => {
    const normalized = normalizeFeedback(nextFeedback, fallbackType);
    if (!normalized.message) return;
    setFeedback({
      id: Date.now(),
      duration: normalized.type === 'error' ? 5200 : 3600,
      ...normalized,
    });
  }, []);

  const dismissFeedback = useCallback(() => setFeedback(null), []);

  const value = useMemo(() => ({
    showFeedback,
    showSuccess: (message) => showFeedback({ type: 'success', message }),
    showError: (error) => showFeedback(error, 'error'),
    showWarning: (message) => showFeedback({ type: 'warning', message }),
    showInfo: (message) => showFeedback({ type: 'info', message }),
    dismissFeedback,
  }), [dismissFeedback, showFeedback]);

  const type = feedback?.type || 'info';
  const meta = FEEDBACK_META[type] || FEEDBACK_META.info;

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <Portal>
        <Snackbar
          visible={!!feedback}
          duration={feedback?.duration}
          onDismiss={dismissFeedback}
          wrapperStyle={[styles.feedbackSnackbarWrapper, { bottom: Math.max(insets.bottom, 12) }]}
          style={[styles.feedbackSnackbar, styles[`feedbackSnackbar${capitalize(type)}`]]}
        >
          <View style={styles.feedbackSnackbarContent}>
            <Icon source={meta.icon} size={22} color={meta.color} />
            <Text style={styles.feedbackSnackbarText}>{feedback?.message}</Text>
          </View>
        </Snackbar>
      </Portal>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback deve ser usado dentro de FeedbackProvider');
  }
  return context;
}

export function normalizeFeedback(input, fallbackType = 'info') {
  if (!input) return { type: fallbackType, message: '' };
  if (typeof input === 'string') return { type: fallbackType, message: friendlyMessage(input) };
  if (Object.prototype.hasOwnProperty.call(input, 'message')) {
    if (!input.message) {
      return { type: input.type || fallbackType, message: '' };
    }
    return {
      type: input.type || fallbackType,
      message: friendlyMessage(input),
    };
  }
  return { type: fallbackType, message: 'Não foi possível concluir a ação agora.' };
}

export function feedbackMeta(type) {
  return FEEDBACK_META[type] || FEEDBACK_META.info;
}

function friendlyMessage(input) {
  const status = typeof input === 'object' ? input.status : null;
  const message = typeof input === 'object' ? input.message : input;
  if (!message) return '';
  if (status === 401) {
    return 'Sua sessão expirou. Entre novamente para continuar.';
  }
  if (status === 403) {
    return 'Você não tem permissão para realizar esta ação.';
  }
  if (/failed to fetch|network request failed|load failed/i.test(message)) {
    return 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.';
  }
  if (/unauthorized|não autenticado|nao autenticado|401/i.test(message)) {
    return 'Sua sessão expirou. Entre novamente para continuar.';
  }
  if (/forbidden|acesso negado|403/i.test(message)) {
    return 'Você não tem permissão para realizar esta ação.';
  }
  return message;
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
}
