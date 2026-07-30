import { View } from 'react-native';
import { Avatar, Card, Text } from 'react-native-paper';

import { categoriaObservacaoColor, categoriaObservacaoIcon, categoriaObservacaoLabel } from '../constants/acompanhamento';
import { styles } from '../theme/styles';
import { getDisplayImageUri } from '../utils/imageUri';

function hora(value) {
  if (!value) return '';
  return new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function TimelineItem({ item, onPress }) {
  const color = categoriaObservacaoColor(item.categoria);
  const alunoFoto = getDisplayImageUri(item.alunoFoto);

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.itemRow}>
          {alunoFoto ? (
            <Avatar.Image size={46} source={{ uri: alunoFoto }} />
          ) : (
            <Avatar.Icon size={46} icon={categoriaObservacaoIcon(item.categoria)} style={{ backgroundColor: color }} />
          )}
          <View style={styles.flex}>
            <View style={styles.timelineHeader}>
              <Text style={styles.timelineTime}>{hora(item.createdAt)}</Text>
              <Text style={styles.muted}>{item.alunoNome}</Text>
            </View>
            <Text style={styles.itemTitle}>{categoriaObservacaoLabel(item.categoria)}</Text>
            <Text style={styles.documentDescription}>{item.descricao}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}
