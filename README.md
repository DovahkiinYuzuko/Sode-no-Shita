# 袖の下のファイル / Sode-no-Shita P2P

![image](image.png)

P2Pで直接ファイルやフォルダを双方向に送受信できる、軽量で安全なWebRTCファイル転送ツール / A lightweight and secure WebRTC file transfer tool that allows bidirectional P2P transfer of files and folders.

[![Go](https://img.shields.io/badge/Go-00ADD8?style=flat-square&logo=go&logoColor=white)](https://go.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=flat-square&logo=webrtc&logoColor=white)](https://webrtc.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square&logo=opensourceinitiative&logoColor=white)](LICENSE.MIT)

[日本語](#日本語) | [English](#english)

## 日本語

### 特徴
* **サーバーレスP2P通信**: WebRTCを利用し、デバイス間で直接ファイルを転送します。ファイルデータが外部サーバーを経由・保存されることはありません。
* **インストール不要**: 単一の実行ファイルを含むアーカイブ（ZIP / tar.gz）として提供されるため、解凍してすぐに使用できます。
* **NAT越え・中継TURNサーバー対応**: Symmetric NATや厳格なファイアウォール環境でも、設定画面からTURNサーバーを指定することで安定してP2P通信を確立できます。
* **接続コードのファイル共有 (.sode)**: チャットツールの文字数制限やMarkdownによる記号欠落を回避するため、ワンクリックで接続コードを `.sode` ファイルとして保存・ドラッグ＆ドロップ読み込みが可能です。
* **マルチプラットフォーム対応**: Windows、macOS（Apple Silicon / Intel）、Linuxで動作します。
* **多言語＆テーマ切り替え**: 日本語 / 英語の表示切替、およびダーク / ライトテーマに対応しています。
* **直感的なOSダイアログ**: ネイティブのファイル選択ダイアログを使用し、簡単にファイルや保存先フォルダを指定できます。

### インストール方法

#### 一般ユーザー向け（推奨）
[Releases](https://github.com/DovahkiinYuzuko/Sode-no-Shita/releases) ページから、お使いの環境に合った最新のアーカイブをダウンロードし、展開（解凍）して実行してください。

* **Windows (64bit)**: `sode-no-shita-v*.*.*-windows-amd64.zip`
* **macOS (Apple Silicon: M1 / M2 / M3 / M4等)**: `sode-no-shita-v*.*.*-macos-arm64.zip`
* **macOS (Intel)**: `sode-no-shita-v*.*.*-macos-intel.zip`
* **Linux (64bit)**: `sode-no-shita-v*.*.*-linux-amd64.tar.gz`

> [!NOTE]
> macOS環境で初回起動時に「開発元を検証できない」等のセキュリティ警告が表示された場合は、ファイルを右クリック（または Control キーを押しながらクリック）して「開く」を選択してください。

#### 開発者向け（ソースからのビルド）

> [!NOTE]
> ビルドには、**Go** と **Node.js** がシステムにインストールされている必要があります。

**Windowsの場合 (PowerShell)**
```powershell
git clone https://github.com/DovahkiinYuzuko/Sode-no-Shita.git
cd Sode-no-Shita

# フロントエンドのビルド
cd frontend
npm install
npm run build
cd ..

# バックエンドのビルド
go build -o sode-no-shita.exe main.go
```

**macOS / Linux の場合 (Bash / Zsh)**
```bash
git clone https://github.com/DovahkiinYuzuko/Sode-no-Shita.git
cd Sode-no-Shita

# フロントエンドのビルド
cd frontend
npm install
npm run build
cd ..

# バックエンドのビルド
go build -o sode-no-shita main.go
```

### 使い方

> [!WARNING]
> 接続コードには、P2P接続を確立するための通信経路情報が含まれています。信頼できる相手にのみ共有してください。

#### 1. P2P接続の確立
1. **接続コードAの生成（送信側）**:
   アプリを起動し、「接続コードAを生成して待機」ボタンを押します。生成されたコードをコピーするか、「ファイルとして保存 (.sode)」で保存して相手に送ります。
2. **コードAの解析とコードBの生成（受信側）**:
   アプリを起動し、受け取ったコードAを貼り付けるか、`.sode` ファイルをドラッグ＆ドロップして読み込み、「コードAを解析してコードBを生成」ボタンを押します。生成されたコードBを送信側に返します。
3. **コードBの入力と接続完了（送信側）**:
   返してもらったコードBを入力（または `.sode` ファイルをドラッグ＆ドロップ）し、「コードBを入力して接続確立」ボタンを押します。

#### 2. ファイルの送受信
1. 接続が完了したら、送信側は「送信ファイルを選択」をクリックして共有したいファイルを選びます。
2. 受信側は「保存先フォルダを指定」をクリックして保存場所を設定します。
3. 受信側の画面にファイル一覧が表示されるので、個別ダウンロードまたは「一括ダウンロード (ZIP)」をクリックして転送を開始します。

> [!TIP]
> 異なるネットワーク間（自宅と外出先、モバイル回線等）で直接P2Pが繋がりにくい場合は、画面右上の「設定」から中継TURNサーバーのURLおよび認証情報を入力してご利用ください。

### LICENSE
このプロジェクトのライセンスはMITです。詳しくは[LICENSE.MIT](LICENSE.MIT)をお読みください。また、サードパーティライセンスは[NOTICE.md](NOTICE.md)に表記してあります。

---

## English

### Features
* **Serverless P2P Communication**: Uses WebRTC to transfer files directly between devices. Your file data never passes through or gets stored on an external server.
* **No Installation Required**: Provided as an archive (ZIP / tar.gz) containing a single executable. Extract and run immediately.
* **NAT Traversal & TURN Relay Support**: Easily establish connections even under Symmetric NATs or strict firewalls by configuring a TURN relay server from the settings modal.
* **Signaling File Sharing (.sode)**: Save and drag-and-drop connection codes as `.sode` files to bypass chat platform character limits and Markdown formatting issues.
* **Cross-Platform**: Runs natively on Windows, macOS (Apple Silicon / Intel), and Linux.
* **Multilingual & Theming**: Switch between Japanese/English and Dark/Light themes seamlessly.
* **Native OS Dialogs**: Uses intuitive native file picker dialogs to select files and destination directories.

### Installation

#### General Users (Recommended)
Download the latest archive for your platform from the [Releases](https://github.com/DovahkiinYuzuko/Sode-no-Shita/releases) page, extract it, and run the executable.

* **Windows (64-bit)**: `sode-no-shita-v*.*.*-windows-amd64.zip`
* **macOS (Apple Silicon: M1 / M2 / M3 / M4)**: `sode-no-shita-v*.*.*-macos-arm64.zip`
* **macOS (Intel)**: `sode-no-shita-v*.*.*-macos-intel.zip`
* **Linux (64-bit)**: `sode-no-shita-v*.*.*-linux-amd64.tar.gz`

> [!NOTE]
> On macOS, if you encounter an "unidentified developer" warning on first launch, right-click (or Control-click) the application and select "Open".

#### Developers (Build from source)

> [!NOTE]
> Building from source requires **Go** and **Node.js** to be installed on your system.

**For Windows (PowerShell)**
```powershell
git clone https://github.com/DovahkiinYuzuko/Sode-no-Shita.git
cd Sode-no-Shita

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Build backend
go build -o sode-no-shita.exe main.go
```

**For macOS / Linux (Bash / Zsh)**
```bash
git clone https://github.com/DovahkiinYuzuko/Sode-no-Shita.git
cd Sode-no-Shita

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Build backend
go build -o sode-no-shita main.go
```

### How to Use

> [!WARNING]
> Connection codes contain routing information required to establish a P2P connection. Only share them with trusted parties.

#### 1. Establishing P2P Connection
1. **Generate Connection Code A (Sender)**:
   Launch the app and click "Generate Connection Code A & Wait". Copy the generated code or click "Save as File (.sode)" to share it with the receiver.
2. **Parse Code A & Generate Code B (Receiver)**:
   Launch the app, paste Code A or drag-and-drop the `.sode` file, and click "Parse Code A & Generate Code B". Return Code B to the sender.
3. **Enter Code B & Connect (Sender)**:
   Enter Code B received from the receiver (or drag-and-drop the `.sode` file) and click "Enter Code B & Connect".

#### 2. Sending and Receiving Files
1. Once connected, the Sender clicks "Select Files to Send" to choose files.
2. The Receiver clicks "Select Save Directory" to set the download location.
3. The file list appears on the Receiver's screen. Click individual download buttons or "Batch Download (ZIP)" to begin transferring.

> [!TIP]
> If direct P2P cannot connect across different networks, open "Settings" in the upper-right corner and configure a TURN relay server URL and credentials.

### LICENSE
This project is licensed under the MIT License. Please read [LICENSE.MIT](LICENSE.MIT) for details. Additionally, third-party licenses are listed in [NOTICE.md](NOTICE.md).
