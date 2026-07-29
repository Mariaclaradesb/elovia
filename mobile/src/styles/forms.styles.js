import { colors } from '../theme/colors';

export const formsStyles = {
  formGap: { gap: 16 },
  formField: { gap: 8, width: '100%' },
  formFieldLabel: {
    color: colors.tealDark,
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    letterSpacing: 0.6,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  formInput: {
    backgroundColor: colors.inputBg,
    fontFamily: 'Nunito_400Regular',
    minHeight: 64,
  },
  formInputDisabled: { backgroundColor: '#F3F7F6' },
  formInputContent: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    minHeight: 64,
    paddingHorizontal: 18,
  },
  formInputMultiline: {
    minHeight: 110,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  formInputOutline: { borderRadius: 22, borderWidth: 1.5 },
  selectAnchor: { width: '100%' },
  selectMenu: { borderRadius: 12, minWidth: 220 },
  listInputGroup: { gap: 8 },
  photoPicker: {
    alignItems: 'center',
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 12,
  },
  studentPhoto: { borderRadius: 46, height: 92, width: 92 },
};
