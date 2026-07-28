import { View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';

import TextInput from './FormTextInput';
import { colors } from '../theme';
import { styles } from '../theme/styles';

export default function RepeatableAnamneseList({
  title,
  addLabel,
  items,
  emptyItem,
  fields,
  onChange,
}) {
  function setItem(index, field, value) {
    onChange(items.map((item, currentIndex) => (
      currentIndex === index ? { ...item, [field]: value } : item
    )));
  }

  return (
    <View style={styles.formGap}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <View key={`${title}-${index}`} style={styles.clinicalItemBox}>
          <View style={styles.documentHeader}>
            <Text style={styles.sectionTitle}>{title.replace(/s$/, '')} {index + 1}</Text>
            <IconButton
              icon="trash-can-outline"
              iconColor={colors.danger}
              onPress={() => onChange(items.filter((_, currentIndex) => currentIndex !== index))}
            />
          </View>
          {fields.map((field) => (
            <TextInput
              key={field.key}
              label={field.label}
              value={item[field.key] || ''}
              multiline={field.multiline}
              numberOfLines={field.multiline ? 3 : 1}
              onChangeText={(value) => setItem(index, field.key, value)}
            />
          ))}
        </View>
      ))}
      <Button mode="outlined" icon="plus" onPress={() => onChange([...items, { ...emptyItem }])}>
        {addLabel}
      </Button>
    </View>
  );
}
