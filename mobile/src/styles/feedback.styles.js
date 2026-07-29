import { colors } from '../theme/colors';

export const feedbackStyles = {
  appDialog: {
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: 18,
    marginHorizontal: 20,
    maxWidth: 520,
    width: '90%',
  },
  appDialogTitle: { color: colors.ink, fontWeight: '800', marginBottom: 4 },
  appDialogContent: { gap: 14 },
  appDialogText: { color: colors.ink, fontSize: 16, lineHeight: 23 },
  appDialogActions: {
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  temporaryPassword: {
    backgroundColor: colors.tealSoft,
    borderRadius: 12,
    color: colors.tealDark,
    fontWeight: '900',
    letterSpacing: 2,
    padding: 16,
    textAlign: 'center',
  },
};
