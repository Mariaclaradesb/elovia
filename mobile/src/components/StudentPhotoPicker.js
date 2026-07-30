import * as ImagePicker from 'expo-image-picker';
import { useEffect } from 'react';
import { Image, View } from 'react-native';
import { Avatar, Button, Text } from 'react-native-paper';

import { styles } from '../theme/styles';
import { preparePickedImage } from '../utils/imageAssets';
import { getDisplayImageUri } from '../utils/imageUri';

export default function StudentPhotoPicker({ value, onChange, onError }) {
  const previewUri = getDisplayImageUri(value);

  async function handleResult(result) {
    if (!result?.canceled && result?.assets?.[0]?.uri) {
      try {
        const image = await preparePickedImage(result.assets[0], `aluno-${Date.now()}.jpg`);
        onChange(image.uri, image);
      } catch {
        onError?.('Não foi possível preparar a foto. Tente escolher uma imagem da galeria.');
      }
    }
  }

  useEffect(() => {
    ImagePicker.getPendingResultAsync()
      .then((result) => handleResult(result))
      .catch(() => {});
  }, []);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      onError?.('Permita acesso as fotos para selecionar a imagem do aluno.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      legacy: true,
    });

    handleResult(result);
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      onError?.('Permita acesso a camera para tirar a foto do aluno.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      base64: false,
      exif: false,
      quality: 0.45,
      legacy: true,
    });

    handleResult(result);
  }

  return (
    <View style={styles.photoPicker}>
      {previewUri ? (
        <Image source={{ uri: previewUri }} style={styles.studentPhoto} />
      ) : (
        <Avatar.Icon icon="camera-plus-outline" size={92} />
      )}
      <View style={styles.flex}>
        <Text style={styles.itemTitle}>Foto do aluno</Text>
        {/* <Text style={styles.muted}>Selecione da galeria ou tire uma foto agora.</Text> */}
        <Text style={styles.muted}>Selecione uma foto da galeria.</Text>
        <View style={styles.fileActions}>
          {/* <Button mode="outlined" icon="camera-outline" onPress={takePhoto}>Tirar foto</Button> */}
          <Button mode="outlined" icon="image-plus" onPress={pickImage}>Galeria</Button>
        </View>
      </View>
    </View>
  );
}
