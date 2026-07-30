import { useState } from 'react';
import { View } from 'react-native';
import { Chip } from 'react-native-paper';

import { styles } from '../theme/styles';
import TextInput from './FormTextInput';

export default function ListInput({ label, items, onChange }) {
  const [text, setText] = useState('');

  function addItem() {
    const clean = text.trim();
    if (!clean) {
      return;
    }

    onChange([...items, clean]);
    setText('');
  }

  function removeItem(index) {
    onChange(items.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <View style={styles.listInputGroup}>
      <TextInput
        label={label}
        mode="outlined"
        value={text}
        onChangeText={setText}
        multiline
        right={<TextInput.Icon icon="plus-circle-outline" onPress={addItem} />}
      />
      {!!items.length && (
        <View style={styles.chipWrap}>
          {items.map((item, index) => (
            <Chip key={`${item}-${index}`} onClose={() => removeItem(index)}>
              {item}
            </Chip>
          ))}
        </View>
      )}
    </View>
  );
}
