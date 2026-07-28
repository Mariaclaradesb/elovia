import * as ImagePicker from 'expo-image-picker';
import { Image, View } from 'react-native';
import { Avatar, Button, Text } from 'react-native-paper';

import { styles } from '../theme/styles';

export default function ProfilePhotoPicker({ value, onChange, onError }) {
  async function openPicker(useCamera) {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      onError?.(`Permita acesso ${useCamera ? 'a camera' : 'as fotos'} para atualizar seu perfil.`);
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.75 })
      : await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.75,
      });

    if (!result.canceled && result.assets?.[0]) {
      onChange(result.assets[0]);
    }
  }

  return (
    <View style={styles.profilePhotoPicker}>
      {value ? (
        <Image source={{ uri: value }} style={styles.profilePhotoLarge} />
      ) : (
        <Avatar.Icon icon="account-camera-outline" size={112} />
      )}
      <View style={styles.profilePhotoActions}>
        <Text style={styles.itemTitle}>Foto de perfil</Text>
        <Text style={styles.muted}>Use a camera ou escolha uma foto da galeria.</Text>
        <View style={styles.fileActionsRow}>
          <Button mode="outlined" icon="camera-outline" onPress={() => openPicker(true)}>Camera</Button>
          <Button mode="outlined" icon="image-outline" onPress={() => openPicker(false)}>Galeria</Button>
        </View>
      </View>
    </View>
  );
}
