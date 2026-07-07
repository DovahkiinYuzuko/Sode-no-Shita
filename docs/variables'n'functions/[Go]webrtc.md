---
source_file: "backend/webrtc.go"
language: "Go"
description: "pion/webrtc を用いたWebRTC通信制御、手動シグナリング、およびData Channelを介したハイブリッドファイル転送制御。"
tags:
  - "@Core"
exports:
  - InitWebRTCPeer
  - StartFileTransfer
  - StartZipTransfer
  - GlobalState
imports:
  - "backend/dialog.go"
---

### `GlobalState` (L47-51)
* **Description:** アプリケーション全体の転送ステータスや選択ファイルを保持するグローバル共有構造体。

### `InitWebRTCPeer` (L72-149)
* **Description:** WebRTCピア接続（pion/webrtc）を初期化し、接続コードを生成する。あるいは対向の接続コードを解析して接続する。
* **Arguments:**
  * `isOffer` (bool): 接続を待つ側（オファー側）かどうか

### `StartFileTransfer`
* **Description:** 指定された単一ファイルをData Channel経由でチャンク分割（16KB〜64KB）して送信する。
* **Arguments:**
  * `filePath` (string): 送信ファイルの絶対パス

### `StartZipTransfer`
* **Description:** 選択された複数ファイルをメモリ上で動的（オンザフライ）にZIP化しながら、Data ChannelへZIPストリームとして送信する。
* **Arguments:**
  * `filePaths` ([]string): 送信ファイルの絶対パスリスト