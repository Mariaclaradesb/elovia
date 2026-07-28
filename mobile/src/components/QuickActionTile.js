import { Pressable } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

import { colors } from '../theme';
import { styles } from '../theme/styles';

export default function QuickActionTile({ label, icon, onPress, color = colors.purple }) {
  return (
    <Pressable style={styles.actionTile} onPress={onPress}>
      <IconButton icon={icon} size={28} iconColor={color} style={styles.actionIconCircle} />
      <Text style={styles.actionTileText}>{label}</Text>
    </Pressable>
  );
}
