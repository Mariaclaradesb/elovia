import { MD3LightTheme } from 'react-native-paper';

import { colors } from './colors';

export const appTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.tealDark,
    secondary: colors.purple,
    tertiary: colors.yellow,
    background: colors.bg,
    surface: colors.white,
    outline: colors.line,
  },
  roundness: 8,
};

export { colors };
