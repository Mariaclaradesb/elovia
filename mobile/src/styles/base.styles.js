import { Platform } from 'react-native';

import { colors } from '../theme/colors';

const isWeb = Platform.OS === 'web';
const webPageMaxWidth = 1120;

export const baseStyles = {
  flex: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    ...(isWeb && {
      minHeight: '100vh',
    }),
  },
  modernHeader: {
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    elevation: 5,
    overflow: 'hidden',
    shadowColor: colors.purple,
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    ...(isWeb && {
      borderBottomLeftRadius: 14,
      borderBottomRightRadius: 14,
    }),
  },
  modernHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 64,
    paddingHorizontal: 8,
  },
  modernHeaderAction: {
    height: 48,
    margin: 0,
    width: 48,
  },
  modernHeaderTitle: {
    color: colors.ink,
    flex: 1,
    fontFamily: 'Nunito_800ExtraBold',
    letterSpacing: 0,
    textAlign: 'center',
  },
  screen: {
    gap: 14,
    padding: 16,
    paddingBottom: 118,
    ...(isWeb && {
      alignSelf: 'center',
      maxWidth: webPageMaxWidth,
      paddingBottom: 108,
      paddingHorizontal: 32,
      width: '100%',
    }),
  },
  screenWithTopInset: {
    paddingTop: 8,
  },
  centered: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    flex: 1,
    gap: 16,
    justifyContent: 'center',
  },
  loadingLogo: {
    height: 150,
    width: 150,
  },
};
