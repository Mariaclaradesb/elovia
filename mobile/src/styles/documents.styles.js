import { colors } from '../theme/colors';

export const documentsStyles = {
  horizontalTabs: { gap: 8, paddingVertical: 4 },
  tabChip: { borderRadius: 16 },
  filterGrid: { gap: 10 },
  documentHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  documentDescription: { color: colors.ink, lineHeight: 20, marginTop: 4 },
  fileActions: { gap: 10 },
  filePickerBox: {
    borderColor: 'transparent',
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 10,
    padding: 2,
  },
  filePickerBoxError: {
    borderColor: colors.danger,
    padding: 10,
  },
  errorText: { color: colors.danger },
  viewer: { backgroundColor: colors.ink, flex: 1 },
  viewerImage: { flex: 1, height: '100%', width: '100%' },
  webViewer: { flex: 1 },
};
