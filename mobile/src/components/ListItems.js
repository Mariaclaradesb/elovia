import { View } from 'react-native';
import { Avatar, Card, Chip, Divider, Text } from 'react-native-paper';

import { colors } from '../theme';
import { styles } from '../theme/styles';
import { initials } from '../utils/text';

export function MediadorListItem({ mediador, actions, onPress }) {
  const disabled = !mediador.ativo;

  return (
    <Card style={[styles.card, disabled && styles.inactiveCard]} onPress={onPress}>
      <Card.Content>
        <View style={styles.itemRow}>
          <Avatar.Text size={42} label={initials(mediador.nome)} style={{ backgroundColor: disabled ? colors.inactive : colors.purple }} />
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

export function AlunoListItem({ aluno, actions, onPress }) {
  const disabled = !aluno.ativo;

  return (
    <Card style={[styles.card, disabled && styles.inactiveCard]} onPress={onPress}>
      <Card.Content>
        <View style={styles.itemRow}>
          <Avatar.Icon size={42} icon="school" style={{ backgroundColor: disabled ? colors.inactive : colors.teal }} />
          <View style={styles.flex}>
            <Text variant="titleMedium" style={[styles.itemTitle, disabled && styles.inactiveText]}>{aluno.nome}</Text>
            <Text style={styles.muted}>{aluno.escola} - {aluno.turma || 'Turma não informada'} - {aluno.turno}</Text>
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
