import FirstAccessScreen from '../screens/auth/FirstAccessScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

export function PublicRoutes({ Stack }) {
  return <>
    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
  </>;
}

export function FirstAccessRoute({ Stack }) {
  return <Stack.Screen name="PrimeiroAcesso" component={FirstAccessScreen} options={{ headerShown: false }} />;
}
