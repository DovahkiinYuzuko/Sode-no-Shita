---
source_file: "frontend/src/i18n/index.ts"
language: "TypeScript"
description: "Viteの動的インポート機能を用いた多言語（i18n）辞書ファイルの自動収集と一元管理。"
tags:
  - "@Core"
exports:
  - locales
  - defaultLang
imports:
  - "frontend/src/i18n/types.ts"
  - "frontend/src/i18n/locales/en.ts"
  - "frontend/src/i18n/locales/ja.ts"
---

## 依存関係 (Dependencies)

```mermaid
graph TD
    index.ts["src/i18n/index.ts"] --> types.ts["src/i18n/types.ts"]
    index.ts["src/i18n/index.ts"] --> en.ts["src/i18n/locales/en.ts"]
    index.ts["src/i18n/index.ts"] --> ja.ts["src/i18n/locales/ja.ts"]
```

## 各定義 of `src/i18n/index.ts`

### `locales`
* **Description:** アプリケーション内で利用可能な言語辞書のマップ。Viteの `import.meta.glob` を用いて、`locales/` フォルダ配下の全言語ファイルを自動でクロールして構築される。

### `defaultLang`
* **Description:** アプリケーションのデフォルト言語。値は `"en"`。
