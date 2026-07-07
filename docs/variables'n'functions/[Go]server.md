---
source_file: "backend/server.go"
language: "Go"
description: "HTTP APIルーティング、Server-Sent Events (SSE) によるリアルタイム進捗通知、およびViteフロントエンドの埋め込み配信。"
tags:
  - "@Core"
exports:
  - StartWebServer
imports:
  - "backend/webrtc.go"
  - "backend/dialog.go"
---

### `StartWebServer` (L18-178)
* **Description:** HTTP APIハンドラを登録し、埋め込みWebサーバーを起動する。
* **Arguments:**
  * `port` (int): 起動するポート番号
```