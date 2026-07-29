import { colors } from '../theme/colors';

export const commonStyles = {
  card: {
    borderRadius: 20,
    elevation: 1,
    shadowColor: colors.purple,
    shadowOpacity: 0.06,
    shadowRadius: 10,
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
