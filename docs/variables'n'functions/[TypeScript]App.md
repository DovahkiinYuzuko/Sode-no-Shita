---
source_file: "frontend/src/App.tsx"
language: "TypeScript"
type: "Component"
description: "ファイル共有ツールのReact UIメインコンポーネント。テーマ切り替え、シグナリング、接続コードのファイル保存/読込、ファイルリストの表示、およびダウンロードのトリガーを担当。"
tags:
  - "@UI"
related:
  exports:
    - App
  imports:
    - "frontend/src/i18n/index.ts"
    - "frontend/src/components/BudouText.tsx"
    - "frontend/src/components/SettingsModal.tsx"
    - "frontend/src/components/HelpModal.tsx"
    - "frontend/src/components/TransferCompleteModal.tsx"
---

# [TypeScript]App

## 概要
メインUIコンポーネント。SSE `/api/status` からFSM状態を購読してリアルタイム描画する。シグナリングコードの直接コピペに加え、ファイル（`.sode`）書き出しおよびドラッグ＆ドロップ/ファイル選択によるコード読み込みをサポートする。

## エクスポートコンポーネント

### (Component) `App`
* **説明:** メインUIコンポーネント。FSM状態（`fsmState`）に基づき画面を描画し、シグナリング操作やファイル転送を統括する。

## 内部関数

### (Function) `saveCodeToFile`
* **説明:** 引数で渡された接続コード（OfferまたはAnswer）を `.sode` 拡張子のテキストファイルとしてブラウザ上で生成しダウンロード保存する。
* **引数:**
  * `code` (`string`): 接続コード
  * `filename` (`string`): 保存ファイル名（例: `sode_offer.sode`）

### (Function) `handleCodeFileInput`
* **説明:** ユーザーが選択したファイル、またはドラッグ＆ドロップされたファイルからテキストを非同期で読み取り、入力欄（`inputCode`）に自動設定する。
* **引数:**
  * `file` (`File`): 読み取り対象のテキストファイル

### (Function) `updateConfig`
* **説明:** `/api/config/update` へPOSTしてテーマ・言語設定を永続化する非同期関数。
* **引数:**
  * `nextTheme` (`string`, optional)
  * `nextLang` (`string`, optional)

### (Function) `closeTransferCompleteModal`
* **説明:** 転送完了モーダルを閉じ、`/api/webrtc/clear-completed` へPOSTしてサーバー側の completedFile 状態をクリアする非同期関数。