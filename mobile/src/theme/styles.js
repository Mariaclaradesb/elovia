import { StyleSheet } from 'react-native';

import { anamneseStyles } from '../styles/anamnese.styles';
import { appLayoutStyles } from '../styles/app-layout.styles';
import { authStyles } from '../styles/auth.styles';
import { baseStyles } from '../styles/base.styles';
import { commonStyles } from '../styles/common.styles';
import { dataDisplayStyles } from '../styles/data-display.styles';
import { documentsStyles } from '../styles/documents.styles';
import { feedbackStyles } from '../styles/feedback.styles';
import { formsStyles } from '../styles/forms.styles';
import { sessionStyles } from '../styles/session.styles';
import { studentStyles } from '../styles/student.styles';

// Compatibility facade: existing screens can keep importing `styles` while
// each visual area lives in a small, easy-to-find file under src/styles.
export const styles = StyleSheet.create({
  ...baseStyles,
  ...authStyles,
  ...commonStyles,
  ...formsStyles,
  ...feedbackStyles,
  ...dataDisplayStyles,
  ...studentStyles,
  ...documentsStyles,
  ...sessionStyles,
  ...appLayoutStyles,
  ...anamneseStyles,
});
