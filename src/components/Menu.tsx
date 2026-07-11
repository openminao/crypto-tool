import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { fontMono, theme } from "../utils/theme";

export type Category = "hash" | "encrypt" | "encode" | "qr";

interface SidebarProps {
  activeCategory: Category;
  onSelectCategory: (category: Category) => void;
  isDesktop: boolean;
}

const menuItems = [
  {
    id: "hash" as Category,
    label: "哈希",
    subLabel: "MD5 SHA-1 SHA-256 HMAC",
    tag: "[HASH]",
  },
  {
    id: "encrypt" as Category,
    label: "加密",
    subLabel: "AES DES 3DES RC4",
    tag: "[ENCRYPT]",
  },
  {
    id: "encode" as Category,
    label: "编码",
    subLabel: "BASE64 URL-ENCODE",
    tag: "[ENCODE]",
  },
  {
    id: "qr" as Category,
    label: "二维码",
    subLabel: "QR-CODE 生成与解析",
    tag: "[QR-CODE]",
  },
];

export default function Menu({ activeCategory, onSelectCategory, isDesktop }: SidebarProps) {
  return (
    <View style={[styles.sidebar, !isDesktop && styles.sidebarMobile]}>
      <View style={[styles.nav, !isDesktop && styles.navMobile]}>
        {menuItems.map((item) => {
          const isActive = activeCategory === item.id;
          return (
            <Pressable
              key={item.id}
              style={({ hovered }) => [
                styles.navItem,
                isActive && styles.navItemActive,
                hovered && !isActive && styles.navItemHovered,
                !isDesktop && styles.navItemMobile,
              ]}
              onPress={() => onSelectCategory(item.id)}
            >
              <View style={[styles.navItemInner, !isDesktop && styles.navItemInnerMobile]}>
                <Text
                  style={[
                    styles.navItemLabel,
                    isActive ? styles.navItemLabelActive : styles.navItemLabelMuted,
                  ]}
                >
                  {isActive ? `> ${item.label}` : `  ${item.label}`}
                </Text>
                
                {!isDesktop && (
                  <Text
                    style={[
                      styles.navItemTag,
                      isActive ? styles.navItemTagActive : styles.navItemTagMuted,
                    ]}
                  >
                    {item.tag}
                  </Text>
                )}
              </View>
              {isDesktop && <Text style={styles.navItemSub}>{item.subLabel}</Text>}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    alignSelf: "stretch",
  },
  sidebarMobile: {
    width: "100%",
  },
  nav: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  navMobile: {
    width: "100%",
    flexDirection: "column",
    alignItems: "stretch",
    gap: 6,
  },
  navItem: {
    borderWidth: 1,
    borderColor: theme.borderMuted,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: theme.bg,
    cursor: "pointer",
    transition: "all 0.15s ease-in-out",
  } as any,
  navItemMobile: {
    flex: undefined,
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  navItemActive: {
    borderColor: theme.border,
    backgroundColor: theme.bgHighlight,
    boxShadow: `0 0 10px ${theme.glow}, inset 0 0 5px ${theme.glow}`,
  },
  navItemHovered: {
    borderColor: theme.accentBlue,
    backgroundColor: theme.bgHighlight,
    boxShadow: `0 0 8px rgba(10, 255, 157, 0.25)`,
  },
  navItemInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  navItemInnerMobile: {
    justifyContent: "space-between",
    width: "100%",
  },
  navItemLabel: {
    fontFamily: fontMono,
    fontSize: 14,
    fontWeight: "700",
  },
  navItemLabelActive: {
    color: theme.textPrimary,
  },
  navItemLabelMuted: {
    color: theme.textMuted,
  },
  navItemTag: {
    fontFamily: fontMono,
    fontSize: 12,
    fontWeight: "700",
  },
  navItemTagActive: {
    color: theme.textSecondary,
  },
  navItemTagMuted: {
    color: theme.textMuted,
  },
  navItemSub: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 9,
    marginTop: 4,
    letterSpacing: 0.5,
    textAlign: "left",
  },
});
