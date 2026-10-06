# issue-2-file-based-signaling-exchange
## Overview
Describe the purpose of this branch here.

--- START GIT LOG ---

### `4b5a5fc`
- **Date:** 2026-10-07 02:18:49
- **Commit Message:** [feat] 接続コードのファイル書き出し・ドラッグ＆ドロップ読み込み機能の実装
- **Description:** チャットツールでの文字数制限やMarkdownによる記号欠落事故を完全に回避するため、接続コードをワンクリックで.sodeファイルとしてダウンロード保存し、相手側ではそのファイルをドラッグ＆ドロップまたはファイル選択で直接読み込める機能をフロントエンドに追加。
- **Constraint:** フロントエンドを肥大化させずブラウザ標準のBlob/FileReader APIのみで完結させること。データの検証・展開処理はバックエンドに任せること。
- **Rejected:** 専用のファイルアップロードAPIをバックエンドに新設する案（クライアントサイドのテキスト読み取りのみで十分に満たせるため却下）。
- **Chosen:** ブラウザ標準のBlobダウンロード機能とFileReaderによるドラッグ＆ドロップ/ファイル選択受付を採用。
