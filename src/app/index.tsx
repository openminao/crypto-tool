import { Image } from "expo-image";
import HEAD from "expo-router/head";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import EncodeTool from "../components/EncodeTool";
import EncryptTool from "../components/EncryptTool";
import HashTool from "../components/HashTool";
import QrTool from "../components/QrTool";
import Menu, { Category } from "../components/Menu";
import { getLastCategory, saveLastCategory } from "../utils/storageHelpers";
import { DESKTOP_BREAKPOINT, fontMono, theme } from "../utils/theme";

export default function Index() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const [activeCategory, setActiveCategory] = useState<Category>(() => {
    return getLastCategory("hash") as Category;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelectCategory = (category: Category) => {
    setActiveCategory(category);
    saveLastCategory(category);
    setMobileMenuOpen(false);
  };

  const renderTool = () => {
    switch (activeCategory) {
      case "hash":
        return <HashTool isDesktop={isDesktop} />;
      case "encrypt":
        return <EncryptTool isDesktop={isDesktop} />;
      case "encode":
        return <EncodeTool isDesktop={isDesktop} />;
      case "qr":
        return <QrTool isDesktop={isDesktop} />;
      default:
        return <HashTool isDesktop={isDesktop} />;
    }
  };

  return (
    <View style={styles.container}>
      <HEAD>
        <title>Crypto Tool | 本地安全密码学与二维码工具箱</title>
        <meta name="description" content="一个纯本地运行的安全密码学工具箱与二维码编码解码器。支持MD5、SHA、HMAC哈希计算，AES、DES对称加密，Base64与URL编码转换，以及复古绿黑像素风格的二维码生成与本地图片二维码解析，100%保护您的隐私。" />
        <meta name="keywords" content="密码工具,哈希计算,HMAC,AES加密,DES加密,Base64编码,URL编码,二维码生成,二维码解析,本地密码学,Crypto,QR Code" />
        <meta property="og:title" content="Crypto Tool | 本地安全密码学与二维码工具箱" />
        <meta property="og:description" content="一个纯本地运行的安全密码学工具箱与二维码编码解码器。支持MD5、SHA、HMAC哈希计算，AES、DES对称加密，Base64与URL编码转换，以及复古绿黑像素风格的二维码生成与本地图片二维码解析，100%保护您的隐私。" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://crypto.minao.cc" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Crypto Tool | 本地安全密码学与二维码工具箱" />
        <meta name="twitter:description" content="一个纯本地运行的安全密码学工具箱与二维码编码解码器。" />
      </HEAD>

      <ScrollView style={styles.container}
        contentContainerStyle={styles.scrollContent}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar — always visible (Sticky) */}
        <View style={styles.topBarWrapper}>
          <View style={styles.topBar}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image source={require("@/assets/images/icon.png")} style={{ width: 32, height: 32, marginRight: 8 }} />
              <Text style={styles.topBarBrand}>CRYPTO TOOL</Text>
            </View>
            {!isDesktop && (
              <Pressable
                style={({ hovered }) => [
                  styles.menuToggle,
                  mobileMenuOpen && styles.menuToggleActive,
                  hovered && styles.menuToggleHovered,
                ]}
                onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Text style={[
                  styles.menuToggleText,
                  mobileMenuOpen && styles.menuToggleTextActive
                ]}>
                  {mobileMenuOpen ? "✕ CLOSE" : "☰ MENU"}
                </Text>
              </Pressable>
            )}
            {isDesktop && (
              <Menu
                activeCategory={activeCategory}
                onSelectCategory={handleSelectCategory}
                isDesktop={true}
              />
            )}
          </View>
          
          {/* Mobile dropdown menu (now inside the sticky header) */}
          {!isDesktop && mobileMenuOpen && (
            <View style={styles.mobileMenu}>
              <Menu
                activeCategory={activeCategory}
                onSelectCategory={handleSelectCategory}
                isDesktop={false}
              />
            </View>
          )}
        </View>

        <View style={{ flex: 1, maxWidth: 1200, alignSelf: "center", width: "100%" }}>

          <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.textMuted }}>⚠️  本项目开源，纯本地运算，绝不会获取用户数据!</Text>
            <a style={{width: 24, height: 24}}
              href="https://github.com/openminao/crypto-tool"
              target="_blank"
            >
              <Image source={require('@/assets/images/github.svg')}  
                style={{width: '100%', height: '100%'}}
                tintColor={theme.textPrimary}
              />
            </a>
          </View>
          {/* Main layout */}
          <View style={[styles.container, isDesktop && styles.containerDesktop]}>
            {/* Tool workspace */}
            <View style={{flex: 1}}>
              {renderTool()}

              {/* Footer */}
              <View style={{ alignItems: 'center', padding: 16 }}>
                <Text style={{ color: theme.textPrimary, fontSize: 12 }}>© 2026 <a 
                href="https://minao.cc" 
                style={{textDecoration: 'none', color: theme.textPrimary, }}
                target="_blank">minao</a>
                </Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  topBarWrapper: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.bgHighlight,
    alignItems: "center",
  },
  topBar: {
    width: "100%",
    maxWidth: 1200,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  topBarBrand: {
    color: theme.textPrimary,
    fontFamily: fontMono,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 1,
  },
  topBarRight: {
    color: theme.textSecondary,
    fontFamily: fontMono,
    fontSize: 12,
  },
  menuToggle: {
    borderWidth: 1,
    borderColor: theme.borderMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.bg,
    cursor: "pointer",
    transition: "all 0.15s ease-in-out",
  } as any,
  menuToggleActive: {
    borderColor: theme.border,
    backgroundColor: theme.bgHighlight,
    boxShadow: `0 0 8px ${theme.glow}`,
  },
  menuToggleHovered: {
    borderColor: theme.accentBlue,
    boxShadow: `0 0 6px rgba(10, 255, 157, 0.2)`,
  },
  menuToggleText: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 12,
    fontWeight: "700",
  },
  menuToggleTextActive: {
    color: theme.textPrimary,
  },
  mobileMenu: {
    borderBottomWidth: 1,
    borderBottomColor: theme.borderMuted,
    padding: 12,
    backgroundColor: theme.bgPanel,
    width: "100%",
    alignSelf: "stretch",
  },
  containerDesktop: {
    flexDirection: "row",
  },
  scrollContent: {
    flexGrow: 1,
  },
});
