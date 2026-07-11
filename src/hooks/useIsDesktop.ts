import { useWindowDimensions } from "react-native";

/**
 * Returns true when the viewport width is at or above the desktop breakpoint.
 * Use this hook in any component that needs responsive layout logic.
 */
export function useIsDesktop(): boolean {
  const { width } = useWindowDimensions();
  return width >= 768;
}
