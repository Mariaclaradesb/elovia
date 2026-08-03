import { Platform } from 'react-native';

import { colors } from '../theme/colors';

const isWeb = Platform.OS === 'web';

export const commonStyles = {
  card: {
    borderRadius: 20,
    elevation: 1,
    shadowColor: colors.purple,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    ...(isWeb && {
      borderColor: colors.line,
      borderRadius: 12,
      borderWidth: 1,
      elevation: 0,
    }),
  },
  inactiveCard: {
    backgroundColor: colors.inactiveBg,
    borderColor: colors.inactiveBorder,
    borderWidth: 1,
  },
  inactiveText: {
    color: colors.inactive,
  },
  inactiveChip: {
    backgroundColor: '#EAECF0',
  },
  inactiveChipText: {
    color: colors.inactive,
  },
  headerCard: {
    borderRadius: 20,
    overflow: 'hidden',
    ...(isWeb && {
      borderRadius: 12,
    }),
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  headerText: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  smallLogo: {
    height: 58,
    width: 58,
  },
  title: {
    color: colors.ink,
    fontWeight: '800',
  },
  muted: {
    color: colors.muted,
  },
};
