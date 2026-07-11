import CryptoJS from "crypto-js";

// Hashing
export const md5 = (text: string): string => CryptoJS.MD5(text).toString();
export const sha1 = (text: string): string => CryptoJS.SHA1(text).toString();
export const sha256 = (text: string): string => CryptoJS.SHA256(text).toString();
export const sha512 = (text: string): string => CryptoJS.SHA512(text).toString();
export const sha3 = (text: string): string => CryptoJS.SHA3(text).toString();

// HMAC Hashing
export const hmacMd5 = (text: string, key: string): string => CryptoJS.HmacMD5(text, key).toString();
export const hmacSha1 = (text: string, key: string): string => CryptoJS.HmacSHA1(text, key).toString();
export const hmacSha256 = (text: string, key: string): string => CryptoJS.HmacSHA256(text, key).toString();
export const hmacSha512 = (text: string, key: string): string => CryptoJS.HmacSHA512(text, key).toString();
const failedTip = "解密失败（无效秘钥或者密文）"
// Symmetric Encryption
export const encryptAES = (text: string, key: string): string => CryptoJS.AES.encrypt(text, key).toString();
export const decryptAES = (ciphertext: string, key: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted && ciphertext.length > 0) throw new Error("Empty decryption output");
    return decrypted;
  } catch {
    return failedTip;
  }
};


export const encryptDES = (text: string, key: string): string => CryptoJS.DES.encrypt(text, key).toString();
export const decryptDES = (ciphertext: string, key: string): string => {
  try {
    const bytes = CryptoJS.DES.decrypt(ciphertext, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted && ciphertext.length > 0) throw new Error("Empty decryption output");
    return decrypted;
  } catch {
    return failedTip;
  }
};

export const encryptTripleDES = (text: string, key: string): string => CryptoJS.TripleDES.encrypt(text, key).toString();
export const decryptTripleDES = (ciphertext: string, key: string): string => {
  try {
    const bytes = CryptoJS.TripleDES.decrypt(ciphertext, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted && ciphertext.length > 0) throw new Error("Empty decryption output");
    return decrypted;
  } catch {
    return failedTip;
  }
};

export const encryptRC4 = (text: string, key: string): string => CryptoJS.RC4.encrypt(text, key).toString();
export const decryptRC4 = (ciphertext: string, key: string): string => {
  try {
    const bytes = CryptoJS.RC4.decrypt(ciphertext, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted && ciphertext.length > 0) throw new Error("Empty decryption output");
    return decrypted;
  } catch {
    return failedTip;
  }
};

// Encoding & Decoding
export const encodeBase64 = (text: string): string => {
  const wa = CryptoJS.enc.Utf8.parse(text);
  return CryptoJS.enc.Base64.stringify(wa);
};


export const decodeBase64 = (ciphertext: string): string => {
  try {
    const wa = CryptoJS.enc.Base64.parse(ciphertext);
    const decoded = CryptoJS.enc.Utf8.stringify(wa);
    // Basic verification to check if the decoded output makes sense (UTF-8 parsing can sometimes succeed with garbage data on invalid Base64 input)
    if (!decoded && ciphertext.length > 0) throw new Error("Empty decoding output");
    return decoded;
  } catch {
    return "解码失败 (无效base64格式)";
  }
};

export const encodeURL = (text: string): string => encodeURIComponent(text);

export const decodeURL = (text: string): string => {
  try {
    return decodeURIComponent(text);
  } catch {
    return "解码失败 (无效URL编码格式)";
  }
};
