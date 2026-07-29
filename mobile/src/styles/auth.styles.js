import { colors } from '../theme/colors';

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
  },
  loginLogo: {
    alignSelf: 'center',
    height: 250,
    marginBottom: 8,
    width: '100%',
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
  },
  authCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    elevation: 0,
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
  },
};
