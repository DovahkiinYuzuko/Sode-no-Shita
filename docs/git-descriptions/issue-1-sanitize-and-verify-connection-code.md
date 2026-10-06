# issue-1-sanitize-and-verify-connection-code
## Overview
Describe the purpose of this branch here.
--- START GIT LOG ---

### `c2aa6f7`
- **Date:** 2026-10-07 00:45:10
- **Commit Message:** [test] E2Eテスト実行時にdata-testid属性を維持するようvite.config.tsを調整
- **Description:** プロダクションビルド時にbabelプラグインでdata-testidが削除されPlaywrightのセレクタがタイムアウトする問題を解決。VITE_KEEP_TEST_ID環境変数が指定された場合は属性削除をスキップするよう設定。
- **Constraint:** 通常のプロダクションビルドにおける軽量化（属性削除）の動作は変更せず維持すること。
- **Rejected:** Playwrightのテストセレクタをテキストベースに書き換える案（多言語対応やUI変更で壊れやすいため却下）。
- **Chosen:** vite.config.tsで環境変数による属性保持の分岐を導入。

### `ba69802`
- **Date:** 2026-10-07 00:17:08
- **Commit Message:** [docs] git log同期: issue-1-sanitize-and-verify-connection-code
- **Description:** sync-git-log.jsによるコミットログのドキュメント同期。

### `6404a4b`
- **Date:** 2026-10-07 00:16:45
- **Commit Message:** [fix] 接続コードの空白・改行サニタイズとチェックサム破損検知の実装およびi18n見直し
- **Description:** チャットツールでの共有時におけるMarkdown装飾やコピペによる末尾欠落・改行混入が原因で発生していたflate解凍エラーを解決。バックエンド（Go）に改行・空白の完全除去サニタイズおよびCRC32チェックサム検証を導入し、破損コードを早期検知可能にした。また、多言語（日英）のヘルプ手順を送信側/受信側へ表現統一し、フロントエンドは軽量な入力トリムのみを行う設計に整理。
- **Constraint:** フロントエンドに過剰なロジックを持たせず裏はGo。ブラウザはタダのUIのアーキテクチャ方針を維持すること。旧形式コードとの後方互換性を保つこと。
- **Rejected:** フロントエンド側でチェックサムの生成・検証や複雑なバリデーションを行う設計（UI責務の肥大化を防ぐため却下）。
- **Chosen:** バックエンド（utils.go）でBase64URLペイロード＋CRC32チェックサム（[Payload].[Checksum]）を管理し、DecompressSDPでサニタイズ・照合・旧形式フォールバックを完結させる構成を採用。
