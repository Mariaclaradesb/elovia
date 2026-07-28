import { View } from 'react-native';
import { Text, TextInput as PaperTextInput } from 'react-native-paper';

import { colors } from '../theme';
import { styles } from '../theme/styles';

function FormTextInput({ label, placeholder, style, contentStyle, multiline, editable = true, ...props }) {
  return (
    <View style={[styles.formField, style]}>
      {!!label && <Text style={styles.formFieldLabel}>{label}</Text>}
      <PaperTextInput
        {...props}
        mode="outlined"
        label={undefined}
        placeholder={placeholder || label}
        multiline={multiline}
        editable={editable}
        outlineColor={colors.inputBorder}
        activeOutlineColor={colors.tealDark}
        cursorColor={colors.tealDark}
        selectionColor={colors.tealSoft}
        placeholderTextColor={colors.placeholder}
        style={[styles.formInput, !editable && styles.formInputDisabled]}
        contentStyle={[styles.formInputContent, multiline && styles.formInputMultiline, contentStyle]}
        outlineStyle={styles.formInputOutline}
      />
    </View>
  );
}

FormTextInput.Icon = PaperTextInput.Icon;

export default FormTextInput;
