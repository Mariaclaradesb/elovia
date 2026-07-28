import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import ModernHeader from './src/components/ModernHeader';
import AdminHomeScreen from './src/screens/admin/AdminHomeScreen';
import AlunoFormScreen from './src/screens/admin/AlunoFormScreen';
import AlunoProfileScreen from './src/screens/admin/AlunoProfileScreen';
import AlunosScreen from './src/screens/admin/AlunosScreen';
import AnamneseViewScreen from './src/screens/anamnese/AnamneseViewScreen';
import AnamneseWizardScreen from './src/screens/anamnese/AnamneseWizardScreen';
import MediadorFormScreen from './src/screens/admin/MediadorFormScreen';
import MediadoresScreen from './src/screens/admin/MediadoresScreen';
import FirstAccessScreen from './src/screens/auth/FirstAccessScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import LoadingScreen from './src/screens/auth/LoadingScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import BibliotecaAlunoScreen from './src/screens/biblioteca/BibliotecaAlunoScreen';
import DocumentoDetailsScreen from './src/screens/biblioteca/DocumentoDetailsScreen';
import DocumentoFormScreen from './src/screens/biblioteca/DocumentoFormScreen';
import DocumentoViewerScreen from './src/screens/biblioteca/DocumentoViewerScreen';
import AboutScreen from './src/screens/common/AboutScreen';
import PerfilUsuarioScreen from './src/screens/common/PerfilUsuarioScreen';
import IniciarSessaoScreen from './src/screens/mediador/IniciarSessaoScreen';
import MediadorAlunosScreen from './src/screens/mediador/MediadorAlunosScreen';
import MediadorHomeScreen from './src/screens/mediador/MediadorHomeScreen';
import SessaoAcompanhamentoScreen from './src/screens/mediador/SessaoAcompanhamentoScreen';
import SessoesScreen from './src/screens/mediador/SessoesScreen';
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
          header: (props) => <ModernHeader {...props} />,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        {!token ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        ) : user?.primeiroAcesso ? (
          <Stack.Screen name="PrimeiroAcesso" component={FirstAccessScreen} options={{ headerShown: false }} />
        ) : user?.role === 'ADMIN' ? (
          <>
            <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Mediadores" component={MediadoresScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="MediadorForm"
              component={MediadorFormScreen}
              options={({ route }) => ({ title: route.params?.mediador ? 'Editar mediador' : 'Novo mediador' })}
            />
            <Stack.Screen name="Alunos" component={AlunosScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AlunoProfile" component={AlunoProfileScreen} options={{ title: 'Perfil do aluno' }} />
            <Stack.Screen name="AnamneseView" component={AnamneseViewScreen} options={{ title: 'Anamnese' }} />
            <Stack.Screen name="AnamneseWizard" component={AnamneseWizardScreen} options={{ title: 'Preencher anamnese' }} />
            <Stack.Screen
              name="AlunoForm"
              component={AlunoFormScreen}
              options={({ route }) => ({ title: route.params?.aluno ? 'Editar aluno' : 'Novo aluno' })}
            />
            <Stack.Screen name="BibliotecaAluno" component={BibliotecaAlunoScreen} options={{ title: 'Biblioteca' }} />
            <Stack.Screen
              name="DocumentoForm"
              component={DocumentoFormScreen}
              options={({ route }) => ({ title: route.params?.documento ? 'Editar documento' : 'Novo documento' })}
            />
            <Stack.Screen name="DocumentoDetails" component={DocumentoDetailsScreen} options={{ title: 'Documento' }} />
            <Stack.Screen name="DocumentoViewer" component={DocumentoViewerScreen} options={{ title: 'Visualizador' }} />
            <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PerfilUsuario" component={PerfilUsuarioScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="MediadorHome" component={MediadorHomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MediadorAlunos" component={MediadorAlunosScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Sessoes" component={SessoesScreen} options={{ headerShown: false }} />
            <Stack.Screen name="IniciarSessao" component={IniciarSessaoScreen} options={{ title: 'Iniciar acompanhamento' }} />
            <Stack.Screen name="SessaoAcompanhamento" component={SessaoAcompanhamentoScreen} options={{ title: 'Sessão em andamento' }} />
            <Stack.Screen name="AlunoProfile" component={AlunoProfileScreen} options={{ title: 'Perfil do aluno' }} />
            <Stack.Screen name="AnamneseView" component={AnamneseViewScreen} options={{ title: 'Anamnese' }} />
            <Stack.Screen name="BibliotecaAluno" component={BibliotecaAlunoScreen} options={{ title: 'Biblioteca' }} />
            <Stack.Screen
              name="DocumentoForm"
              component={DocumentoFormScreen}
              options={({ route }) => ({ title: route.params?.documento ? 'Editar documento' : 'Novo documento' })}
            />
            <Stack.Screen name="DocumentoDetails" component={DocumentoDetailsScreen} options={{ title: 'Documento' }} />
            <Stack.Screen name="DocumentoViewer" component={DocumentoViewerScreen} options={{ title: 'Visualizador' }} />
            <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PerfilUsuario" component={PerfilUsuarioScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <PaperProvider theme={appTheme}>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
        <StatusBar style="dark" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
