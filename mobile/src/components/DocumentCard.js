import { View } from 'react-native';
import { Avatar, Card, Chip, IconButton, Text } from 'react-native-paper';

import { categoryIcon, categoryLabel } from '../constants/documentCategories';
import { styles } from '../theme/styles';
import { isoToDisplayDate } from '../utils/date';

export default function DocumentCard({ documento, onPress, onMenu }) {
  const inactive = !documento.ativo;

  return (
    <Card style={[styles.card, inactive && styles.inactiveCard]} onPress={onPress}>
      <Card.Content>
        <View style={styles.itemRow}>
          <Avatar.Icon
            size={42}
            icon={categoryIcon(documento.categoria)}
            style={[styles.avatarPurple, inactive && styles.avatarInactive]}
          />
          <View style={styles.flex}>
            <View style={styles.documentHeader}>
              <Text variant="titleMedium" style={[styles.itemTitle, inactive && styles.inactiveText]}>{documento.titulo}</Text>
              <IconButton icon="dots-vertical" onPress={onMenu} />
            </View>
            <Text style={styles.muted}>{categoryLabel(documento.categoria)}</Text>
            {!!documento.descricao && <Text numberOfLines={2} style={styles.documentDescription}>{documento.descricao}</Text>}
            <View style={styles.chipWrap}>
              {!documento.ativo && <Chip compact style={styles.inactiveChip} textStyle={styles.inactiveChipText}>Desativado</Chip>}
              <Chip compact icon="account-outline">{documento.usuarioUploadNome || 'Não informado'}</Chip>
              <Chip compact icon="calendar-outline">{isoToDisplayDate(documento.dataDocumento) || 'Sem data'}</Chip>
              <Chip compact icon="upload-outline">{isoToDisplayDate(documento.dataUpload) || 'Upload'}</Chip>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}
