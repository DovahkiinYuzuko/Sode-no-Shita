---
source_file: "frontend/tests/e2e.spec.ts"
language: "TypeScript"
description: "WebRTCのP2P接続、ハンドシェイク状態遷移、および実際のファイル送受信フロー（ダウンロード完了モーダル表示・ファイル実在確認・モーダルクローズまで）を検証するPlaywright E2Eテスト。"
tags:
  - "@UI"
exports: []
imports: []
---

## 概要

WebRTC接続の確立プロセス（Offer生成、Answer生成、接続完了）が正常に行われるかを実際のブラウザコンテキストを用いて検証するE2Eテスト。
`data-testid` 属性を使用した堅牢なセレクタを採用しており、DOMの順序変更に影響されない。

## テストケース

### WebRTC P2P Handshake and Connection
* **Description:** 送信側と受信側のブラウザを起動し、シグナリングコードA/Bのハンドシェイクフローを経て、双方の接続ステータスが `CONNECTED` になることを確認し、さらに実際のファイル共有・転送、ダウンロード完了モーダルの表示、ファイルのディスク実在確認（`fs.existsSync`）、モーダルのクローズまでの一連のフルフローを検証する。

## セレクタ設計

| data-testid | 要素 | 出現するFSM状態 |
|---|---|---|
| `code-input` | 接続コード入力 textarea | IDLE, WAITING_FOR_ANSWER |
| `offer-code` | Offerコード表示 textarea (readonly) | WAITING_FOR_ANSWER |
| `answer-code` | Answerコード表示 textarea (readonly) | CONNECTING |
| `btn-create-answer` | コードAを解析してコードBを生成ボタン | IDLE |
| `btn-connect` | 接続確立ボタン | WAITING_FOR_ANSWER |

## 検証項目

* WebRTC ハンドシェイクの完了（送受信双方で `CONNECTED` 表示）
* 送信側でのファイル選択（`SODENOSHITA_TEST_FILES` 環境変数によるダイアログバイパス）
* 受信側での保存先設定（`SODENOSHITA_TEST_SAVEDIR` 環境変数によるダイアログバイパス）
* リモートファイルリストの表示
* ダウンロード完了モーダルの表示
* ダウンロードファイルのディスク実在確認（`fs.existsSync(path.join(recvDir, 'text.txt'))`）
