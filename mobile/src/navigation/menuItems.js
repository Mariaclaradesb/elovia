export function getBottomMenuItems(role, navigation, onMore, active) {
  if (role === 'ADMIN') {
    const primaryRoute = active === 'mediadores' ? 'MediadorForm' : 'AlunoForm';

    return [
      { key: 'home', label: 'In\u00edcio', icon: 'home-outline', action: () => navigation.navigate('AdminHome') },
      { key: 'alunos', label: 'Alunos', icon: 'account-school-outline', action: () => navigation.navigate('Alunos') },
      { key: 'plus', label: '', icon: 'plus', primary: true, action: () => navigation.navigate(primaryRoute) },
      { key: 'mediadores', label: 'Mediadores', icon: 'account-heart-outline', action: () => navigation.navigate('Mediadores') },
      { key: 'more', label: 'Mais', icon: 'dots-horizontal', action: onMore },
    ];
  }
  return [
    { key: 'home', label: 'In\u00edcio', icon: 'home-outline', action: () => navigation.navigate('MediadorHome') },
    { key: 'alunos', label: 'Alunos', icon: 'account-school-outline', action: () => navigation.navigate('MediadorAlunos') },
    { key: 'plus', label: '', icon: 'plus', primary: true, action: () => navigation.navigate('IniciarSessao') },
    { key: 'sessoes', label: 'Acomp.', icon: 'clipboard-text-clock-outline', action: () => navigation.navigate('Sessoes') },
    { key: 'more', label: 'Mais', icon: 'dots-horizontal', action: onMore },
  ];
}

export function getSideMenuItems(role) {
  if (role === 'ADMIN') {
    return [
      { label: 'In\u00edcio', icon: 'home-outline', route: 'AdminHome' },
      { label: 'Meu perfil', icon: 'account-edit-outline', route: 'PerfilUsuario' },
      { label: 'Alunos', icon: 'account-school-outline', route: 'Alunos' },
      { label: 'Mediadores', icon: 'account-heart-outline', route: 'Mediadores' },
      { label: 'Cadastrar aluno', icon: 'school-outline', route: 'AlunoForm' },
      { label: 'Cadastrar mediador', icon: 'account-plus-outline', route: 'MediadorForm' },
      { label: 'Sobre o app', icon: 'information-outline', route: 'About' },
    ];
  }
  return [
    { label: 'In\u00edcio', icon: 'home-outline', route: 'MediadorHome' },
    { label: 'Meu perfil', icon: 'account-edit-outline', route: 'PerfilUsuario' },
    { label: 'Meus alunos', icon: 'account-school-outline', route: 'MediadorAlunos' },
    { label: 'Acompanhamento', icon: 'clipboard-text-clock-outline', route: 'Sessoes' },
    { label: 'Iniciar sessao', icon: 'play-circle-outline', route: 'IniciarSessao' },
    { label: 'Sobre o app', icon: 'information-outline', route: 'About' },
  ];
}
