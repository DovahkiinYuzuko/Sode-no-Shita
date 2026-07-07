---
source_file: "frontend/src/components/HelpModal.tsx"
language: "TypeScript"
description: "使い方ガイドを表示するヘルプモーダルコンポーネント。"
tags:
  - "@UI"
exports:
  - HelpModal
imports:
  - "frontend/src/i18n/types.ts"
  - "frontend/src/components/BudouText.tsx"
---

## 各定義

### HelpModal
* Props: lang, t, onClose
* t.helpSteps 配列を ol/li でレンダリングし、BudouText で折り返し制御する。