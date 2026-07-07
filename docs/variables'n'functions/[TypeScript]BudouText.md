---
source_file: "frontend/src/components/BudouText.tsx"
language: "TypeScript"
description: "budouXを使った日本語改行制御コンポーネントおよびプレーンテキスト向けヘルパー関数。App.tsxから分離。"
tags:
  - "@UI"
exports:
  - BudouText
  - toBudouString
imports: []
---

## 各定義

### BudouText
* 日本語テキストの改行位置をbudouXで制御するReactコンポーネント。
* Arguments: text (string), enabled (boolean, optional, default=true)
* enabled=false のとき <>{text}</> をそのまま返す。

### toBudouString
* textarea の placeholder などプレーンテキスト属性向けに、budouXの改行推奨位置にゼロ幅スペース (U+200B) を挿入した文字列を返すヘルパー。
* Arguments: text (string), enabled (boolean, optional, default=true)
* Returns: string