# Crypto Tool | 本地安全密码学与二维码工具箱

## 在线预览

👉 [crypto.minao.cc](https://crypto.minao.cc)

![website screenshot](./assets/images/website.png)

## 功能特性

- **哈希计算**: 支持常见的哈希算法，包括 `MD5`、`SHA-1`、`SHA-256`、`SHA-512`、`SHA-3`。
- **HMAC 消息认证**: 支持基于密钥的哈希计算，包括 `HMAC-MD5`、`HMAC-SHA1`、`HMAC-SHA256`、`HMAC-SHA512`。
- **对称加密**: 提供常用的对称加解密功能，支持 `AES`、`DES`、`3DES`、`RC4`。
- **编码转换**: 支持数据在不同格式间转换，包含 `Base64` 与 `URL` 的编码/解码。
- **二维码工具 (新)**:
  - **二维码生成**: 实时根据文本或网址生成符合复古像素风格的黑绿二维码，支持调节 L、M、Q、H 纠错级别，支持高清 PNG 下载 (Web端) 及复制 Base64。
  - **二维码解析**: 纯本地图片二维码解析。在 Web 端支持点击上传、拖拽上传以及直接 `Cmd+V / Ctrl+V` 截图粘贴解析，不经过任何服务器，确保数据 100% 隐私安全。

## 安全与隐私

- **100% 纯本地运行**: 本项目所有的哈希计算、加解密、编码转换及二维码生成和图片解析工作均在用户的浏览器/设备本地完成，绝不会向任何第三方服务器上传您的明文、密钥或二维码图片。

## 快速开始

1. **克隆项目**
   ```bash
   git clone https://github.com/minao-cc/crypto-tool.git
   cd crypto-tool
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **本地运行 Web 端**
   ```bash
   npm run web
   ```
