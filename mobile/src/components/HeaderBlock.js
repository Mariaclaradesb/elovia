import { Image, View } from 'react-native';
import { Card, IconButton, Text } from 'react-native-paper';

import { styles } from '../theme/styles';

export default function HeaderBlock({ title, subtitle, onLogout }) {
  return (
    <Card style={styles.headerCard}>
      <Card.Content style={styles.headerContent}>
        <View style={styles.headerText}>
          <Image source={require('../../assets/logo_reduzida.png')} style={styles.smallLogo} resizeMode="contain" />
          <View style={styles.flex}>
            <Text variant="titleLarge" style={styles.title}>{title}</Text>
            <Text style={styles.muted}>{subtitle}</Text>
          </View>
        </View>
        <IconButton icon="logout" onPress={onLogout} />
      </Card.Content>
    </Card>
  );
}
