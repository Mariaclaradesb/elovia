import { View } from 'react-native';
import { Avatar, Card, IconButton, Text } from 'react-native-paper';

import { colors } from '../../theme';
import { styles } from '../../theme/styles';
import { getDisplayImageUri } from '../../utils/imageUri';

export default function AlunoListItem({ aluno, actions, onPress }) {
  const disabled = !aluno.ativo;
  const mediadores = aluno.mediadorIds?.length || 0;
  const foto = getDisplayImageUri(aluno.foto);
  const hasMediator = mediadores > 0;
  const badgeText = disabled ? 'Desativado' : !hasMediator ? 'Sem mediador' : '';
  const actionItems = Array.isArray(actions) ? actions : [];
  const statusStyle = disabled
    ? styles.studentListStatusInactive
    : hasMediator
      ? styles.studentListStatusActive
      : styles.studentListStatusWarning;

  return (
    <Card style={[styles.studentListCard, disabled && styles.inactiveCard]} onPress={onPress}>
      <View style={[styles.studentListStatusDot, statusStyle]} />
      <Card.Content style={styles.studentListContent}>
        <View style={styles.studentListRow}>
          {foto ? (
            <Avatar.Image size={44} source={{ uri: foto }} />
          ) : (
            <Avatar.Text
              size={44}
              label={(aluno.nome || 'A').trim().charAt(0).toUpperCase()}
              style={[styles.avatarTeal, disabled && styles.avatarInactive]}
              labelStyle={{ fontSize: 17, fontWeight: '900' }}
            />
          )}
          <View style={styles.studentListInfo}>
            <Text numberOfLines={1} style={[styles.studentListName, disabled && styles.inactiveText]}>{aluno.nome}</Text>
            <Text numberOfLines={1} style={styles.studentListMeta}>{aluno.turma || 'Turma não informada'} · {aluno.turno || 'Turno não informado'}</Text>
          </View>
          {!!badgeText && (
            <View style={[
              styles.studentListBadge,
              disabled ? styles.studentListBadgeDisabled : styles.studentListBadgeWarning,
            ]}>
              <Text
                numberOfLines={1}
                style={[
                  styles.studentListBadgeText,
                  !disabled && styles.studentListBadgeWarningText,
                  disabled && styles.studentListBadgeDisabledText,
                ]}
              >
                {badgeText}
              </Text>
            </View>
          )}
          <View style={styles.studentListCount}>
            <IconButton icon="account-multiple-outline" size={18} iconColor={colors.purple} style={styles.studentListActionButton} />
            <Text style={styles.studentListCountText}>{mediadores}</Text>
          </View>
          {!!actionItems.length && (
            <View style={styles.studentListActions}>
              {actionItems.map((item) => (
                <IconButton
                  key={item.icon}
                  icon={item.icon}
                  size={20}
                  iconColor={item.color || colors.muted}
                  onPress={item.onPress}
                  style={styles.studentListActionButton}
                  accessibilityLabel={item.label}
                />
              ))}
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}
