import { View } from 'react-native';
import { Chip } from 'react-native-paper';

import { styles } from '../theme/styles';

export default function ChoiceChips({ options, value = [], onChange, multiple = true }) {
  const selectedValues = multiple ? value || [] : value == null ? [] : [value];

  function toggle(option) {
    if (!multiple) {
      onChange(option);
      return;
    }
    onChange(selectedValues.includes(option)
      ? selectedValues.filter((item) => item !== option)
      : [...selectedValues, option]);
  }

  return (
    <View style={styles.chipWrap}>
      {options.map((option) => (
        <Chip
          key={String(option)}
          selected={selectedValues.includes(option)}
          icon={selectedValues.includes(option) ? 'check' : undefined}
          onPress={() => toggle(option)}
        >
          {option}
        </Chip>
      ))}
    </View>
  );
}
