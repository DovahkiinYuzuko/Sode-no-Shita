---
source_file: "frontend/tests/e2e.spec.ts"
language: "TypeScript"
description: "WebRTCのP2P接続、ハンドシェイク状態遷移、および実際のファイル送受信フロー（ダウンロード完了モーダル表示とクローズまで）を検証するPlaywright E2Eテスト。"
tags:
  - "@UI"
exports: []
imports: []
---

## 概要

WebRTC接続の確立プロセス（Offer生成、Answer生成、接続完了）が正常に行われるかを実際のブラウザコンテキストを用いて検証するE2Eテスト。

## テストケース

### WebRTC P2P Handshake and Connection
* **Description:** 送信側と受信側のブラウザを起動し、シグナリングコードA/Bのハンドシェイクフローを経て、双方の接続ステータスが `CONNECTED` になることを確認し、さらに実際のファイル共有・転送、ダウンロード完了モーダルの表示、モーダルのクローズまでの一連のフルフローを検証する。
