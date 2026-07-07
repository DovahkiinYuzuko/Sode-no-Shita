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
  - "backend/config.go"
---

## 依存関係 (Dependencies)

```mermaid
graph TD
    server.go["backend/server.go"] --> webrtc.go["backend/webrtc.go"]
    server.go["backend/server.go"] --> dialog.go["backend/dialog.go"]
    server.go["backend/server.go"] --> config.go["backend/config.go"]
```

## 各定義 of `backend/server.go`

### (Function) `StartWebServer` (L62-390)
* **Description:** HTTP APIハンドラを登録し、埋め込みWebサーバーを起動する。
* **Arguments:**
  * `port` (int): 起動するポート番号
* **Details:**
  * 起動時に `LoadConfig()` を呼び出して、設定を `GlobalState.Config` に読み込む。
  * FSM制御のための `/api/webrtc/reset`（状態リセット）および、設定永続化のための `/api/config/update`（テーマ/言語設定の更新とファイル保存）のエンドポイントを新設してハンドリングする。
  * `/api/status`（SSE）接続状況を監視し、クライアント接続数が 0 になると自動的に5秒のシャットダウンカウントダウンを開始する。

### (Variable) `activeSSEClients` (L22-22)
* **Description:** 現在アクティブな SSE 接続数を保持するカウンタ。

### (Function) `checkShutdown` (L26-49)
* **Description:** クライアント接続数が 0 になった際に、5秒の遅延シャットダウンタイマーを起動する。

### (Function) `cancelShutdown` (L51-60)
* **Description:** 新しい SSE クライアントが接続した際、予約されたシャットダウンタイマーを停止する。