---
source_file: "backend/dialog.go"
language: "Go"
description: "ncruces/zenity を用いたOS標準のファイルおよびディレクトリ選択ダイアログの制御モジュール。"
tags:
  - "@Core"
exports:
  - SelectLocalFiles
  - SelectLocalDirectory
imports: []
---

### `SelectLocalFiles` (L10-24)
* **Description:** OSのファイル選択ダイアログを起動し、複数選択されたファイルの絶対パスの配列を返す。キャンセルされた場合は空のリストを返す。
* **Returns:**
  * `[]string`: 選択されたファイルの絶対パス一覧
  * `error`: ダイアログ起動エラー

### `SelectLocalDirectory` (L26-41)
* **Description:** OSのフォルダ選択ダイアログを起動し、選択されたフォルダの絶対パスを返す。キャンセルされた場合は空文字を返す。
* **Returns:**
  * `string`: 選択されたフォルダの絶対パス
  * `error`: ダイアログ起動エラー