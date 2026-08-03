import { Platform } from 'react-native';

import { colors } from '../theme/colors';

const isWeb = Platform.OS === 'web';

export const authStyles = {
  loginWrapper: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  loginScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 22,
    paddingBottom: 80,
    backgroundColor: colors.white,
    ...(isWeb && {
      alignSelf: 'center',
      backgroundColor: 'transparent',
      maxWidth: 460,
      minHeight: '100vh',
      paddingHorizontal: 24,
      paddingVertical: 44,
      width: '100%',
    }),
  },
  loginLogo: {
    alignSelf: 'center',
    height: 250,
    marginBottom: 8,
    width: '100%',
    ...(isWeb && {
      height: 170,
      maxWidth: 320,
    }),
  },
  authHero: {
    alignItems: 'center',
    marginBottom: 10,
  },
  authCurve: {
    borderBottomColor: colors.purple,
    borderBottomWidth: 2,
    borderRadius: 200,
    height: 22,
    opacity: 0.45,
    width: '96%',
    ...(isWeb && {
      width: '72%',
    }),
  },
  authCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    elevation: 0,
    ...(isWeb && {
      borderColor: colors.line,
      borderRadius: 14,
      borderWidth: 1,
      boxShadow: '0 18px 50px rgba(38, 50, 56, 0.10)',
    }),
  },
  authTitle: {
    color: colors.ink,
    fontWeight: '900',
    textAlign: 'center',
  },
  authSubtitle: {
    color: colors.muted,
    marginBottom: 8,
    textAlign: 'center',
  },
  authFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryButtonContent: {
    minHeight: 58,
  },
  alignEnd: {
    alignSelf: 'flex-end',
  },
  registerScroll: {
    flexGrow: 1,
    padding: 22,
    paddingBottom: 120,
    backgroundColor: colors.white,
  },
  registerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },
  registerLogo: {
    alignSelf: 'center',
    height: 118,
    marginVertical: 16,
    width: 118,
  },
  firstAccessLogo: {
    alignSelf: 'center',
    height: 180,
    width: 180,
  },
  loginCard: {
    borderRadius: 22,
    ...(isWeb && {
      borderRadius: 14,
    }),
  },
};
