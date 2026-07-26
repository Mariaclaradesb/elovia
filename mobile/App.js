import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

const API_BASE_URL = 'https://site--elovia-api--5pcsmqsv6df5.code.run';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('Toque em um botao para testar a API.');

  async function callApi(path) {
    setLoading(true);
    setResult('Chamando backend...');

    try {
      const response = await fetch(`${API_BASE_URL}${path}`);
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body?.message || `Erro HTTP ${response.status}`);
      }

      setResult(JSON.stringify(body, null, 2));
    } catch (error) {
      setResult(`Falha ao chamar a API: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Elovia</Text>
        <Text style={styles.subtitle}>Teste do front Expo Go com backend Northflank</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>API</Text>
        <Text style={styles.url}>{API_BASE_URL}</Text>
      </View>

      <Pressable style={styles.button} onPress={() => callApi('/actuator/health')} disabled={loading}>
        <Text style={styles.buttonText}>Testar health</Text>
      </Pressable>

      <Pressable style={styles.buttonSecondary} onPress={() => callApi('/api/test/ping')} disabled={loading}>
        <Text style={styles.buttonSecondaryText}>Testar ping</Text>
      </Pressable>

      <View style={styles.resultCard}>
        <Text style={styles.label}>Resultado</Text>
        {loading ? <ActivityIndicator color="#3559E0" /> : <Text style={styles.result}>{result}</Text>}
      </View>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
    padding: 20,
    gap: 16,
  },
  header: {
    marginTop: 24,
    gap: 6,
  },
  title: {
    color: '#2038A0',
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: '#667085',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  label: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  url: {
    color: '#182230',
    fontSize: 14,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#3559E0',
    borderRadius: 8,
    minHeight: 52,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonSecondary: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#3559E0',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 52,
    justifyContent: 'center',
  },
  buttonSecondaryText: {
    color: '#3559E0',
    fontSize: 16,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    flex: 1,
    gap: 12,
    padding: 16,
  },
  result: {
    color: '#182230',
    fontFamily: 'monospace',
    fontSize: 14,
  },
});
