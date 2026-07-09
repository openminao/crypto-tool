import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import {
  decryptAES,
  decryptDES,
  decryptRC4,
  decryptTripleDES,
  encryptAES,
  encryptDES,
  encryptRC4,
  encryptTripleDES,
} from "../utils/cryptoHelpers";
import { getLastAlgorithm, saveLastAlgorithm } from "../utils/storageHelpers";
import { fontMono, theme } from "../utils/theme";

interface EncryptToolProps {
  isDesktop: boolean;
}

type Mode = "encrypt" | "decrypt";

const ENCRYPT_ALGORITHMS = [
  {
    id: "aes", name: "AES",
    fullName: "Advanced Encryption Standard",
    desc: "高级加密标准，当前最安全的对称加密标准（推荐）",
    strength: "★★★★★"
  },
  {
    id: "des", name: "DES",
    fullName: "Data Encryption Standard",
    desc: "数据加密标准，对称加密鼻祖，安全性较低，不建议用于敏感数据",
    strength: "★★☆☆☆"
  },
  {
    id: "tripledes", name: "3DES",
    fullName: "Triple DES",
    desc: "三重数据加密算法，DES 的加强版，速度稍慢但依然安全",
    strength: "★★★☆☆"
  },
  {
    id: "rc4", name: "RC4",
    fullName: "Rivest Cipher 4",
    desc: "流式加密算法，速度极快，但已被发现有安全漏洞，慎用",
    strength: "★★☆☆☆"
  },
];

