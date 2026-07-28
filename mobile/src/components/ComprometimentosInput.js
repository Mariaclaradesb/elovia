import { View } from 'react-native';
import { Button, IconButton, Switch, Text } from 'react-native-paper';

import { colors } from '../theme';
import { styles } from '../theme/styles';
import TextInput from './FormTextInput';

export default function ComprometimentosInput({ items, onChange, emInvestigacao, onInvestigacaoChange }) {
  function setItem(index, field, value) {
    onChange(items.map((item, currentIndex) => (
      currentIndex === index ? { ...item, [field]: value } : item
    )));
  }

  function addItem() {
    onChange([...items, { nome: '', cid: '' }]);
  }

  function removeItem(index) {
    const remaining = items.filter((_, currentIndex) => currentIndex !== index);
    onChange(remaining.length ? remaining : [{ nome: '', cid: '' }]);
  }

  return (
    <View style={styles.formGap}>
      {items.map((item, index) => (
        <View key={`comprometimento-${index}`} style={styles.clinicalItemBox}>
          <View style={styles.documentHeader}>
            <Text style={styles.sectionTitle}>Comprometimento {index + 1}</Text>
            {(items.length > 1 || item.nome || item.cid) && (
              <IconButton
                icon="trash-can-outline"
                iconColor={colors.danger}
                onPress={() => removeItem(index)}
              />
            )}
          </View>
          <TextInput
            label="Comprometimento"
            value={item.nome}
            onChangeText={(value) => setItem(index, 'nome', value)}
            placeholder="Ex.: Transtorno do espectro autista"
          />
          <TextInput
            label="CID (opcional)"
            value={item.cid}
            onChangeText={(value) => setItem(index, 'cid', value.toUpperCase())}
            autoCapitalize="characters"
            placeholder="Ex.: F84.0"
          />
        </View>
      ))}

      <Button mode="outlined" icon="plus-circle-outline" onPress={addItem}>
        Adicionar outro comprometimento
      </Button>

      <View style={styles.investigationOption}>
        <View style={styles.flex}>
          <Text style={styles.sectionTitle}>Em investigação</Text>
          <Text style={styles.muted}>Marque quando ainda não há um comprometimento identificado.</Text>
        </View>
        <Switch
          value={emInvestigacao}
          onValueChange={onInvestigacaoChange}
          color={colors.tealDark}
        />
      </View>
    </View>
  );
}
