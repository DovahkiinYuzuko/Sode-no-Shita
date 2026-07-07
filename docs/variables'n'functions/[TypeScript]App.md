---
source_file: "frontend/src/App.tsx"
language: "TypeScript"
description: "ファイル共有ツールのReact UIメインコンポーネント。テーマ切り替え、シグナリング、ファイルリストの表示、および個別/一括ダウンロードのトリガーを担当。"
tags:
  - "@UI"
exports:
  - App
imports: []
---

## 各定義 of `frontend/src/App.tsx`

### `App`
* **Description:** メインUIコンポーネント。GoのAPIを呼び出し、SSE `/api/status` からFSMの接続状態を購読して画面上にリアルタイム描画する。
* **Details:**
  * 状態の描画制御は、従来の `connState` に代わり、FSMの状態を表す `fsmState` フィールドを基に行われる。
  * `fsmState` が `WAITING_FOR_ANSWER` のとき、生成されたOfferコード（A）およびAnswer入力エリアを表示する。
  * `fsmState` が `FAILED` のとき、エラー状態と「リセット」ボタンを表示し、初期状態 `IDLE` に戻れるようにする。