export default function EncryptTool({ isDesktop }: EncryptToolProps) {
  const [mode, setMode] = useState<Mode>("encrypt");
  const [selectedAlgo, setSelectedAlgo] = useState(() => getLastAlgorithm("encrypt", "aes"));
  const [inputText, setInputText] = useState("");
  const [secretKey, setSecretKey] = useState("");

  const outputResult = (() => {
    if (!inputText) return "";
    if (!secretKey) return "[ ERROR ] KEY_REQUIRED — 请输入密钥";
    if (mode === "encrypt") {
      switch (selectedAlgo) {
        case "aes": return encryptAES(inputText, secretKey);
        case "des": return encryptDES(inputText, secretKey);
        case "tripledes": return encryptTripleDES(inputText, secretKey);
        case "rc4": return encryptRC4(inputText, secretKey);
        default: return "";
      }
    } else {
      switch (selectedAlgo) {
        case "aes": return decryptAES(inputText, secretKey);
        case "des": return decryptDES(inputText, secretKey);
        case "tripledes": return decryptTripleDES(inputText, secretKey);
        case "rc4": return decryptRC4(inputText, secretKey);
        default: return "";
      }
    }
  })();

  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleSelectAlgo = (algoId: string) => {
    setSelectedAlgo(algoId);
    saveLastAlgorithm("encrypt", algoId);
  };

  const activeAlgoObj = ENCRYPT_ALGORITHMS.find((a) => a.id === selectedAlgo) || ENCRYPT_ALGORITHMS[0];

  const copyText = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      }).catch(() => {});
    }
  };

  return (
    <View style={styles.container}>

      {/* Mode selector */}
      <View style={styles.modeTabs}>
        <TouchableOpacity
          style={[styles.modeTab, mode === "encrypt" && styles.modeTabActiveEncrypt]}
          onPress={() => setMode("encrypt")}
          activeOpacity={0.7}
        >
          <Text style={[styles.modeTabText, mode === "encrypt" && styles.modeTabTextActive]}>
            加密 [ENCRYPT]
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeTab, mode === "decrypt" && styles.modeTabActiveDecrypt]}
          onPress={() => setMode("decrypt")}
          activeOpacity={0.7}
        >
          <Text style={[styles.modeTabText, mode === "decrypt" && styles.modeTabTextActive]}>
            解密 [DECRYPT]
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.workspace]}>
        {/* Input panel */}
        <View style={[styles.panel]}>
          <Text style={styles.panelTitle}>▶ 输入配置</Text>

          {/* Input text */}
          <View style={styles.fieldGroup}>
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldLabel}>
                {mode === "encrypt" ? "待加密明文 (Plain Text)" : "待解密密文 (Base64 Cipher)"}
              </Text>
              <Text style={styles.fieldMeta}>{inputText.length} 字符</Text>
            </View>
            <TextInput
              style={styles.textArea}
              value={inputText}
              onChangeText={setInputText}
              placeholder={mode === "encrypt"
                ? "_ 输入要加密的文本..."
                : "_ 粘贴 Base64 密文进行解密..."
              }
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={5}
            />
          </View>

          {/* Secret key */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>对称密钥 SECRET_KEY / PASSWORD:</Text>
            <TextInput
              style={styles.keyInput}
              value={secretKey}
              onChangeText={setSecretKey}
              placeholder="_ 输入加密或解密的共享密钥/密码..."
              placeholderTextColor={theme.textMuted}
              secureTextEntry
            />
          </View>

          {/* Algorithm list */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>对称加密算法:</Text>
            <View style={styles.algoList} >
              {ENCRYPT_ALGORITHMS.map((algo) => {
                const isActive = selectedAlgo === algo.id;
                return (
                  <TouchableOpacity
                    key={algo.id}
                    style={[styles.algoItem, isActive && styles.algoItemActive]}
                    onPress={() => handleSelectAlgo(algo.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.algoRow}>
                      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={[styles.algoMark, isActive && styles.algoMarkActive]}>
                            {isActive ? "►" : ""}
                          </Text>
                          <Text style={[styles.algoName, isActive && styles.algoNameActive]}>
                            {algo.name}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>{`// ABOUT: ${activeAlgoObj.fullName} ${activeAlgoObj.strength}`}</Text>
              <Text style={styles.algoFull}>{activeAlgoObj.desc}</Text>
              
              <Text style={styles.infoNote}>
                ■ 对称加密 (Symmetric Encryption) 指加密和解密使用同一个密钥的算法。速度极快，常用于海量数据的加密保护。
              </Text>
            </View>
          </View>
        </View>

        {/* Output panel */}
        <View style={[styles.panel]}>
          <Text style={styles.panelTitle}>
            ▶ {mode === "encrypt" ? "加密结果" : "解密结果"}
          </Text>
          <View style={styles.outputCard}>
            <View style={styles.outputHeader}>
              <Text style={styles.outputTitle}>{`${activeAlgoObj.name} ${mode === "encrypt" ? "密文" : "明文"}`}</Text>
              <TouchableOpacity
                style={[styles.copyBtn, copyFeedback && styles.copyBtnDone]}
                onPress={() => copyText(outputResult)}
                activeOpacity={0.7}
              >
                <Text style={styles.copyBtnText}>{copyFeedback ? "已复制 [COPIED]" : "复制 [COPY]"}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.outputBlock}>
              {outputResult.length === 0 ? (
                <Text style={styles.emptyText}>_ 等待输入...</Text>
              ) : (
                <Text style={styles.codeText} selectable>{outputResult}</Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 14,
  },
  pageHeader: {
    borderLeftWidth: 3,
    borderLeftColor: theme.border,
    paddingLeft: 10,
    gap: 2,
  },
  pageTitle: {
    color: theme.textPrimary,
    fontFamily: fontMono,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1,
  },
  pageDesc: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 10,
    letterSpacing: 2,
  },
  modeTabs: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: theme.borderMuted,
    alignSelf: "flex-start",
  },
  modeTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: theme.borderMuted,
  },
  modeTabActiveEncrypt: {
    backgroundColor: theme.bgHighlight,
    borderBottomWidth: 2,
    borderBottomColor: theme.textPrimary,
  },
  modeTabActiveDecrypt: {
    backgroundColor: theme.bgHighlight,
    borderBottomWidth: 2,
    borderBottomColor: theme.accentBlue,
  },
  modeTabText: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 12,
    fontWeight: "700",
  },
  modeTabTextActive: {
    color: theme.textPrimary,
  },
  workspace: {
    gap: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  workspaceDesktop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  panel: {
    backgroundColor: theme.bgPanel,
    borderWidth: 1,
    borderColor: theme.borderMuted,
    padding: 14,
    gap: 14,
    flex: 1,
    minWidth: 480,
  },
  panelLeft: {
    flex: 5,
  },
  panelRight: {
    flex: 4,
  },
  panelTitle: {
    color: theme.textSecondary,
    fontFamily: fontMono,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderMuted,
    paddingBottom: 8,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  fieldLabel: {
    color: theme.textSecondary,
    fontFamily: fontMono,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  fieldMeta: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 10,
  },
  textArea: {
    backgroundColor: theme.bgInset,
    borderWidth: 1,
    borderColor: theme.borderMuted,
    color: theme.textPrimary,
    fontFamily: fontMono,
    fontSize: 16,
    padding: 10,
    minHeight: 100,
    textAlignVertical: "top",
    outlineStyle: "none",
  } as any,
  keyInput: {
    backgroundColor: theme.bgInset,
    borderWidth: 1,
    borderColor: theme.border,
    color: theme.textPrimary,
    fontFamily: fontMono,
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    outlineStyle: "none",
  } as any,
  algoList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  algoItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: theme.border,
    flexGrow: 1,
    alignItems: 'center'
  },
  algoItemActive: {
    backgroundColor: theme.bgHighlight,
  },
  algoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  algoMark: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 12,
  },
  algoMarkActive: {
    color: theme.textPrimary,
  },
  algoName: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 13,
    fontWeight: "700",
    minWidth: 40,
  },
  algoNameActive: {
    color: theme.textPrimary,
  },
  algoFull: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 12,
  },
  algoStrength: {
    color: theme.textSecondary,
    fontFamily: fontMono,
    fontSize: 10,
    letterSpacing: 1
  },
  infoCard: {
    borderWidth: 1,
    borderColor: theme.borderMuted,
    backgroundColor: theme.bgInset,
    padding: 12,
    gap: 6,
  },
  infoTitle: {
    color: theme.textSecondary,
    fontFamily: fontMono,
    fontSize: 12,
    fontWeight: "700",
  },
  infoText: {
    color: theme.textPrimary,
    fontFamily: fontMono,
    fontSize: 12,
  },
  infoNote: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 11,
    marginTop: 4,
  },
  outputCard: {
    gap: 12,
  },
  outputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  outputTitle: {
    color: theme.textSecondary,
    fontFamily: fontMono,
    fontSize: 12,
    fontWeight: "700",
  },
  copyBtn: {
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  copyBtnDone: {
    backgroundColor: theme.bgHighlight,
  },
  copyBtnText: {
    color: theme.textSecondary,
    fontFamily: fontMono,
    fontSize: 11,
    fontWeight: "700",
  },
  outputBlock: {
    backgroundColor: theme.bgInset,
    borderWidth: 1,
    borderColor: theme.borderMuted,
    padding: 12,
    minHeight: 80,
  } as any,
  codeText: {
    color: theme.textPrimary,
    fontFamily: fontMono,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyText: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 12,
    fontStyle: "italic",
  },
});
