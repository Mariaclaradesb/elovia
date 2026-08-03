import * as ImagePicker from 'expo-image-picker';
import { Image, Platform, View } from 'react-native';
import { Avatar, Button, Text } from 'react-native-paper';

import { styles } from '../theme/styles';
import { preparePickedImage } from '../utils/imageAssets';
import { getDisplayImageUri } from '../utils/imageUri';

export default function ProfilePhotoPicker({ value, onChange, onError }) {
  const previewUri = getDisplayImageUri(value);
  const canUseCamera = Platform.OS !== 'web';

  async function handleResult(result, source) {
    if (!result?.canceled && result?.assets?.[0]) {
      try {
        const image = await preparePickedImage(result.assets[0], `perfil-${Date.now()}.jpg`);
        onChange({ ...image, source });
      } catch {
        onError?.('Nao foi possivel preparar a foto. Tente escolher uma imagem da galeria.');
      }
    }
  }

  async function openPicker(useCamera) {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      onError?.(`Permita acesso ${useCamera ? 'a camera' : 'as fotos'} para atualizar seu perfil.`);
      return;
    }

    try {
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
          allowsEditing: false,
          base64: false,
          exif: false,
          quality: 0.35,
          legacy: true,
        })
        : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'images',
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.75,
          legacy: true,
        });

      await handleResult(result, useCamera ? 'camera' : 'library');
    } catch {
      onError?.('Nao foi possivel abrir a camera. Tente selecionar uma foto da galeria.');
    }
  }

  return (
    <View style={styles.profilePhotoPicker}>
      {previewUri ? (
        <Image source={{ uri: previewUri }} style={styles.profilePhotoLarge} />
      ) : (
        <Avatar.Icon icon="account-circle-outline" size={112} />
      )}
      <View style={styles.profilePhotoActions}>
        <Text style={styles.itemTitle}>Foto de perfil</Text>
        <Text style={styles.muted}>
          {canUseCamera ? 'Use a camera ou escolha uma foto da galeria.' : 'Escolha uma foto da galeria.'}
        </Text>
        <View style={styles.fileActionsRow}>
          {canUseCamera && (
            <Button mode="outlined" icon="camera-outline" onPress={() => openPicker(true)}>Camera</Button>
          )}
          <Button mode="outlined" icon="image-outline" onPress={() => openPicker(false)}>Galeria</Button>
        </View>
      </View>
    </View>
  );
}
