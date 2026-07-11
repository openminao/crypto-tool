import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { decodeBase64, decodeURL, encodeBase64, encodeURL } from "../utils/cryptoHelpers";
import { getLastAlgorithm, saveLastAlgorithm } from "../utils/storageHelpers";
import { fontMono, theme } from "../utils/theme";
import { useIsDesktop } from "../hooks/useIsDesktop";
import ToolBox from "./ToolBox";

interface EncodeToolProps {}

type Mode = "encode" | "decode";

const ENCODE_ALGORITHMS = [
  {
    id: "base64",
    name: "BASE64",
    fullName: "Base64 Encoding",
    desc: "将二进制数据编码为可打印 ASCII 字符串，常用于传输",
  },
  {
    id: "url",
    name: "URL-ENC",
    fullName: "URL Percent Encoding",
    desc: "将 URL 中的特殊字符转义为 %XX 十六进制格式",
  },
];

export default function EncodeTool({ }: EncodeToolProps) {
  const isDesktop = useIsDesktop();
  const [mode, setMode] = useState<Mode>("encode");
  const [selectedAlgo, setSelectedAlgo] = useState(() => getLastAlgorithm("encode", "base64"));
  const [inputText, setInputText] = useState("");

  const outputResult = (() => {
    if (!inputText) return "";
    if (mode === "encode") {
      switch (selectedAlgo) {
        case "base64": return encodeBase64(inputText);
        case "url": return encodeURL(inputText);
        default: return "";
      }
    } else {
      switch (selectedAlgo) {
        case "base64": return decodeBase64(inputText);
        case "url": return decodeURL(inputText);
        default: return "";
      }
    }
  })();

  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleSelectAlgo = (algoId: string) => {
    setSelectedAlgo(algoId);
    saveLastAlgorithm("encode", algoId);
  };

  const activeAlgoObj = ENCODE_ALGORITHMS.find((a) => a.id === selectedAlgo) || ENCODE_ALGORITHMS[0];

  const copyText = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      }).catch(() => { });
    }
  };

  return (
    <>
      {/* Mode toggle tabs */}
      <View style={styles.modeTabs}>
        <TouchableOpacity
          style={[styles.modeTab, mode === "encode" && styles.modeTabActiveEncode]}
          onPress={() => setMode("encode")}
          activeOpacity={0.7}
        >
          <Text style={[styles.modeTabText, mode === "encode" && styles.modeTabTextActive]}>
            编码 [ENCODE]
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeTab, mode === "decode" && styles.modeTabActiveDecode]}
          onPress={() => setMode("decode")}
          activeOpacity={0.7}
        >
          <Text style={[styles.modeTabText, mode === "decode" && styles.modeTabTextActive]}>
            解码 [DECODE]
          </Text>
        </TouchableOpacity>
      </View>

      <ToolBox>
        {/* Input panel */}
        <View style={[styles.panel, isDesktop && styles.panelLeft]}>
          <Text style={styles.panelTitle}>▶ 输入配置</Text>

          {/* Input text */}
          <View style={styles.fieldGroup}>
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldLabel}>
                {mode === "encode" ? "文本输入:" : "输入要解码的文本:"}
              </Text>
              <Text style={styles.fieldMeta}>{inputText.length} 字符</Text>
            </View>
            <TextInput
              id='encode-input'
              style={styles.textArea}
              value={inputText}
              onChangeText={setInputText}
              placeholder={mode === "encode"
                ? "_ 输入要编码的文本..."
                : "_ 粘贴已编码字符串进行解码..."}
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={6}
            />
          </View>

          {/* Format picker */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>转换格式:</Text>
            <View style={styles.algoList}>
              {ENCODE_ALGORITHMS.map((algo) => {
                const isActive = selectedAlgo === algo.id;
                return (
                  <TouchableOpacity
                    key={algo.id}
                    style={[styles.algoItem, isActive && styles.algoItemActive]}
                    onPress={() => handleSelectAlgo(algo.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.algoRow}>
                      <Text style={[styles.algoMark, isActive && styles.algoMarkActive]}>
                        {isActive ? "►" : " "}
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
              <Text style={styles.infoTitle}>{`// ABOUT: ${activeAlgoObj.fullName}`}</Text>
              <Text style={styles.infoText}>
                {activeAlgoObj.desc}
              </Text>
              <Text style={styles.infoNote}>
                ■ 编码≠加密 — 编码无需密钥，任何人均可解码还原
              </Text>
            </View>
          </View>
        </View>

        {/* Output panel */}
        <View style={[styles.panel, isDesktop && styles.panelRight]}>
          <Text style={styles.panelTitle}>
            ▶ {mode === "encode" ? "编码转换结果" : "还原解码结果"}
          </Text>
          <View style={styles.outputCard}>
            <View style={styles.outputHeader}>
              <Text style={styles.outputTitle}>{mode === "encode" ? `${activeAlgoObj.name} 结果` : "解码明文"}</Text>
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
      </ToolBox>
    </>
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
  modeTabActiveEncode: {
    backgroundColor: theme.bgHighlight,
    borderBottomWidth: 2,
    borderBottomColor: theme.textPrimary,
  },
  modeTabActiveDecode: {
    backgroundColor: theme.bgHighlight,
    borderBottomWidth: 2,
    borderBottomColor: theme.textSecondary,
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
  panel: {
    backgroundColor: theme.bgPanel,
    borderWidth: 1,
    borderColor: theme.borderMuted,
    padding: 14,
    gap: 14
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
    minHeight: 110,
    textAlignVertical: "top",
    outlineStyle: "none",
  } as any,
  algoList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  algoItem: {
    paddingVertical: 10,
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
    width: 10,
  },
  algoMarkActive: {
    color: theme.textPrimary,
  },
  algoName: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 13,
    fontWeight: "700",
    minWidth: 70,
  },
  algoNameActive: {
    color: theme.textPrimary,
  },
  algoFull: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 10,
    flex: 1,
  },
  algoDesc: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 10,
    marginLeft: 16,
    lineHeight: 14,
  },
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
    alignItems: 'center',
    justifyContent: 'center'
  },
  copyBtnDone: {
    backgroundColor: theme.bgHighlight,
  },
  copyBtnText: {
    color: theme.textSecondary,
    fontFamily: fontMono,
    fontSize: 11,
    fontWeight: "700",
    alignSelf: 'center'
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
