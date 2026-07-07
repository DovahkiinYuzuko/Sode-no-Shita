---
source_file: "frontend/src/App.tsx"
language: "TypeScript"
description: "ファイル共有ツールのReact UIメインコンポーネント。テーマ切り替え、シグナリング、ファイルリストの表示、および個別/一括ダウンロードのトリガーを担当。モーダル類はコンポーネントに分離済み。"
tags:
  - "@UI"
exports:
  - App
imports:
  - "frontend/src/i18n/index.ts"
  - "frontend/src/components/BudouText.tsx"
  - "frontend/src/components/SettingsModal.tsx"
  - "frontend/src/components/HelpModal.tsx"
  - "frontend/src/components/TransferCompleteModal.tsx"
---

## 依存関係 (Dependencies)

graph TD
    App.tsx --> i18n["src/i18n/index.ts"]
    App.tsx --> icons["src/icons.tsx"]
    App.tsx --> BudouText["src/components/BudouText.tsx"]
    App.tsx --> SettingsModal["src/components/SettingsModal.tsx"]
    App.tsx --> HelpModal["src/components/HelpModal.tsx"]
    App.tsx --> TransferCompleteModal["src/components/TransferCompleteModal.tsx"]

## 各定義

### App
* メインUIコンポーネント。SSE /api/status からFSM状態を購読してリアルタイム描画する。モーダル類はコンポーネントに委譲。
* fsmState ベースで画面を分岐制御する。
* transferComplete 状態で完了モーダルを制御し、閉じた際に /api/webrtc/clear-completed へPOSTしてGoの状態をクリアする。
* console.* はすべて t.log* キー経由で多言語化済み。

### updateConfig
* /api/config/update へPOSTしてテーマ・言語設定を永続化する非同期関数。
* Arguments: nextTheme (string, optional), nextLang (string, optional)

### closeTransferCompleteModal
* 転送完了モーダルを閉じ、/api/webrtc/clear-completed へPOSTしてサーバー側の completedFile 状態をクリアする非同期関数。