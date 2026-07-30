import { View } from 'react-native';
import { Avatar, Card, IconButton, Text } from 'react-native-paper';

import { colors } from '../../theme';
import { styles } from '../../theme/styles';
import { getDisplayImageUri } from '../../utils/imageUri';
import { initials } from '../../utils/text';

export default function MediadorListItem({ mediador, actions, onPress }) {
  const disabled = !mediador.ativo;
  const actionItems = Array.isArray(actions) ? actions : [];
  const statusStyle = disabled ? styles.studentListStatusInactive : styles.studentListStatusActive;
  const foto = getDisplayImageUri(mediador.foto);

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
              label={initials(mediador.nome)}
              style={[styles.avatarPurple, disabled && styles.avatarInactive]}
              labelStyle={{ fontSize: 16, fontWeight: '900' }}
            />
          )}
          <View style={styles.studentListInfo}>
            <Text numberOfLines={1} style={[styles.studentListName, disabled && styles.inactiveText]}>{mediador.nome}</Text>
            <Text numberOfLines={1} style={styles.studentListMeta}>{mediador.cargo || 'Cargo não informado'} · {mediador.escola || mediador.email}</Text>
          </View>
          {disabled && (
            <View style={[styles.studentListBadge, styles.studentListBadgeDisabled]}>
              <Text numberOfLines={1} style={[styles.studentListBadgeText, styles.studentListBadgeDisabledText]}>
                Desativado
              </Text>
            </View>
          )}
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
