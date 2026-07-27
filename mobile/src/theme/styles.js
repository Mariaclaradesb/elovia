import { StyleSheet } from 'react-native';

import { colors } from './colors';

export const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  screen: {
    gap: 14,
    padding: 16,
    paddingBottom: 96,
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
    borderRadius: 8,
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
    minHeight: 56,
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
    borderRadius: 8,
  },
  card: {
    borderRadius: 8,
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
    borderRadius: 8,
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
  formGap: {
    gap: 12,
  },
  listInputGroup: {
    gap: 8,
  },
  photoPicker: {
    alignItems: 'center',
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 12,
  },
  studentPhoto: {
    borderRadius: 46,
    height: 92,
    width: 92,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    borderRadius: 8,
    flexBasis: '31%',
    flexGrow: 1,
    minWidth: 104,
  },
  statContent: {
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    color: colors.ink,
    fontWeight: '900',
  },
  quickGrid: {
    gap: 10,
  },
  sectionTitle: {
    color: colors.ink,
    fontWeight: '800',
  },
  search: {
    borderRadius: 8,
  },
  itemRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  itemTitle: {
    color: colors.ink,
    fontWeight: '800',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  divider: {
    marginVertical: 12,
  },
  rowEnd: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  fab: {
    backgroundColor: colors.yellow,
    bottom: 22,
    position: 'absolute',
    right: 22,
  },
  empty: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 22,
  },
});
