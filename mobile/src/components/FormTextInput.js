import { View } from 'react-native';
import { Text, TextInput as PaperTextInput } from 'react-native-paper';

import { colors } from '../theme';
import { styles } from '../theme/styles';

function FormTextInput({
  label,
  placeholder,
  style,
  contentStyle,
  multiline,
  editable = true,
  required = false,
  error = false,
  errorMessage = '',
  onChangeText,
  ...props
}) {
  const hasError = !!error || !!errorMessage;

  return (
    <View style={[styles.formField, style]}>
      {!!label && (
        <Text style={styles.formFieldLabel}>
          {label}
          {required && <Text style={styles.requiredAsterisk}> *</Text>}
        </Text>
      )}
      <PaperTextInput
        {...props}
        mode="outlined"
        label={undefined}
        placeholder={placeholder || label}
        multiline={multiline}
        editable={editable}
        error={hasError}
        onChangeText={onChangeText}
        outlineColor={hasError ? colors.danger : colors.inputBorder}
        activeOutlineColor={hasError ? colors.danger : colors.tealDark}
        cursorColor={colors.tealDark}
        selectionColor={colors.tealSoft}
        placeholderTextColor={colors.placeholder}
        style={[styles.formInput, !editable && styles.formInputDisabled]}
        contentStyle={[styles.formInputContent, multiline && styles.formInputMultiline, contentStyle]}
        outlineStyle={[styles.formInputOutline, hasError && styles.formInputOutlineError]}
      />
      {!!errorMessage && <Text style={styles.formFieldError}>{errorMessage}</Text>}
    </View>
  );
}

FormTextInput.Icon = PaperTextInput.Icon;

export default FormTextInput;
