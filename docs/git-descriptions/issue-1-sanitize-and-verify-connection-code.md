# issue-1-sanitize-and-verify-connection-code
## Overview
Describe the purpose of this branch here.

--- START GIT LOG ---

### `6404a4b`
- **Date:** 2026-10-07 00:16:45
- **Commit Message:** [fix] 接続コードの空白・改行サニタイズとチェックサム破損検知の実装およびi18n見直し
- **Description:** チャットツールでの共有時におけるMarkdown装飾やコピペによる末尾欠落・改行混入が原因で発生していたflate解凍エラーを解決。バックエンド（Go）に改行・空白の完全除去サニタイズおよびCRC32チェックサム検証を導入し、破損コードを早期検知可能にした。また、多言語（日英）のヘルプ手順を送信側/受信側へ表現統一し、フロントエンドは軽量な入力トリムのみを行う設計に整理。
- **Constraint:** フロントエンドに過剰なロジックを持たせず裏はGo。ブラウザはタダのUIのアーキテクチャ方針を維持すること。旧形式コードとの後方互換性を保つこと。
- **Rejected:** フロントエンド側でチェックサムの生成・検証や複雑なバリデーションを行う設計（UI責務の肥大化を防ぐため却下）。
- **Chosen:** バックエンド（utils.go）でBase64URLペイロード＋CRC32チェックサム（[Payload].[Checksum]）を管理し、DecompressSDPでサニタイズ・照合・旧形式フォールバックを完結させる構成を採用。
