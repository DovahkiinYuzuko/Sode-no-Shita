---
source_file: "frontend/tests/transfer.spec.ts"
language: "TypeScript"
description: "EventSource(SSE)とAPIをモックし、ファイル転送中の進捗表示や転送完了モーダルの表示、リセットフローを検証するPlaywrightテスト。"
tags:
  - "@UI"
exports: []
imports: []
---

## 概要

EventSource(SSE)をモック化して状態を擬似的に遷移させ、フロントエンドがステートに応じて正しいUI（ファイルリスト、進捗率、完了モーダルなど）を表示するか、および完了モーダルを閉じたときにリセットAPIが呼ばれるかを検証するテスト。

## テストケース

### file transfer modal and reset flow
* **Description:** SSE status エンドポイントからのイベントをモックし、ダウンロード完了モーダルの描画から、モーダルを閉じる際の `/api/webrtc/clear-completed` へのリクエストが正しく発生するかを確認する。
