import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface ToolBoxProps {
  children: ReactNode;
  style?: ViewStyle;
}

export default function ToolBox({ children, style }: ToolBoxProps) {
  return (
    <View style={[styles.workspaceRow, style]} id='workspace'>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  workspaceRow: {
    flexDirection: "row",
    gap: 16
  },
});
