import { configureFonts, MD3LightTheme } from 'react-native-paper';

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
    outlineVariant: colors.inputBorder,
    surfaceVariant: colors.lavenderSoft,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level1: '#FFFFFF',
      level2: '#FBFAFF',
    },
  },
  fonts: configureFonts({
    config: {
      ...MD3LightTheme.fonts,
      displayLarge: { ...MD3LightTheme.fonts.displayLarge, fontFamily: 'Nunito_800ExtraBold' },
      displayMedium: { ...MD3LightTheme.fonts.displayMedium, fontFamily: 'Nunito_800ExtraBold' },
      displaySmall: { ...MD3LightTheme.fonts.displaySmall, fontFamily: 'Nunito_800ExtraBold' },
      headlineLarge: { ...MD3LightTheme.fonts.headlineLarge, fontFamily: 'Nunito_800ExtraBold' },
      headlineMedium: { ...MD3LightTheme.fonts.headlineMedium, fontFamily: 'Nunito_800ExtraBold' },
      headlineSmall: { ...MD3LightTheme.fonts.headlineSmall, fontFamily: 'Nunito_800ExtraBold' },
      titleLarge: { ...MD3LightTheme.fonts.titleLarge, fontFamily: 'Nunito_700Bold' },
      titleMedium: { ...MD3LightTheme.fonts.titleMedium, fontFamily: 'Nunito_700Bold' },
      titleSmall: { ...MD3LightTheme.fonts.titleSmall, fontFamily: 'Nunito_700Bold' },
      labelLarge: { ...MD3LightTheme.fonts.labelLarge, fontFamily: 'Nunito_700Bold' },
      labelMedium: { ...MD3LightTheme.fonts.labelMedium, fontFamily: 'Nunito_700Bold' },
      labelSmall: { ...MD3LightTheme.fonts.labelSmall, fontFamily: 'Nunito_700Bold' },
      bodyLarge: { ...MD3LightTheme.fonts.bodyLarge, fontFamily: 'Nunito_400Regular' },
      bodyMedium: { ...MD3LightTheme.fonts.bodyMedium, fontFamily: 'Nunito_400Regular' },
      bodySmall: { ...MD3LightTheme.fonts.bodySmall, fontFamily: 'Nunito_400Regular' },
    },
  }),
  roundness: 18,
};

export { colors };
