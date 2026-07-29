import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ModernHeader from '../components/ModernHeader';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../screens/auth/LoadingScreen';
import { colors } from '../theme';
import AdminRoutes from './AdminRoutes';
import { FirstAccessRoute, PublicRoutes } from './AuthRoutes';
import MediatorRoutes from './MediatorRoutes';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { token, user, booting } = useAuth();
  if (booting) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
        header: (props) => <ModernHeader {...props} />,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
      }}>
        {!token ? PublicRoutes({ Stack })
          : user?.primeiroAcesso ? FirstAccessRoute({ Stack })
            : user?.role === 'ADMIN' ? AdminRoutes({ Stack })
              : MediatorRoutes({ Stack })}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
