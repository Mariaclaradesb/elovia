import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import AdminHomeScreen from './src/screens/admin/AdminHomeScreen';
import AlunoFormScreen from './src/screens/admin/AlunoFormScreen';
import AlunosScreen from './src/screens/admin/AlunosScreen';
import MediadorFormScreen from './src/screens/admin/MediadorFormScreen';
import MediadoresScreen from './src/screens/admin/MediadoresScreen';
import FirstAccessScreen from './src/screens/auth/FirstAccessScreen';
import LoadingScreen from './src/screens/auth/LoadingScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import MediadorHomeScreen from './src/screens/mediador/MediadorHomeScreen';
import { appTheme, colors } from './src/theme';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { token, user, booting } = useAuth();

  if (booting) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.white },
          headerTintColor: colors.ink,
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        {!token ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        ) : user?.primeiroAcesso ? (
          <Stack.Screen name="PrimeiroAcesso" component={FirstAccessScreen} options={{ headerShown: false }} />
        ) : user?.role === 'ADMIN' ? (
          <>
            <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: 'Elovia' }} />
            <Stack.Screen name="Mediadores" component={MediadoresScreen} options={{ title: 'Mediadores' }} />
            <Stack.Screen
              name="MediadorForm"
              component={MediadorFormScreen}
              options={({ route }) => ({ title: route.params?.mediador ? 'Editar mediador' : 'Novo mediador' })}
            />
            <Stack.Screen name="Alunos" component={AlunosScreen} options={{ title: 'Alunos' }} />
            <Stack.Screen
              name="AlunoForm"
              component={AlunoFormScreen}
              options={({ route }) => ({ title: route.params?.aluno ? 'Editar aluno' : 'Novo aluno' })}
            />
          </>
        ) : (
          <Stack.Screen name="MediadorHome" component={MediadorHomeScreen} options={{ title: 'Meus alunos' }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <PaperProvider theme={appTheme}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
      <StatusBar style="dark" />
    </PaperProvider>
  );
}
