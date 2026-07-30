import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Menu } from 'react-native-paper';

import TextInput from './FormTextInput';
import { styles } from '../theme/styles';

export default function SelectField({ label, value, options, onChange, required = false, error, errorMessage }) {
  const [visible, setVisible] = useState(false);

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchorPosition="bottom"
      contentStyle={styles.selectMenu}
      anchor={(
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${value || 'selecione uma opção'}`}
          onPress={() => setVisible(true)}
          style={styles.selectAnchor}
        >
          <View pointerEvents="none">
            <TextInput
              label={label}
              value={value}
              editable={false}
              required={required}
              error={error}
              errorMessage={errorMessage}
              right={<TextInput.Icon icon="chevron-down" />}
            />
          </View>
        </Pressable>
      )}
    >
      {options.map((option) => (
        <Menu.Item
          key={option.value}
          title={option.label}
          onPress={() => {
            onChange(option.value);
            setVisible(false);
          }}
        />
      ))}
    </Menu>
  );
}
