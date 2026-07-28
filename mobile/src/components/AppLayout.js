import { useState } from 'react';
import { Image, Modal, Pressable, View } from 'react-native';
import { Avatar, Button, Card, IconButton, Text } from 'react-native-paper';

import { useAuth } from '../context/AuthContext';
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
      <Screen refreshControl={refreshControl}>
        <AppTopBar onMenu={() => setMenuOpen(true)} user={user} navigation={navigation} />
        {showHero && (
          <Card style={styles.brandHero} mode="contained">
            <Card.Content style={styles.brandHeroContent}>
              <View style={styles.flex}>
                <Text variant="headlineSmall" style={styles.brandHeroTitle}>{title || `Ola, ${firstName(user?.nome)}`}</Text>
                <Text style={styles.brandHeroSubtitle}>{subtitle || 'Que bom te ver por aqui novamente.'}</Text>
              </View>
              <Image source={require('../../assets/logo_reduzida.png')} style={styles.heroLogoMark} resizeMode="contain" />
            </Card.Content>
          </Card>
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
    <View style={styles.appTopBar}>
      <View style={styles.logoRow}>
        <IconButton icon="menu" onPress={onMenu} iconColor={colors.ink} />
        <Image source={require('../../assets/logo_reduzida.png')} style={styles.topLogoIcon} resizeMode="contain" />
        <Text variant="headlineSmall" style={styles.topBrandName}>Elovia</Text>
      </View>
      <View style={styles.topActions}>
        <Pressable onPress={() => navigation.navigate('PerfilUsuario')}>
          <Avatar.Text size={42} label={initials(user?.nome)} style={styles.topAvatar} />
        </Pressable>
      </View>
    </View>
  );
}

function BottomMenu({ role, active, navigation, onMore }) {
  const items = role === 'ADMIN'
    ? [
      { key: 'home', label: 'Início', icon: 'home-outline', action: () => navigation.navigate('AdminHome') },
      { key: 'alunos', label: 'Alunos', icon: 'account-school-outline', action: () => navigation.navigate('Alunos') },
      { key: 'plus', label: '', icon: 'plus', primary: true, action: () => navigation.navigate('AlunoForm') },
      { key: 'mediadores', label: 'Mediadores', icon: 'account-heart-outline', action: () => navigation.navigate('Mediadores') },
      { key: 'more', label: 'Mais', icon: 'dots-horizontal', action: onMore },
    ]
    : [
      { key: 'home', label: 'Início', icon: 'home-outline', action: () => navigation.navigate('MediadorHome') },
      { key: 'alunos', label: 'Alunos', icon: 'account-school-outline', action: () => navigation.navigate('MediadorAlunos') },
      { key: 'plus', label: '', icon: 'plus', primary: true, action: () => navigation.navigate('IniciarSessao') },
      { key: 'sessoes', label: 'Acomp.', icon: 'clipboard-text-clock-outline', action: () => navigation.navigate('Sessoes') },
      { key: 'more', label: 'Mais', icon: 'dots-horizontal', action: onMore },
    ];

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
  const roleLabel = role === 'ADMIN' ? 'Administrador' : 'Mediador';
  const items = role === 'ADMIN'
    ? [
      { label: 'Início', icon: 'home-outline', route: 'AdminHome' },
      { label: 'Meu perfil', icon: 'account-edit-outline', route: 'PerfilUsuario' },
      { label: 'Alunos', icon: 'account-school-outline', route: 'Alunos' },
      { label: 'Mediadores', icon: 'account-heart-outline', route: 'Mediadores' },
      { label: 'Biblioteca', icon: 'book-open-page-variant-outline', route: 'Alunos' },
      { label: 'Cadastrar aluno', icon: 'school-outline', route: 'AlunoForm' },
      { label: 'Cadastrar mediador', icon: 'account-plus-outline', route: 'MediadorForm' },
      { label: 'Sobre o app', icon: 'information-outline', route: 'About' },
    ]
    : [
      { label: 'Início', icon: 'home-outline', route: 'MediadorHome' },
      { label: 'Meu perfil', icon: 'account-edit-outline', route: 'PerfilUsuario' },
      { label: 'Meus alunos', icon: 'account-school-outline', route: 'MediadorAlunos' },
      { label: 'Acompanhamento', icon: 'clipboard-text-clock-outline', route: 'Sessoes' },
      { label: 'Iniciar sessao', icon: 'play-circle-outline', route: 'IniciarSessao' },
      { label: 'Biblioteca', icon: 'book-open-page-variant-outline', route: 'MediadorAlunos' },
      { label: 'Sobre o app', icon: 'information-outline', route: 'About' },
    ];

  function go(route) {
    onClose();
    navigation.navigate(route);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.sideOverlay}>
        <Pressable style={styles.sideDim} onPress={onClose} />
        <View style={styles.sidePanel}>
          <View style={styles.sideHeader}>
            <IconButton icon="close" iconColor={colors.white} onPress={onClose} style={styles.sideClose} />
            <Avatar.Text size={78} label={initials(user?.nome)} style={styles.sideAvatar} />
            <View>
              <Text variant="titleLarge" style={styles.sideName}>{user?.nome}</Text>
              <Text style={styles.sideRole}>{roleLabel}</Text>
            </View>
          </View>
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
