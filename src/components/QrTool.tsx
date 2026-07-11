import jsQR from "jsqr";
import QRCode from "qrcode";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  Image as RNImage,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { fontMono, theme } from "../utils/theme";
import { useIsDesktop } from "../hooks/useIsDesktop";
import ToolBox from "./ToolBox";

interface QrToolProps {}

type Mode = "encode" | "decode";
type EccLevel = "L" | "M" | "Q" | "H";

export default function QrTool({ }: QrToolProps) {
  const isDesktop = useIsDesktop();
  const [mode, setMode] = useState<Mode>("encode");

  // --- Encoder States ---
  const [inputText, setInputText] = useState("https://minao.cc");
  const [eccLevel, setEccLevel] = useState<EccLevel>("M");
  const [downloadDataUrl, setDownloadDataUrl] = useState<string>("");
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [downloadFeedback, setDownloadFeedback] = useState(false);

  // --- Decoder States ---
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [decodedText, setDecodedText] = useState<string>("");
  const [decodeError, setDecodeError] = useState<string>("");
  const [copyDecodedFeedback, setCopyDecodedFeedback] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<any>(null);

  // --- Generate QR Code Matrix ---
  const qrMatrix = useMemo(() => {
    if (mode !== "encode") return null;
    try {
      const textToEncode = inputText || " ";
      const qr = QRCode.create(textToEncode, {
        errorCorrectionLevel: eccLevel,
      });
      return {
        size: qr.modules.size,
        data: qr.modules.data,
      };
    } catch (err) {
      console.error("Failed to generate QR Code", err);
      return null;
    }
  }, [inputText, eccLevel, mode]);

  // --- Generate Download Data URL (Web Only) ---
  useEffect(() => {
    if (mode !== "encode" || Platform.OS !== "web") return;
    let isMounted = true;
    const textToEncode = inputText || " ";

    QRCode.toDataURL(textToEncode, {
      errorCorrectionLevel: eccLevel,
      margin: 4,
      width: 512,
      color: {
        dark: theme.textPrimary,
        light: theme.bg,
      },
    })
      .then((url) => {
        if (isMounted) {
          setDownloadDataUrl(url);
        }
      })
      .catch((err) => {
        console.error("Failed to generate download URL", err);
      });

    return () => {
      isMounted = false;
    };
  }, [inputText, eccLevel, mode]);

  // --- Helper to download QR Code on Web ---
  const handleDownload = () => {
    if (Platform.OS !== "web" || !downloadDataUrl) return;
    const link = document.createElement("a");
    link.href = downloadDataUrl;
    link.download = `qrcode_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadFeedback(true);
    setTimeout(() => setDownloadFeedback(false), 2000);
  };

  const copyBase64 = () => {
    if (!downloadDataUrl) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(downloadDataUrl)
        .then(() => {
          setCopyFeedback(true);
          setTimeout(() => setCopyFeedback(false), 2000);
        })
        .catch(() => { });
    }
  };

  // --- Decoder Logic (Web Only) ---
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setDecodeError("请上传有效的图片文件");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedImage(dataUrl);
      decodeImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const decodeImage = (dataUrl: string) => {
    setDecodeError("");
    setDecodedText("");
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setDecodeError("无法创建 Canvas 上下文");
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      try {
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          setDecodedText(code.data);
          setDecodeError("");
        } else {
          setDecodeError("未检测到有效的二维码，请确保图片清晰且二维码完整。");
        }
      } catch (err) {
        setDecodeError("解析出错: " + (err as Error).message);
      }
    };
    img.onerror = () => {
      setDecodeError("图片加载失败，请重试");
    };
    img.src = dataUrl;
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Paste handler
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processFile(file);
          break;
        }
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const copyDecodedText = () => {
    if (!decodedText) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(decodedText)
        .then(() => {
          setCopyDecodedFeedback(true);
          setTimeout(() => setCopyDecodedFeedback(false), 2000);
        })
        .catch(() => { });
    }
  };

  // --- Render QR Pixel Grid (Retro style) ---
  const renderQrGrid = () => {
    if (!qrMatrix) return null;
    const { size, data } = qrMatrix;

    // We want the grid to fit nicely, e.g., max 280px wide
    const maxDisplaySize = 280;
    const cellSize = Math.floor(maxDisplaySize / size);
    const actualWidth = cellSize * size;

    const rows = [];
    for (let r = 0; r < size; r++) {
      const rowCells = [];
      for (let c = 0; c < size; c++) {
        const isDark = data[r * size + c] === 1;
        rowCells.push(
          <View
            key={`${r}-${c}`}
            style={{
              width: cellSize,
              height: cellSize,
              backgroundColor: isDark ? theme.textPrimary : theme.bgInset,
            }}
          />
        );
      }
      rows.push(
        <View key={r} style={{ flexDirection: "row" }}>
          {rowCells}
        </View>
      );
    }

    return (
      <View style={[styles.qrContainer, { width: actualWidth + 24, height: actualWidth + 24 }]}>
        <View style={styles.qrBorder}>
          <View style={{ flexDirection: "column" }}>{rows}</View>
        </View>
      </View>
    );
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
            二维码生成 [ENCODE]
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeTab, mode === "decode" && styles.modeTabActiveDecode]}
          onPress={() => setMode("decode")}
          activeOpacity={0.7}
        >
          <Text style={[styles.modeTabText, mode === "decode" && styles.modeTabTextActive]}>
            二维码解析 [DECODE]
          </Text>
        </TouchableOpacity>
      </View>

      <ToolBox>
        {mode === "encode" ? (
          <>
            {/* ENCODER: Input Panel */}
            <View style={[styles.panel, isDesktop && styles.panelLeft]}>
              <Text style={styles.panelTitle}>▶ 配置生成参数</Text>

              {/* Text Input */}
              <View style={styles.fieldGroup}>
                <View style={styles.fieldHeader}>
                  <Text style={styles.fieldLabel}>文本/链接内容:</Text>
                  <Text style={styles.fieldMeta}>{inputText.length} 字符</Text>
                </View>
                <TextInput
                  id='qr-encode-input'
                  style={styles.textArea}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="_ 输入想要生成二维码隔阂、网址、文本或其他信息..."
                  placeholderTextColor={theme.textMuted}
                  multiline
                  numberOfLines={5}
                />
              </View>

              {/* ECC Level Picker */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>纠错级别 (ECC Level):</Text>
                <View style={styles.optionList}>
                  {(["L", "M", "Q", "H"] as EccLevel[]).map((level) => {
                    const isActive = eccLevel === level;
                    const descriptions = {
                      L: "低级 (约7% 损毁修复)",
                      M: "中级 (约15% 损毁修复)",
                      Q: "四分之一 (约25% 损毁修复)",
                      H: "高级 (约30% 损毁修复)",
                    };
                    return (
                      <TouchableOpacity
                        key={level}
                        style={[styles.optionItem, isActive && styles.optionItemActive]}
                        onPress={() => setEccLevel(level)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                          {isActive ? `► ${level}` : `  ${level}`}
                        </Text>
                        <Text style={styles.optionDesc}>{descriptions[level]}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>{"// ABOUT: QR CODE ENCODING"}</Text>
                <Text style={styles.infoText}>
                  二维码容错级别越高，在部分污损或遮挡时仍能被扫出，但其包含的数据点阵也会更密集。建议网址使用 M 级别，名片或含 Logo 的二维码使用 H 级别。
                </Text>
              </View>
            </View>

            {/* ENCODER: Output Panel */}
            <View style={[styles.panel, isDesktop && styles.panelRight]}>
              <Text style={styles.panelTitle}>▶ 像素生成预览</Text>
              <View style={styles.outputCard}>
                {/* QR Preview Grid */}
                <View style={styles.qrPreviewWrapper}>
                  {qrMatrix ? renderQrGrid() : <Text style={styles.emptyText}>_ 无法生成二维码</Text>}
                </View>

                {/* Actions */}
                {Platform.OS === "web" && (
                  <View style={styles.actionButtonGroup}>
                    <TouchableOpacity
                      style={[styles.actionBtn, downloadFeedback && styles.actionBtnActive]}
                      onPress={handleDownload}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionBtnText}>
                        {downloadFeedback ? "已下载 [DONE]" : "下载图片 [PNG]"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, copyFeedback && styles.actionBtnActive]}
                      onPress={copyBase64}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionBtnText}>
                        {copyFeedback ? "已复制 [COPIED]" : "复制 BASE64"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* DECODER: Upload Panel */}
            <View style={[styles.panel, isDesktop && styles.panelLeft]}>
              <Text style={styles.panelTitle}>▶ 载入二维码图片</Text>

              {Platform.OS === "web" ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onPaste={handlePaste}
                  onClick={triggerFileSelect}
                  style={{
                    border: `2px dashed ${isDragging ? theme.textPrimary : theme.borderMuted}`,
                    backgroundColor: isDragging ? theme.bgHighlight : theme.bgInset,
                    padding: "32px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    gap: "12px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                  <Text style={styles.uploadIcon}>[ ⇪ ]</Text>
                  <Text style={styles.uploadTitle}>点击选择图片、拖拽文件到此 或 直接截图粘贴</Text>
                  <Text style={styles.uploadTip}>支持常用的 PNG, JPG, WEBP 格式图片</Text>
                </div>
              ) : (
                <View style={styles.fallbackUploadCard}>
                  <Text style={styles.fallbackText}>
                    ⚠️ 二维码图片解析目前仅在 Web 浏览器端支持。
                  </Text>
                </View>
              )}

              {/* Uploaded Image Preview */}
              {uploadedImage && (
                <View style={styles.previewImageGroup}>
                  <Text style={styles.fieldLabel}>已上传图片预览:</Text>
                  <View style={styles.imageFrame}>
                    <RNImage
                      source={{ uri: uploadedImage }}
                      style={styles.previewImage}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              )}
            </View>

            {/* DECODER: Result Panel */}
            <View style={[styles.panel, isDesktop && styles.panelRight]}>
              <Text style={styles.panelTitle}>▶ 解析明文结果</Text>
              <View style={styles.outputCard}>
                <View style={styles.outputHeader}>
                  <Text style={styles.outputTitle}>解析到的文本内容</Text>
                  {decodedText ? (
                    <TouchableOpacity
                      style={[styles.copyBtn, copyDecodedFeedback && styles.copyBtnDone]}
                      onPress={copyDecodedText}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.copyBtnText}>
                        {copyDecodedFeedback ? "已复制 [COPIED]" : "复制 [COPY]"}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                <View style={styles.outputBlock}>
                  {decodeError ? (
                    <Text style={styles.errorText}>{decodeError}</Text>
                  ) : decodedText ? (
                    <Text style={styles.codeText} selectable>
                      {decodedText}
                    </Text>
                  ) : (
                    <Text style={styles.emptyText}>_ 等待载入图片解析...</Text>
                  )}
                </View>
              </View>
            </View>
          </>
        )}
      </ToolBox>
    </>
  );
}

const styles = StyleSheet.create({

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
    fontSize: 13,
    padding: 10,
    minHeight: 100,
    textAlignVertical: "top",
    outlineStyle: "none",
  } as any,
  optionList: {
    gap: 6,
    marginTop: 4,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderWidth: 1,
    borderColor: theme.borderMuted,
    backgroundColor: theme.bgInset,
  },
  optionItemActive: {
    borderColor: theme.border,
    backgroundColor: theme.bgHighlight,
  },
  optionText: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 12,
    fontWeight: "700",
    width: 50,
  },
  optionTextActive: {
    color: theme.textPrimary,
  },
  optionDesc: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 11,
    marginLeft: 10,
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
  outputCard: {
    gap: 12,
    alignItems: "center",
    width: "100%",
  },
  qrPreviewWrapper: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: theme.bgInset,
    borderWidth: 1,
    borderColor: theme.borderMuted,
    width: "100%",
    minHeight: 300,
  },
  qrContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.bg,
    borderWidth: 2,
    borderColor: theme.border,
    padding: 12,
  },
  qrBorder: {
    borderWidth: 1,
    borderColor: theme.borderMuted,
  },
  actionButtonGroup: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.border,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.bgInset,
  },
  actionBtnActive: {
    backgroundColor: theme.bgHighlight,
  },
  actionBtnText: {
    color: theme.textPrimary,
    fontFamily: fontMono,
    fontSize: 12,
    fontWeight: "700",
  },
  uploadIcon: {
    color: theme.textPrimary,
    fontFamily: fontMono,
    fontSize: 28,
  },
  uploadTitle: {
    color: theme.textSecondary,
    fontFamily: fontMono,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  uploadTip: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 10,
    textAlign: "center",
  },
  fallbackUploadCard: {
    borderWidth: 1,
    borderColor: theme.accentRed,
    backgroundColor: theme.bgInset,
    padding: 20,
    alignItems: "center",
  },
  fallbackText: {
    color: theme.accentRed,
    fontFamily: fontMono,
    fontSize: 12,
    textAlign: "center",
  },
  previewImageGroup: {
    gap: 8,
    marginTop: 10,
  },
  imageFrame: {
    borderWidth: 1,
    borderColor: theme.borderMuted,
    backgroundColor: theme.bgInset,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: {
    width: "100%",
    height: 200,
    maxWidth: 300,
  },
  outputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
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
    minHeight: 120,
    width: "100%",
  } as any,
  codeText: {
    color: theme.textPrimary,
    fontFamily: fontMono,
    fontSize: 13,
    lineHeight: 18,
    wordBreak: "break-all",
  } as any,
  errorText: {
    color: theme.accentRed,
    fontFamily: fontMono,
    fontSize: 12,
    lineHeight: 16,
  },
  emptyText: {
    color: theme.textMuted,
    fontFamily: fontMono,
    fontSize: 12,
    fontStyle: "italic",
  },
});
