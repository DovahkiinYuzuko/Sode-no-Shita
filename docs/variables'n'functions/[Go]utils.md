---
source_file: "backend/utils.go"
language: "Go"
type: "Module"
description: "SDP情報の圧縮・展開、空白サニタイズ、チェックサム検証などの共通ヘルパー関数を提供するユーティリティモジュール。"
tags:
  - "@Core"
related:
  exports:
    - CompressSDP
    - DecompressSDP
  imports: []
---

# [Go]utils

## 概要
WebRTCのシグナリングで交換するSDP文字列の圧縮・展開、改行や空白の除去サニタイズ、および破損検証用のチェックサム管理を行うユーティリティ関数群。

## エクスポート関数

### (Function) `CompressSDP` (L16-34)
* **説明:** SDPの文字列をzlibで圧縮し、CRC32チェックサムを付与したBase64URL文字列としてコンパクトな接続コードを生成する。
* **引数:**
  * `sdp` (`string`): SDPテキスト
* **返り値:**
  * `string`: 接続コード（`[Payload].[Checksum]` 形式）
  * `error`: 圧縮エラー

### (Function) `DecompressSDP` (L37-91)
* **説明:** 接続コードに含まれる改行や空白を自動サニタイズした上で、チェックサムを検証し、zlib展開して元のSDPテキストを復元する。チェックサムが存在しない旧形式コードも後方互換性として展開可能。
* **引数:**
  * `code` (`string`): 接続コード
* **返り値:**
  * `string`: 復元されたSDPテキスト
  * `error`: 展開エラーまたは破損エラー