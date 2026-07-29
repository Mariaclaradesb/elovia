import { colors } from '../theme/colors';

export const studentStyles = {
  stepHeader: {
    backgroundColor: '#F0FBF8',
    borderColor: '#DDF8F0',
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  stepProgress: { borderRadius: 8, height: 8 },
  responsavelBox: {
    backgroundColor: '#FBF8FF',
    borderColor: colors.lavender,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 10,
  },
  clinicalItemBox: {
    backgroundColor: colors.tealSoft,
    borderColor: '#C8EEE5',
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  investigationOption: {
    alignItems: 'center',
    backgroundColor: colors.lavenderSoft,
    borderColor: colors.lavender,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 78,
    padding: 14,
  },
  stepActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-end',
  },
};
