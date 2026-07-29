import { View } from 'react-native';
import { Avatar, Card, Chip, Divider, Text } from 'react-native-paper';

import { styles } from '../../theme/styles';
import { initials } from '../../utils/text';

export default function MediadorListItem({ mediador, actions, onPress }) {
  const disabled = !mediador.ativo;

  return (
    <Card style={[styles.card, disabled && styles.inactiveCard]} onPress={onPress}>
      <Card.Content>
        <View style={styles.itemRow}>
          {mediador.foto ? (
            <Avatar.Image size={42} source={{ uri: mediador.foto }} />
          ) : (
            <Avatar.Text size={42} label={initials(mediador.nome)} style={[styles.avatarPurple, disabled && styles.avatarInactive]} />
          )}
          <View style={styles.flex}>
            <Text variant="titleMedium" style={[styles.itemTitle, disabled && styles.inactiveText]}>{mediador.nome}</Text>
            <Text style={styles.muted}>{mediador.email}</Text>
            <Text style={styles.muted}>{mediador.escola} - {mediador.cargo}</Text>
            <Chip compact style={[styles.statusChip, disabled && styles.inactiveChip]} textStyle={disabled && styles.inactiveChipText}>{mediador.ativo ? 'Ativo' : 'Desativado'}</Chip>
          </View>
        </View>
        {actions ? <><Divider style={styles.divider} />{actions}</> : null}
      </Card.Content>
    </Card>
  );
}
