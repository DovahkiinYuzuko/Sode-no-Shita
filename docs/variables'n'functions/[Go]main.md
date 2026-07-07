---
source_file: "main.go"
language: "Go"
description: "Goアプリケーションの全体エントリーポイント。フロントエンドFSの埋め込みとbackendサーバーの初期化、ブラウザ起動を制御する。"
tags:
  - "@Core"
exports:
  - main
imports:
  - "backend"
---

### `main` (L32-54)
* **Description:** アプリケーションのエントリーポイント。静的ファイルFSをbackend.StartWebServerへ引き渡し、自動ブラウザ起動を呼び出す。