import { navigationText } from '../content/navigationText';
import AlunoProfileScreen from '../screens/admin/AlunoProfileScreen';
import AnamneseViewScreen from '../screens/anamnese/AnamneseViewScreen';
import BibliotecaAlunoScreen from '../screens/biblioteca/BibliotecaAlunoScreen';
import DocumentoDetailsScreen from '../screens/biblioteca/DocumentoDetailsScreen';
import DocumentoFormScreen from '../screens/biblioteca/DocumentoFormScreen';
import DocumentoViewerScreen from '../screens/biblioteca/DocumentoViewerScreen';
import AboutScreen from '../screens/common/AboutScreen';
import PerfilUsuarioScreen from '../screens/common/PerfilUsuarioScreen';
import IniciarSessaoScreen from '../screens/mediador/IniciarSessaoScreen';
import MediadorAlunosScreen from '../screens/mediador/MediadorAlunosScreen';
import MediadorHomeScreen from '../screens/mediador/MediadorHomeScreen';
import SessaoAcompanhamentoScreen from '../screens/mediador/SessaoAcompanhamentoScreen';
import SessoesScreen from '../screens/mediador/SessoesScreen';

export default function MediatorRoutes({ Stack }) {
  const titles = navigationText.screens;
  return <>
    <Stack.Screen name="MediadorHome" component={MediadorHomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="MediadorAlunos" component={MediadorAlunosScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Sessoes" component={SessoesScreen} options={{ headerShown: false }} />
    <Stack.Screen name="IniciarSessao" component={IniciarSessaoScreen} options={{ title: titles.startSession }} />
    <Stack.Screen name="SessaoAcompanhamento" component={SessaoAcompanhamentoScreen} options={{ title: titles.activeSession }} />
    <Stack.Screen name="AlunoProfile" component={AlunoProfileScreen} options={{ title: titles.studentProfile }} />
    <Stack.Screen name="AnamneseView" component={AnamneseViewScreen} options={{ title: titles.anamnese }} />
    <Stack.Screen name="BibliotecaAluno" component={BibliotecaAlunoScreen} options={{ title: titles.library }} />
    <Stack.Screen name="DocumentoForm" component={DocumentoFormScreen} options={({ route }) => ({ title: route.params?.documento ? titles.documentEdit : titles.documentNew })} />
    <Stack.Screen name="DocumentoDetails" component={DocumentoDetailsScreen} options={{ title: titles.document }} />
    <Stack.Screen name="DocumentoViewer" component={DocumentoViewerScreen} options={{ title: titles.viewer }} />
    <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PerfilUsuario" component={PerfilUsuarioScreen} options={{ headerShown: false }} />
  </>;
}
