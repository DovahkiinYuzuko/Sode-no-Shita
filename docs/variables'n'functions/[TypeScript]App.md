---
source_file: "frontend/src/App.tsx"
language: "TypeScript"
description: "ファイル共有ツールのReact UIメインコンポーネント。テーマ切り替え、シグナリング、ファイルリストの表示、および個別/一括ダウンロードのトリガーを担当。"
tags:
  - "@UI"
exports:
  - App
imports:
  - "frontend/src/i18n/index.ts"
---

## 依存関係 (Dependencies)

```mermaid
graph TD
    App.tsx["src/App.tsx"] --> i18n["src/i18n/index.ts"]
    App.tsx["src/App.tsx"] --> icons["src/icons.tsx"]
```

## 各定義 of `frontend/src/App.tsx`

### `App`
* **Description:** メインUIコンポーネント。GoのAPIを呼び出し、SSE `/api/status` からFSMの接続状態を購読して画面上にリアルタイム描画する。
* **Details:**
  * 状態の描画制御は、従来の `connState` に代わり、FSMの状態を表す `fsmState` フィールドを基に行われる。
  * `fsmState` が `WAITING_FOR_ANSWER` のとき、生成されたOfferコード（A）およびAnswer入力エリアを表示する。
  * `fsmState` が `FAILED` のとき、エラー状態と「リセット」ボタンを表示し、初期状態 `IDLE` に戻れるようにする。

### (Function) `BudouText`
* **Description:** 日本語（`lang === 'ja'`）表示の際に、Googleの `budoux` ライブラリを使用して美しい改行位置調整を行うコンポーネント。
* **Arguments:**
  * `text` (string): 折り返しを適用するプレーンテキスト。
  * `enabled` (boolean): 折り返しを有効にするかどうかのフラグ（日本語のみ `true`）。
