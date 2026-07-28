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
    paddingBottom: 118,
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
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionTile: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 1,
    flexBasis: '30%',
    flexGrow: 1,
    gap: 6,
    minHeight: 106,
    padding: 10,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  actionIconCircle: {
    backgroundColor: '#F2ECFF',
    margin: 0,
  },
  actionTileText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
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
    bottom: 104,
    position: 'absolute',
    right: 22,
  },
  empty: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 22,
  },
  profileHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  profilePhoto: {
    borderRadius: 38,
    height: 76,
    width: 76,
  },
  infoLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 21,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoTile: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    gap: 4,
    padding: 10,
  },
  infoTileFull: {
    flexBasis: '100%',
  },
  horizontalTabs: {
    gap: 8,
    paddingVertical: 4,
  },
  tabChip: {
    borderRadius: 8,
  },
  filterGrid: {
    gap: 10,
  },
  stepHeader: {
    backgroundColor: '#F0FBF8',
    borderColor: '#DDF8F0',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  stepProgress: {
    borderRadius: 8,
    height: 8,
  },
  responsavelBox: {
    backgroundColor: '#FBF8FF',
    borderColor: colors.lavender,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 10,
  },
  stepActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-end',
  },
  documentHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  documentDescription: {
    color: colors.ink,
    lineHeight: 20,
    marginTop: 4,
  },
  fileActions: {
    gap: 10,
  },
  errorText: {
    color: colors.danger,
  },
  viewer: {
    backgroundColor: colors.ink,
    flex: 1,
  },
  viewerImage: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  webViewer: {
    flex: 1,
  },
  sessionHeader: {
    borderRadius: 0,
  },
  sessionContent: {
    flex: 1,
    padding: 16,
  },
  sessionScroll: {
    gap: 12,
    paddingBottom: 40,
  },
  timelineHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  timelineTime: {
    color: colors.tealDark,
    fontWeight: '900',
  },
  sheetBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    maxHeight: '88%',
  },
  bottomSheetContent: {
    gap: 12,
    padding: 16,
    paddingBottom: 32,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activeSessionCard: {
    borderColor: colors.teal,
    borderWidth: 1,
  },
  activeChip: {
    backgroundColor: '#DDF8F0',
  },
  appTopBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  logoRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 2,
  },
  topLogoIcon: {
    height: 42,
    width: 42,
  },
  topLogoWord: {
    height: 46,
    width: 118,
  },
  topBrandName: {
    color: colors.purple,
    fontWeight: '900',
  },
  topActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  topAvatar: {
    backgroundColor: colors.lavender,
    borderColor: colors.yellow,
    borderWidth: 2,
  },
  brandHero: {
    backgroundColor: colors.lavender,
    borderRadius: 8,
    overflow: 'hidden',
  },
  welcomeCard: {
    backgroundColor: '#F0FBF8',
    borderColor: '#DDF8F0',
    borderRadius: 8,
    borderWidth: 1,
  },
  gradientCard: {
    backgroundColor: colors.purple,
    borderBottomColor: colors.teal,
    borderBottomWidth: 5,
    borderRadius: 8,
    borderRightColor: colors.yellow,
    borderRightWidth: 5,
  },
  gradientCardTitle: {
    color: colors.white,
    fontWeight: '900',
  },
  gradientCardSubtitle: {
    color: colors.white,
    opacity: 0.92,
  },
  brandHeroContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    minHeight: 128,
  },
  brandHeroTitle: {
    color: colors.ink,
    fontWeight: '900',
    lineHeight: 32,
  },
  brandHeroSubtitle: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  heroLogoMark: {
    height: 118,
    opacity: 0.95,
    width: 118,
  },
  bottomMenu: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    bottom: 0,
    elevation: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    left: 0,
    paddingBottom: 10,
    paddingTop: 8,
    position: 'absolute',
    right: 0,
  },
  bottomMenuItem: {
    alignItems: 'center',
    flex: 1,
    minHeight: 64,
  },
  bottomIconWrap: {
    alignItems: 'center',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 46,
  },
  bottomIcon: {
    margin: 0,
  },
  bottomPrimaryButton: {
    backgroundColor: colors.purple,
    borderRadius: 28,
    height: 58,
    marginTop: -26,
    width: 58,
  },
  bottomActive: {
    backgroundColor: '#F2ECFF',
  },
  bottomLabel: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  bottomLabelActive: {
    color: colors.purple,
    fontWeight: '800',
  },
  sideOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  sideDim: {
    backgroundColor: 'rgba(0,0,0,0.38)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sidePanel: {
    backgroundColor: colors.white,
    borderBottomRightRadius: 8,
    borderTopRightRadius: 8,
    elevation: 16,
    overflow: 'hidden',
    width: '82%',
  },
  sideHeader: {
    backgroundColor: colors.purple,
    minHeight: 190,
    padding: 22,
    paddingTop: 34,
  },
  sideClose: {
    alignSelf: 'flex-end',
    margin: 0,
  },
  sideAvatar: {
    backgroundColor: colors.white,
    marginBottom: 12,
  },
  sideName: {
    color: colors.white,
    fontWeight: '900',
  },
  sideRole: {
    color: colors.white,
    opacity: 0.9,
  },
  sideItems: {
    padding: 14,
  },
  sideItem: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    minHeight: 54,
  },
  sideItemText: {
    color: colors.ink,
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  aboutCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
  },
  aboutLogo: {
    alignSelf: 'center',
    height: 180,
    width: '100%',
  },
});
