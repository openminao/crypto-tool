import { theme } from "@/utils/theme";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // Sync with CSS custom properties
      document.documentElement.style.backgroundColor = theme.bgHighlight;
      const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
      if (meta) {
        meta.setAttribute('content', theme.bg);
      }
    }
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false, }} />
  );
}
