---
source_file: "backend/fsm.go"
language: "Go"
description: "P2Pファイル共有接続のライフサイクル管理のための有限状態機械(FSM)定義と状態遷移制御。"
tags:
  - "@Core"
exports:
  - FSMState
  - TransitionTo
  - StateIdle
  - StateGeneratingOffer
  - StateWaitingForAnswer
  - StateGeneratingAnswer
  - StateConnecting
  - StateConnected
  - StateFailed
imports: []
---

## 依存関係 (Dependencies)

```mermaid
graph TD
    fsm.go["backend/fsm.go"]
```

## 各定義の仕様

### `FSMState` (L8-8)
* **Description:** アプリケーションの接続ライフサイクルを示す状態型（文字列）。

### `StateIdle` (L11-11)
* **Description:** 定数。初期状態（未接続）。

### `StateGeneratingOffer` (L12-12)
* **Description:** 定数。待機側（Offer側）でOfferの作成とICEの収集中。

### `StateWaitingForAnswer` (L13-13)
* **Description:** 定数。待機側（Offer側）でOfferコードの生成が完了し、対向からのAnswerコード入力を待っている状態。

### `StateGeneratingAnswer` (L14-14)
* **Description:** 定数。接続側（Answer側）でOfferを適用し、Answerの作成とICEの収集中。

### `StateConnecting` (L15-15)
* **Description:** 定数。双方のSDP適用が完了し、P2Pの疎通確認（DTLSハンドシェイク）を行っている状態。

### `StateConnected` (L16-16)
* **Description:** 定数。WebRTC Data Channelがオープンし、P2P通信が確立した状態。

### `StateFailed` (L17-17)
* **Description:** 定数。接続プロセスでエラーまたはタイムアウトが発生した状態。

### (Function) `TransitionTo` (L32-78)
* **Description:** グローバルな接続状態を現在の状態から指定された次の状態へ安全に遷移させる。
* **Arguments:**
  * `next` (`FSMState`): 遷移先の状態
* **Returns:**
  * `error`: 遷移規則（`validTransitions`）に違反した場合のエラー
* **Details:**
  * スレッドセーフに `GlobalState.FSMState` の値をチェックし、遷移可能リストにない場合はエラーを返す。
  * 状態遷移が成功した場合はコンソールに `[FSM] Transition: CURRENT -> NEXT` というログを出力する。
  * 従来のUIコードとの互換性のために、遷移先に応じて `GlobalState.ConnState` （`"disconnected"`, `"connecting"`, `"connected"`）も自動的に同期更新する。
  * `StateIdle` および `StateFailed` への遷移（強制リセットや切断）は常に許可する。