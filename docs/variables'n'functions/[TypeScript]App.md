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

### `App`
* **Description:** メインUIコンポーネント。GoのAPI（OSダイアログ起動、WebRTC接続確立リクエスト）を呼び出し、SSE `/api/status` から進捗データを購読して画面上にリアルタイム描画する。
