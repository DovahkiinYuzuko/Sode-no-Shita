---
source_file: "main.go"
language: "Go"
description: "Goアプリケーションの全体エントリーポイント。-port起動フラグを解析し、フロントエンドFSの埋め込み、backendサーバーの初期化、ブラウザ起動を制御する。"
tags:
  - "@Core"
exports:
  - main
imports:
  - "backend"
---

### `main` (L33-57)
* **Description:** アプリケーションのエントリーポイント。起動オプション `-port`（デフォルト8080）を読み込んでサーバーポートを決定し、静的ファイルFSをbackend.StartWebServerへ引き渡し、自動ブラウザ起動を呼び出す。