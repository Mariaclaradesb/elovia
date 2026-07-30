import { colors } from '../theme/colors';

export const studentStyles = {
  studentListCard: {
    borderRadius: 18,
    elevation: 1,
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  studentListContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  studentListRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 58,
  },
  studentListAvatar: {
    borderRadius: 22,
    height: 44,
    width: 44,
  },
  studentListInfo: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  studentListName: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 18,
  },
  studentListMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  studentListBadge: {
    alignSelf: 'center',
    borderRadius: 12,
    maxWidth: 118,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  studentListBadgeOk: {
    backgroundColor: colors.lavenderSoft,
  },
  studentListBadgeWarning: {
    backgroundColor: '#FFF4DB',
  },
  studentListBadgeDisabled: {
    backgroundColor: colors.inactiveBg,
  },
  studentListBadgeText: {
    color: colors.purple,
    fontSize: 11,
    fontWeight: '800',
  },
  studentListBadgeWarningText: {
    color: '#B46A00',
  },
  studentListBadgeDisabledText: {
    color: colors.inactive,
  },
  studentListCount: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    minWidth: 30,
  },
  studentListCountText: {
    color: colors.purple,
    fontSize: 12,
    fontWeight: '900',
  },
  studentListActions: {
    alignItems: 'center',
    borderLeftColor: colors.line,
    borderLeftWidth: 1,
    flexDirection: 'row',
    gap: 2,
    paddingLeft: 8,
  },
  studentListActionButton: {
    height: 30,
    margin: 0,
    width: 30,
  },
  studentListStatusDot: {
    borderRadius: 5,
    height: 10,
    position: 'absolute',
    right: 10,
    top: 10,
    width: 10,
  },
  studentListStatusActive: {
    backgroundColor: '#16B364',
  },
  studentListStatusWarning: {
    backgroundColor: '#FDB022',
  },
  studentListStatusInactive: {
    backgroundColor: '#98A2B3',
  },
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
