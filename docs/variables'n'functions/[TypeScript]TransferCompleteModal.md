---
source_file: "frontend/src/components/TransferCompleteModal.tsx"
language: "TypeScript"
description: "送受信完了時に表示するモーダルコンポーネント。role (sender/receiver) に応じてダウンロード/アップロード完了メッセージを切り替える。"
tags:
  - "@UI"
exports:
  - TransferCompleteModal
imports:
  - "frontend/src/i18n/types.ts"
  - "frontend/src/components/BudouText.tsx"
---

## 各定義

### TransferCompleteModal
* Props: lang, t, fileName, role, onClose
* role === 'receiver' のとき downloadCompleteTitle / downloadCompleteMsg を表示。
* role === 'sender' のとき uploadCompleteTitle / uploadCompleteMsg を表示。
* fileName は wordBreak: break-all で表示。