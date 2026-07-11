import { Stack, ThemeProvider } from "expo-router";
import '@/global.css'
import { TransparentTheme } from "@/utils/theme";
export default function RootLayout() {

  return (
    <ThemeProvider value={TransparentTheme}>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
