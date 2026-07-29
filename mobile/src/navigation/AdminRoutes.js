import { navigationText } from '../content/navigationText';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import AlunoFormScreen from '../screens/admin/AlunoFormScreen';
import AlunoProfileScreen from '../screens/admin/AlunoProfileScreen';
import AlunosScreen from '../screens/admin/AlunosScreen';
import MediadorFormScreen from '../screens/admin/MediadorFormScreen';
import MediadoresScreen from '../screens/admin/MediadoresScreen';
import AnamneseViewScreen from '../screens/anamnese/AnamneseViewScreen';
import AnamneseWizardScreen from '../screens/anamnese/AnamneseWizardScreen';
import BibliotecaAlunoScreen from '../screens/biblioteca/BibliotecaAlunoScreen';
import DocumentoDetailsScreen from '../screens/biblioteca/DocumentoDetailsScreen';
import DocumentoFormScreen from '../screens/biblioteca/DocumentoFormScreen';
import DocumentoViewerScreen from '../screens/biblioteca/DocumentoViewerScreen';
import AboutScreen from '../screens/common/AboutScreen';
import PerfilUsuarioScreen from '../screens/common/PerfilUsuarioScreen';

export default function AdminRoutes({ Stack }) {
  const titles = navigationText.screens;
  return <>
    <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Mediadores" component={MediadoresScreen} options={{ headerShown: false }} />
    <Stack.Screen name="MediadorForm" component={MediadorFormScreen} options={({ route }) => ({ title: route.params?.mediador ? titles.mediatorEdit : titles.mediatorNew })} />
    <Stack.Screen name="Alunos" component={AlunosScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AlunoProfile" component={AlunoProfileScreen} options={{ title: titles.studentProfile }} />
    <Stack.Screen name="AnamneseView" component={AnamneseViewScreen} options={{ title: titles.anamnese }} />
    <Stack.Screen name="AnamneseWizard" component={AnamneseWizardScreen} options={{ title: titles.anamneseForm }} />
    <Stack.Screen name="AlunoForm" component={AlunoFormScreen} options={({ route }) => ({ title: route.params?.aluno ? titles.studentEdit : titles.studentNew })} />
    <Stack.Screen name="BibliotecaAluno" component={BibliotecaAlunoScreen} options={{ title: titles.library }} />
    <Stack.Screen name="DocumentoForm" component={DocumentoFormScreen} options={({ route }) => ({ title: route.params?.documento ? titles.documentEdit : titles.documentNew })} />
    <Stack.Screen name="DocumentoDetails" component={DocumentoDetailsScreen} options={{ title: titles.document }} />
    <Stack.Screen name="DocumentoViewer" component={DocumentoViewerScreen} options={{ title: titles.viewer }} />
    <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PerfilUsuario" component={PerfilUsuarioScreen} options={{ headerShown: false }} />
  </>;
}
