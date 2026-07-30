import * as ImagePicker from 'expo-image-picker';
import { Image, View } from 'react-native';
import { Avatar, Button, Text } from 'react-native-paper';

import { styles } from '../theme/styles';

export default function StudentPhotoPicker({ value, onChange, onError }) {
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
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      onChange(result.assets[0].uri);
    }
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      onError?.('Permita acesso a camera para tirar a foto do aluno.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      onChange(result.assets[0].uri);
    }
  }

  return (
    <View style={styles.photoPicker}>
      {value ? (
        <Image source={{ uri: value }} style={styles.studentPhoto} />
      ) : (
        <Avatar.Icon icon="camera-plus-outline" size={92} />
      )}
      <View style={styles.flex}>
        <Text style={styles.itemTitle}>Foto do aluno</Text>
        <Text style={styles.muted}>Selecione da galeria ou tire uma foto agora.</Text>
        <View style={styles.fileActions}>
          <Button mode="outlined" icon="camera-outline" onPress={takePhoto}>Tirar foto</Button>
          <Button mode="outlined" icon="image-plus" onPress={pickImage}>Galeria</Button>
        </View>
      </View>
    </View>
  );
}
