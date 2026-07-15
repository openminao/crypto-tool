import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { hmacMd5, hmacSha1, hmacSha256, hmacSha512, md5, sha1, sha256, sha3, sha512 } from "../utils/cryptoHelpers";
import { getLastAlgorithm, saveLastAlgorithm } from "../utils/storageHelpers";
import { fontMono, theme } from "../utils/theme";
import { useIsDesktop } from "../hooks/useIsDesktop";
import SliceControls from "./SliceControls";
import ToolBox from "./ToolBox";

interface HashToolProps {}

const HASH_ALGORITHMS = [
  { id: "md5", name: "MD5", isHmac: false, desc: "128-bit 常用快速哈希算法（不安全，适用于校验）" },
  { id: "sha1", name: "SHA-1", isHmac: false, desc: "160-bit 常用哈希（已不安全，适用于旧系统兼容）" },
  { id: "sha256", name: "SHA-256", isHmac: false, desc: "256-bit 高安全强度哈希（比特币与主流标准使用）" },
  { id: "sha512", name: "SHA-512", isHmac: false, desc: "512-bit 极高安全强度哈希" },
  { id: "sha3", name: "SHA-3", isHmac: false, desc: "最新一代 Keccak 标准哈希，安全设计优于 SHA-2" },
  { id: "hmac-md5", name: "HMAC-MD5", isHmac: true, desc: "带密钥的 MD5 消息认证码" },
  { id: "hmac-sha1", name: "HMAC-SHA-1", isHmac: true, desc: "带密钥的 SHA-1 消息认证码" },
  { id: "hmac-sha256", name: "HMAC-SHA-256", isHmac: true, desc: "带密钥的 SHA-256 消息认证码（金融/安全认证常用）" },
  { id: "hmac-sha512", name: "HMAC-SHA-512", isHmac: true, desc: "带密钥的 SHA-512 消息认证码" },
];

export default function HashTool({ }: HashToolProps) {
  const isDesktop = useIsDesktop();
  const [inputText, setInputText] = useState("");
  const [selectedAlgo, setSelectedAlgo] = useState(() => getLastAlgorithm("hash", "sha256"));
  const [hmacKey, setHmacKey] = useState("");

  const hashResult = (() => {
    if (!inputText) return "";
    switch (selectedAlgo) {
      case "md5": return md5(inputText);
      case "sha1": return sha1(inputText);
      case "sha256": return sha256(inputText);
      case "sha512": return sha512(inputText);
      case "sha3": return sha3(inputText);
      case "hmac-md5": return hmacMd5(inputText, hmacKey);
      case "hmac-sha1": return hmacSha1(inputText, hmacKey);
      case "hmac-sha256": return hmacSha256(inputText, hmacKey);
      case "hmac-sha512": return hmacSha512(inputText, hmacKey);
      default: return "";
    }
  })();

  const handleSelectAlgo = (algoId: string) => {
    setSelectedAlgo(algoId);
    saveLastAlgorithm("hash", algoId);
  };

  const activeAlgoObj = HASH_ALGORITHMS.find((a) => a.id === selectedAlgo) || HASH_ALGORITHMS[2];

  return (
    <ToolBox>
      {/* Left / Top: Input panel */}
      <View style={[styles.panel, isDesktop && styles.panelLeft]}>
        <Text style={styles.panelTitle}>▶ 输入配置</Text>

        {/* Source text area */}
        <View style={styles.fieldGroup}>
          <View style={styles.fieldHeader}>
            <Text style={styles.fieldLabel}>文本输入:</Text>
            <Text style={styles.fieldMeta}>{inputText.length} 字符</Text>
          </View>
          <TextInput
            id='hash-input'
            style={styles.textArea}
            allowFontScaling={false}
            value={inputText}
            onChangeText={setInputText}
            placeholder="_ 输入要计算哈希的文本..."
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={5}
          />
        </View>

        {/* Algorithm picker */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>哈希算法:</Text>
          <View style={styles.algoList}>
            {HASH_ALGORITHMS.map((algo) => {
              const isActive = selectedAlgo === algo.id;
              return (
                <TouchableOpacity
                  key={algo.id}
                  style={[styles.algoItem, isActive && styles.algoItemActive]}
                  onPress={() => handleSelectAlgo(algo.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.algoItemInner}>
                    <Text style={[styles.algoMark, isActive && styles.algoMarkActive]}>
                      {isActive ? "►" : ""}
                    </Text>
                    <Text style={[styles.algoName, isActive && styles.algoNameActive]}>
                      {algo.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>{`// ABOUT: ${activeAlgoObj.name}`}</Text>
            <Text style={styles.infoText}>{activeAlgoObj.desc}</Text>
            <Text style={[styles.infoText, { fontSize: 11 }]}>
              {activeAlgoObj.isHmac
                ? `HMAC (Hash-based Message Authentication Code) — 使用密钥对消息进行哈希签名，可验证消息完整性与来源。`
                : `单向哈希算法 — 它将任意长度的内容映射为固定长度的值。哈希算法不可逆，无法从哈希值反推原文。`}
            </Text>
          </View>
        </View>

        {/* HMAC key */}
        {activeAlgoObj.isHmac && (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>HMAC 秘钥 (SECRET KEY):</Text>
            <TextInput
              id='hash-secret-key'
              style={styles.keyInput}
              value={hmacKey}
              onChangeText={setHmacKey}
              placeholder="_ 输入 HMAC 共享密钥..."
              placeholderTextColor={theme.textMuted}
            />
          </View>
        )}
      </View>

      {/* Right / Bottom: Output panel */}
      <View style={[styles.panel, isDesktop && styles.panelRight]}>
        <Text style={styles.panelTitle}>▶ 哈希结果</Text>
        <SliceControls
          key={selectedAlgo}
          rawOutput={hashResult}
          algoKey={selectedAlgo}
          label={`${activeAlgoObj.name} 计算值`}
          defaultEnabled={true}
        />
      </View>
    </ToolBox>
  );
}

const styles = StyleSheet.create({

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
  panel: {
    backgroundColor: theme.bgPanel,
    borderWidth: 1,
    borderColor: theme.borderMuted,
    padding: 14,
    paddingBottom: 20,
    gap: 14,
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
    paddingBottom: 8
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
    fontSize: 13,
    padding: 10,
    minHeight: 100,
    textAlignVertical: "top",
    outlineStyle: "none",
  } as any,
  algoList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingBottom: 10
  },
  algoItem: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  algoItemActive: {
    backgroundColor: theme.bgHighlight,
  },
  algoItemInner: {
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
    flex: 1,
  },
  algoNameActive: {
    color: theme.textPrimary,
  },
  algoBits: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 10,
  },
  algoHmacTag: {
    color: theme.textSecondary,
    fontFamily: fontMono,
    fontSize: 10,
    borderWidth: 1,
    borderColor: theme.textSecondary,
    paddingHorizontal: 3,
  },
  keyInput: {
    backgroundColor: theme.bgInset,
    borderWidth: 1,
    borderColor: theme.border,
    color: theme.textPrimary,
    fontFamily: fontMono,
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
    outlineStyle: "none",
  } as any,
  infoCard: {
    borderWidth: 1,
    borderColor: theme.borderMuted,
    backgroundColor: theme.bgInset,
    padding: 10,
    gap: 6,
  },
  infoTitle: {
    color: theme.textSecondary,
    fontFamily: fontMono,
    fontSize: 12,
    fontWeight: "700",
  },
  infoText: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 12,
    lineHeight: 16,
  },
});
