---
source_file: "backend/utils.go"
language: "Go"
description: "SDP情報の圧縮・展開や、その他の共通ヘルパー関数を提供するユーティリティモジュール。"
tags:
  - "@Core"
exports:
  - CompressSDP
  - DecompressSDP
imports: []
---

### `CompressSDP` (L10-22)
* **Description:** SDPの文字列をzlibで圧縮し、Base64URLエンコードしてコンパクトな接続コードを生成する。
* **Arguments:**
  * `sdp` (string): SDPテキスト
* **Returns:**
  * `string`: 接続コード
  * `error`: 圧縮エラー

### `DecompressSDP` (L24-40)
* **Description:** 接続コードをデコードし、zlibで展開して元のSDPテキストを復元する。
* **Arguments:**
  * `code` (string): 接続コード
* **Returns:**
  * `string`: SDPテキスト
  * `error`: 展開エラー