import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SliceHabit, getSliceHabit, saveSliceHabit } from "../utils/storageHelpers";
import { fontMono, theme } from "../utils/theme";

interface SliceControlsProps {
  rawOutput: string;
  algoKey: string;
  label?: string;
  defaultEnabled?: boolean;
}

export default function SliceControls({ rawOutput, algoKey, label = "OUTPUT", defaultEnabled = false }: SliceControlsProps) {
  const defaultHabit: SliceHabit = { start: 0, enabled: defaultEnabled };
  const storedHabit = getSliceHabit(algoKey, defaultHabit);

  const [enabled, setEnabled] = useState(storedHabit.enabled);
  const [startInput, setStartInput] = useState(storedHabit.enabled ? storedHabit.start.toString() : "");
  const [endInput, setEndInput] = useState(storedHabit.enabled && storedHabit.end !== undefined ? storedHabit.end.toString() : "");

  const [copyFeedbackRaw, setCopyFeedbackRaw] = useState(false);
  const [copyFeedbackSliced, setCopyFeedbackSliced] = useState(false);

  const normalizeEnabled = (proposedEnabled: boolean, startStr: string, endStr: string) => {
    if (defaultEnabled) return true;
    return proposedEnabled || startStr.trim() !== "" || endStr.trim() !== "";
  };

  const handleHabitChange = (newEnabled: boolean, startStr: string, endStr: string) => {
    const startNum = parseInt(startStr, 10);
    const start = isNaN(startNum) ? 0 : startNum;
    const endNum = parseInt(endStr, 10);
    const end = isNaN(endNum) || endStr.trim() === "" ? undefined : endNum;
    const habit: SliceHabit = { start, end, enabled: newEnabled };
    saveSliceHabit(algoKey, habit);
  };

  const handleStartChange = (val: string) => {
    const nextEnabled = normalizeEnabled(enabled, val, endInput);
    setStartInput(val);
    setEnabled(nextEnabled);
    if (nextEnabled) {
      handleHabitChange(nextEnabled, val, endInput);
    }
  };

  const handleEndChange = (val: string) => {
    const nextEnabled = normalizeEnabled(enabled, startInput, val);
    setEndInput(val);
    setEnabled(nextEnabled);
    if (nextEnabled) {
      handleHabitChange(nextEnabled, startInput, val);
    }
  };

  const applyTemplate = (tplStart: number, tplEnd: number | undefined) => {
    setEnabled(true);
    setStartInput(tplStart.toString());
    setEndInput(tplEnd !== undefined ? tplEnd.toString() : "");
    handleHabitChange(true, tplStart.toString(), tplEnd !== undefined ? tplEnd.toString() : "");
  };

  const resetTemplate = () => {
    const nextEnabled = defaultEnabled;
    setEnabled(nextEnabled);
    setStartInput(nextEnabled ? "0" : "");
    setEndInput("");
    handleHabitChange(nextEnabled, nextEnabled ? "0" : "", "");
  };

  const getSlicedOutputAndHighlight = () => {
    const len = rawOutput.length;
    if (len === 0) return { sliced: "", prefix: "", highlight: "", suffix: "" };
    if (!enabled) return { sliced: rawOutput, prefix: "", highlight: rawOutput, suffix: "" };

    const startNum = parseInt(startInput, 10);
    let s = isNaN(startNum) ? 0 : startNum;
    if (s < 0) s = len + s;
    if (s < 0) s = 0;
    if (s > len) s = len;

    const endNum = parseInt(endInput, 10);
    let e = isNaN(endNum) || endInput.trim() === "" ? len : endNum;
    if (e < 0) e = len + e;
    if (e < 0) e = 0;
    if (e > len) e = len;

    const actualStart = Math.min(s, e);
    const actualEnd = Math.max(s, e);

    return {
      sliced: rawOutput.slice(s, e),
      prefix: rawOutput.slice(0, actualStart),
      highlight: rawOutput.slice(actualStart, actualEnd),
      suffix: rawOutput.slice(actualEnd),
    };
  };

  const { sliced, prefix, highlight, suffix } = getSlicedOutputAndHighlight();

  const copyText = (text: string, isRaw: boolean) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        if (isRaw) {
          setCopyFeedbackRaw(true);
          setTimeout(() => setCopyFeedbackRaw(false), 2000);
        } else {
          setCopyFeedbackSliced(true);
          setTimeout(() => setCopyFeedbackSliced(false), 2000);
        }
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>■ {label.toUpperCase()}</Text>
      </View>

      {/* Slice range inputs */}
      <View style={styles.rangeRow}>
        <View style={styles.rangeField}>
            <Text style={styles.rangeLabel}>起始索引</Text>
            <TextInput
              style={styles.rangeInput}
              value={startInput}
              onChangeText={handleStartChange}
              placeholder="0"
              placeholderTextColor={theme.textMuted}
              keyboardType="numbers-and-punctuation"
            />
            <Text style={styles.rangeTip}>负数表示从末尾倒数，例如 -8</Text>
          </View>
          <Text style={styles.rangeSep}>─</Text>
          <View style={styles.rangeField}>
            <Text style={styles.rangeLabel}>结束索引</Text>
            <TextInput
              style={styles.rangeInput}
              value={endInput}
              onChangeText={handleEndChange}
              placeholder="(末尾)"
              placeholderTextColor={theme.textMuted}
              keyboardType="numbers-and-punctuation"
            />
            <Text style={styles.rangeTip}>留空=至末尾</Text>
          </View>
        </View>

      {/* Quick template buttons */}
      <View style={styles.templateRow}>
        <Text style={styles.templateTitle}>常用截取:</Text>
        {[
          { label: "[:8]", s: 0, e: 8 },
          { label: "[:16]", s: 0, e: 16 },
          { label: "[-8:]", s: -8, e: undefined },
          { label: "[-16:]", s: -16, e: undefined },
        ].map((t) => (
          <TouchableOpacity
            key={t.label}
            style={styles.templateBtn}
            onPress={() => applyTemplate(t.s, t.e)}
            activeOpacity={0.7}
          >
            <Text style={styles.templateBtnText}>{t.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.templateBtnReset}
          onPress={resetTemplate}
          activeOpacity={0.7}
        >
          <Text style={styles.templateBtnResetText}>重置</Text>
        </TouchableOpacity>
      </View>

      {/* Full output with highlight */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            全文 {enabled && <Text style={styles.highlightNote}>[绿色部分为截取区间]</Text>}
          </Text>
          <TouchableOpacity
            style={[styles.copyBtn, copyFeedbackRaw && styles.copyBtnDone]}
            onPress={() => copyText(rawOutput, true)}
            activeOpacity={0.7}
          >
            <Text style={styles.copyBtnText}>{copyFeedbackRaw ? "已复制 [COPIED]" : "📋 复制全文"}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.codeBlock}>
          {rawOutput.length === 0 ? (
            <Text style={styles.emptyText}>_ 等待输入...</Text>
          ) : (
            <Text style={styles.codeText} selectable>
              {prefix}
              {highlight.length > 0 && (
                <Text style={enabled ? styles.highlightSpan : styles.codeText}>{highlight}</Text>
              )}
              {suffix}
            </Text>
          )}
        </View>
      </View>

      {/* Sliced result */}
      {enabled && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              截取结果 <Text style={styles.charCount}>[{sliced.length}个字符]</Text>
            </Text>
            <TouchableOpacity
              style={[styles.copyBtnAccent, copyFeedbackSliced && styles.copyBtnDone]}
              onPress={() => copyText(sliced, false)}
              activeOpacity={0.7}
            >
              <Text style={styles.copyBtnAccentText}>{copyFeedbackSliced ? "已复制 [COPIED]" : "📋 复制结果"}</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.codeBlock, styles.codeBlockSliced]}>
            {sliced.length === 0 ? (
              <Text style={styles.emptyText}>_ 截取区间为空</Text>
            ) : (
              <Text style={styles.slicedText} selectable>
                {sliced}
              </Text>
            )}
          </View>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.bgPanel,
    borderWidth: 2,
    borderColor: theme.border,
    padding: 14,
    gap: 12,
    ...(
      { boxShadow: `0 0 12px ${theme.glow}` } as any
    ),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: theme.borderMuted,
    paddingBottom: 10,
  },
  headerLabel: {
    color: theme.textPrimary,
    fontFamily: fontMono,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  rangeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  rangeField: {
    flex: 1,
    gap: 4,
  },
  rangeLabel: {
    color: theme.textSecondary,
    fontFamily: fontMono,
    fontSize: 12,
    fontWeight: "700",
  },
  rangeInput: {
    backgroundColor: theme.bgInset,
    borderWidth: 1,
    borderColor: theme.border,
    color: theme.textPrimary,
    fontFamily: fontMono,
    fontSize: 13,
    paddingHorizontal: 8,
    paddingVertical: 6,
    outlineStyle: "none",
  } as any,
  rangeSep: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 16,
    marginTop: 20,
  },
  rangeTip: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 10,
  },
  templateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  templateTitle: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 12,
  },
  templateBtn: {
    borderWidth: 1,
    borderColor: theme.textSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  templateBtnText: {
    color: theme.textSecondary,
    fontFamily: fontMono,
    fontSize: 12,
    fontWeight: "700",
  },
  templateBtnReset: {
    borderWidth: 1,
    borderColor: theme.accentRed,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  templateBtnResetText: {
    color: theme.accentRed,
    fontFamily: fontMono,
    fontSize: 10,
    fontWeight: "700",
  },
  section: {
    gap: 6,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: theme.textSecondary,
    fontFamily: fontMono,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  highlightNote: {
    color: theme.textPrimary,
    fontWeight: "normal",
  },
  charCount: {
    color: theme.textPrimary,
  },
  copyBtn: {
    borderWidth: 1,
    borderColor: theme.borderMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  copyBtnText: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 11,
  },
  copyBtnAccent: {
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  copyBtnAccentText: {
    color: theme.textPrimary,
    fontFamily: fontMono,
    fontSize: 11,
    fontWeight: "700",
  },
  copyBtnDone: {
    borderColor: theme.accentBlue,
  },
  codeBlock: {
    backgroundColor: theme.bgInset,
    borderWidth: 1,
    borderColor: theme.borderMuted,
    padding: 10,
    minHeight: 44,
  },
  codeBlockSliced: {
    borderColor: theme.border,
    ...(
      { boxShadow: `inset 0 0 8px ${theme.glow}` } as any
    ),
  },
  emptyText: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 12,
  },
  codeText: {
    color: theme.textSecondary,
    fontFamily: fontMono,
    fontSize: 12,
    lineHeight: 18,
    wordBreak: "break-all",
  } as any,
  highlightSpan: {
    color: theme.textDark,
    backgroundColor: theme.textPrimary,
    fontFamily: fontMono,
    fontWeight: "700",
  },
  slicedText: {
    color: theme.textPrimary,
    fontFamily: fontMono,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    wordBreak: "break-all",
    textShadow: `0 0 8px ${theme.glow}`,
  } as any,
  globalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: theme.borderMuted,
    paddingTop: 10,
  },
  globalLabel: {
    color: theme.textSecondary,
    fontFamily: fontMono,
    fontSize: 11,
  },
  globalSub: {
    color: theme.textMuted,
    fontSize: 10,
  },
  autoSaveTip: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 9,
  },
});
