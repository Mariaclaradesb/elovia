import { useState } from 'react';
import { Menu } from 'react-native-paper';

import TextInput from './FormTextInput';

export default function SelectField({ label, value, options, onChange }) {
  const [visible, setVisible] = useState(false);

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={(
        <TextInput
          label={label}
          mode="outlined"
          value={value}
          editable={false}
          right={<TextInput.Icon icon="chevron-down" onPress={() => setVisible(true)} />}
          onPressIn={() => setVisible(true)}
        />
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
