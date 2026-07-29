import { View } from 'react-native';
import { Avatar, Card, Chip, Divider, Text } from 'react-native-paper';

import { styles } from '../../theme/styles';

export default function AlunoListItem({ aluno, actions, onPress }) {
  const disabled = !aluno.ativo;

  return (
    <Card style={[styles.card, disabled && styles.inactiveCard]} onPress={onPress}>
      <Card.Content>
        <View style={styles.itemRow}>
          {aluno.foto ? (
            <Avatar.Image size={42} source={{ uri: aluno.foto }} />
          ) : (
            <Avatar.Icon size={42} icon="school" style={[styles.avatarTeal, disabled && styles.avatarInactive]} />
          )}
          <View style={styles.flex}>
            <Text variant="titleMedium" style={[styles.itemTitle, disabled && styles.inactiveText]}>{aluno.nome}</Text>
            <Text style={styles.muted}>{aluno.escola} - {aluno.turma || 'Turma n\u00e3o informada'} - {aluno.turno}</Text>
            <View style={styles.chipWrap}>
              {disabled && <Chip compact style={styles.inactiveChip} textStyle={styles.inactiveChipText}>Desativado</Chip>}
              {aluno.necessitaMediador && <Chip compact>Necessita mediador</Chip>}
              <Chip compact>{aluno.mediadorIds?.length || 0} mediador(es)</Chip>
            </View>
          </View>
        </View>
        {actions ? <><Divider style={styles.divider} />{actions}</> : null}
      </Card.Content>
    </Card>
  );
}
