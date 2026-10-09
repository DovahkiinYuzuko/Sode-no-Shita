---
source_file: "frontend/src/components/SettingsModal.tsx"
language: "TypeScript"
description: "テーマ切り替えおよび言語選択のUIを提供する設定モーダルコンポーネント。langDisplayNameを直接参照することでハードコードternaryを排除。"
tags:
  - "@UI"
exports:
  - SettingsModal
imports:
  - "frontend/src/i18n/types.ts"
  - "frontend/src/components/BudouText.tsx"
---

## 各定義

### SettingsModal
* Props: `lang`, `locales`, `theme`, `t`, `turnServerUrl`, `turnUsername`, `turnCredential`, `onClose`, `onLangChange`, `onThemeChange`, `onTurnConfigChange`
* `locales[key].langDisplayName` を参照して言語名を表示。新言語追加時はlocaleファイル追加のみで対応可能。
* 中継TURNサーバー設定（URL, ユーザー名, パスワード）の入力項目を提供し、バックエンドへ保存可能にする。