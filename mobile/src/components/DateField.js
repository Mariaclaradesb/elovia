import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { TextInput } from 'react-native-paper';

import { dateToIso, displayToIsoDate, formatDisplayDate, isoToDate, isoToDisplayDate } from '../utils/date';

export default function DateField({ label, value, onChange }) {
  const [showPicker, setShowPicker] = useState(false);
  const [displayValue, setDisplayValue] = useState(isoToDisplayDate(value));

  useEffect(() => {
    setDisplayValue(isoToDisplayDate(value));
  }, [value]);

  function handleManualChange(text) {
    const formatted = formatDisplayDate(text);
    setDisplayValue(formatted);

    if (/^\d{2}-\d{2}-\d{4}$/.test(formatted)) {
      onChange(displayToIsoDate(formatted));
    }
  }

  function handlePickerChange(event, selectedDate) {
    if (Platform.OS !== 'ios') {
      setShowPicker(false);
    }

    if (selectedDate) {
      const isoDate = dateToIso(selectedDate);
      setDisplayValue(isoToDisplayDate(isoDate));
      onChange(isoDate);
    }
  }

  return (
    <>
      <TextInput
        label={label}
        mode="outlined"
        value={displayValue}
        onChangeText={handleManualChange}
        placeholder="DD-MM-AAAA"
        keyboardType="number-pad"
        right={<TextInput.Icon icon="calendar-month-outline" onPress={() => setShowPicker(true)} />}
      />
      {showPicker && (
        <DateTimePicker
          value={isoToDate(value)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          onChange={handlePickerChange}
        />
      )}
    </>
  );
}
