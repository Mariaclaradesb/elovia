import { useState } from 'react';
import { Image, Modal, Pressable, View } from 'react-native';
import { Avatar, Button, IconButton, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../context/AuthContext';
import { navigationText } from '../content/navigationText';
import { getBottomMenuItems, getSideMenuItems } from '../navigation/menuItems';
import { colors } from '../theme';
import { styles } from '../theme/styles';
import { firstName, initials } from '../utils/text';
import Screen from './Screen';

export default function AppLayout({
  children,
  navigation,
  role,
  active = 'home',
  title,
  subtitle,
  refreshControl,
  showHero = true,
}) {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={styles.flex}>
      <Screen refreshControl={refreshControl} topInset>
        <AppTopBar onMenu={() => setMenuOpen(true)} user={user} navigation={navigation} />
        {showHero && (
          <LinearGradient
            colors={[colors.lavenderSoft, colors.tealSoft, colors.yellowSoft]}
            locations={[0, 0.72, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.brandHero}
          >
            <View style={[styles.brandHeroContent, styles.brandHeroInner]}>
              <View style={styles.flex}>
                <Text variant="headlineSmall" style={styles.brandHeroTitle}>{title || `Ola, ${firstName(user?.nome)}`}</Text>
                <Text style={styles.brandHeroSubtitle}>{subtitle || navigationText.defaultGreeting}</Text>
              </View>
              <Image source={require('../../assets/logo_reduzida.png')} style={styles.heroLogoMark} resizeMode="contain" />
            </View>
          </LinearGradient>
        )}
        {!showHero && !!title && (
          <LinearGradient
            colors={[colors.lavenderSoft, colors.tealSoft]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.compactPageHeader}
          >
            <Text variant="titleLarge" style={styles.compactPageTitle}>{title}</Text>
            {!!subtitle && <Text style={styles.compactPageSubtitle}>{subtitle}</Text>}
          </LinearGradient>
        )}
        {children}
      </Screen>
      <BottomMenu role={role} active={active} navigation={navigation} onMore={() => setMenuOpen(true)} />
      <SideMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        role={role}
        user={user}
        navigation={navigation}
        signOut={signOut}
      />
    </View>
  );
}

function AppTopBar({ onMenu, user, navigation }) {
  return (
    <LinearGradient colors={[colors.lavenderSoft, colors.tealSoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.appTopBarGradient}>
      <View style={styles.appTopBar}>
        <View style={styles.logoRow}>
          <IconButton icon="menu" onPress={onMenu} iconColor={colors.ink} />
          <Image source={require('../../assets/logo_reduzida.png')} style={styles.topLogoIcon} resizeMode="contain" />
          <Text variant="headlineSmall" style={styles.topBrandName}>{navigationText.brandName}</Text>
        </View>
        <View style={styles.topActions}>
          <Pressable onPress={() => navigation.navigate('PerfilUsuario')}>
            {user?.foto ? (
              <Avatar.Image size={42} source={{ uri: user.foto }} style={styles.topAvatar} />
            ) : (
              <Avatar.Text size={42} label={initials(user?.nome)} style={styles.topAvatar} />
            )}
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

function BottomMenu({ role, active, navigation, onMore }) {
  const items = getBottomMenuItems(role, navigation, onMore, active);

  return (
    <View style={styles.bottomMenu}>
      {items.map((item) => (
        <Pressable key={item.key} style={styles.bottomMenuItem} onPress={item.action}>
          <View style={[styles.bottomIconWrap, item.primary && styles.bottomPrimaryButton, active === item.key && styles.bottomActive]}>
            <IconButton
              icon={item.icon}
              size={item.primary ? 30 : 24}
              iconColor={item.primary ? colors.white : active === item.key ? colors.purple : colors.muted}
              style={styles.bottomIcon}
            />
          </View>
          {!!item.label && <Text style={[styles.bottomLabel, active === item.key && styles.bottomLabelActive]}>{item.label}</Text>}
        </Pressable>
      ))}
    </View>
  );
}

function SideMenu({ visible, onClose, role, user, navigation, signOut }) {
  const roleLabel = navigationText.roles[role] || navigationText.roles.MEDIADOR;
  const items = getSideMenuItems(role);

  function go(route) {
    onClose();
    navigation.navigate(route);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.sideOverlay}>
        <Pressable style={styles.sideDim} onPress={onClose} />
        <View style={styles.sidePanel}>
          <LinearGradient colors={[colors.purple, colors.teal]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sideHeader}>
            <IconButton icon="close" iconColor={colors.white} onPress={onClose} style={styles.sideClose} />
            {user?.foto ? (
              <Avatar.Image size={78} source={{ uri: user.foto }} style={styles.sideAvatar} />
            ) : (
              <Avatar.Text size={78} label={initials(user?.nome)} style={styles.sideAvatar} />
            )}
            <View>
              <Text variant="titleLarge" style={styles.sideName}>{user?.nome}</Text>
              <Text style={styles.sideRole}>{roleLabel}</Text>
            </View>
          </LinearGradient>
          <View style={styles.sideItems}>
            {items.map((item) => (
              <Pressable key={item.label} style={styles.sideItem} onPress={() => go(item.route)}>
                <IconButton icon={item.icon} iconColor={colors.purple} />
                <Text style={styles.sideItemText}>{item.label}</Text>
                <IconButton icon="chevron-right" iconColor={colors.muted} />
              </Pressable>
            ))}
          </View>
          <Button mode="text" icon="logout" textColor={colors.danger} onPress={() => { onClose(); signOut(); }}>
            Sair
          </Button>
        </View>
      </View>
    </Modal>
  );
}
