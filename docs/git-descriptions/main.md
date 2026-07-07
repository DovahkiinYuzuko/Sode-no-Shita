# main
## Overview
Describe the purpose of this branch here.
--- START GIT LOG ---

### `129740c`
- **Date:** 2026-07-08 06:43:43
- **Commit Message:** [feat] E2Eテスト自動化: data-testid追加とセレクタ堅牢化
- **Constraint:** nth()ベースのセレクタはヘッダーアイコンボタンにより意図しない要素を掴む危険があった
- **Rejected:** 既存のlocator('button').nth(1)セレクタの微修正（根本解決にならないため却下）
- **Chosen:** App.tsxに5箇所のdata-testid属性を追加し、e2e.spec.tsをgetByTestId()に全面移行。ダウンロード後のfs.existsSync()によるファイル実在確認も追加

### `94e6b6d`
- **Date:** 2026-07-08 06:12:46
- **Commit Message:** [style] ステータス行縦積み化・コピーボタンアイコン化
- **Constraint:** ステータス行が横一列に詰まりすぎて日本語テキストが読みにくかった。コピーボタンもテキスト付きで横に張り出しており、textareaが狭くなっていた。
- **Rejected:** flex-direction: rowのまま要素を間引く案（情報が欠落する）
- **Chosen:** ステータス行をflex-direction: columnの縦積みに変更し、コピーボタンはtextarea右上へabsolute配置のアイコンのみに絞る

### `dec8cea`
- **Date:** 2026-07-08 02:20:32
- **Commit Message:** [docs] E2Eファイル転送テストの仕様書を追加・更新
- **Description:** 実際のファイル選択・送受信・完了モーダルの検証を追加したe2e.spec.tsと、モックを用いたtransfer.spec.tsの仕様書を追加。
- **Constraint:** なし。
- **Rejected:** なし。
- **Chosen:** E2Eテストの実コードはgitignoreに従って追跡対象外とし、仕様書のみをコミット。

### `fc21501`
- **Date:** 2026-07-08 01:42:23
- **Commit Message:** [feat] frontendのモーダル・改行制御コンポーネント分離および各種仕様書の整備
- **Description:** frontend/src/App.tsx から各モーダルおよび日本語改行表示（BudouText）をコンポーネントに分離・リファクタリングし、それに合わせたTypeScript仕様書ファイルを新規作成・同期しました。
- **Constraint:** 新規追加するコンポーネント仕様書は docs/variables'n'functions/ 配下に [TypeScript]ファイル名.md の形式で配置します。また、変数や関数のヘッダには Heading 3 以下のマークダウンを使用します。
- **Rejected:** モーダルを App.tsx にインラインのまま残すことでコードの見通しが悪くなるため、今後の機能拡張を見据えて分離しました。
- **Chosen:** frontend/src/components 配下に各モーダルと改行コンポーネントを切り出し、App.tsx はそれらを読み込むだけのシンプルな構成にしました。

### `70be580`
- **Date:** 2026-07-07 22:07:45
- **Commit Message:** [cleanup] 自動テスト用ファイルおよび不要な依存関係の削除
- **Description:** None

### `ce53707`
- **Date:** 2026-07-07 22:06:25
- **Commit Message:** [docs] debug-modal-playwright.md をマージ元の独自コミット履歴のみに整理
- **Description:** None

### `d7cb3f4`
- **Date:** 2026-07-07 22:05:21
- **Commit Message:** [docs] main.md の同期更新
- **Description:** None

### `42b9ed4`
- **Date:** 2026-07-07 22:05:14
- **Commit Message:** [docs] debug-modal-playwright.md にマージ前のコミット履歴を同期
- **Description:** None

### `755d47f`
- **Date:** 2026-07-07 22:03:14
- **Commit Message:** [feat] ボタンのCSSアニメーション追加およびダイアログ制御、Playwright依存関係のコミット
- **Description:** None

### `9696d46`
- **Date:** 2026-07-07 22:03:06
- **Commit Message:** [fix] 完了リセットAPIの追加とシーケンス番号比較の廃止によるダウンロード完了モーダル表示バグの修正
- **Description:** None

### `2fbfe8d`
- **Date:** 2026-07-07 13:34:12
- **Commit Message:** [docs] git-descriptions/main.md にダウンロード完了修正のコミットログを同期
- **Description:** None

### `c1e8065`
- **Date:** 2026-07-07 13:32:51
- **Commit Message:** [fix] ダウンロード完了モーダルが表示されない不具合を修正
- **Description:** 受信側のダウンロード完了モーダルが表示されないバグを修正した。
ファイル名の文字列比較（prevCompletedFile）による差分検知方式を廃止し、
単調増加カウンタ TransferEventSeq による検知方式に移行した。
- **Constraint:** SSEポーリング間隔（500ms）内に start→end が完結する場合、
中間の空文字状態がフロントに届かないレースコンディションが存在する。
また、同名ファイルを連続受信する場合、文字列比較では差分が生じないため
モーダルが発火しない構造的欠陥があった。
- **Rejected:** - タイムスタンプ方式（CompletedAt int64）: Unix ナノ秒だが同一ナノ秒での衝突リスクがわずかに残る
- prevCompletedFile の初期値 null 化: 初回のみの対症療法であり根本解決にならない
- **Chosen:** - TransferEventSeq int フィールドを GlobalState に追加
- case end ハンドラでインクリメント
- フロントの検知条件を nextEventSeq !== prevEventSeq に変更
これにより同名ファイル連続受信・レースコンディション両方を同時解消できる

### `a2b941f`
- **Date:** 2026-07-07 13:20:10
- **Commit Message:** [fix]わからん
- **Description:** None

### `024ee28`
- **Date:** 2026-07-07 12:51:13
- **Commit Message:** [fix] P2P接続確立後に送信側で新規にファイルを選択した際、即座に受信側へファイルリストが同期されない不具合の修正
- **Description:** None

### `5f1c5da`
- **Date:** 2026-07-07 12:46:23
- **Commit Message:** [style] ステータスバッジの改行崩れ防止、接続確立後の送信/受信パネルの動的活性・強調表示の実装
- **Description:** None

### `3583daa`
- **Date:** 2026-07-07 12:41:13
- **Commit Message:** [feat] i18nの動的インポート化、BudouXによる日本語改行最適化、送受信ガイドの追加
- **Description:** None

### `fb690a6`
- **Date:** 2026-07-07 12:10:58
- **Commit Message:** [perf] lucide-reactを廃止してローカルSVGアイコン(icons.tsx)に移行、ビルドロックと肥大化問題を解決
- **Description:** None

### `053a9b0`
- **Date:** 2026-07-07 12:07:12
- **Commit Message:** [fix] ビルドスクリプトの cd エイリアスを Set-Location に変更して警告を解消
- **Description:** None

### `ed0297c`
- **Date:** 2026-07-07 12:04:02
- **Commit Message:** [feat] 接続切れ検知時の遅延自動シャットダウン機能の実装（ゾンビプロセス防止）
- **Description:** None

### `613c480`
- **Date:** 2026-07-07 11:39:04
- **Commit Message:** [feat] プレミアムUI刷新、多言語対応、設定のバックエンド保存管理の実装
- **Description:** None

### `8e2cb8e`
- **Date:** 2026-07-07 11:18:41
- **Commit Message:** [fix] WebRTCの型ミスマッチ修正およびサーバー仕様書の整合性修正
- **Description:** None

### `1168b40`
- **Date:** 2026-07-07 11:16:29
- **Commit Message:** [feat] FSM（有限状態機械）によるWebRTC接続状態管理の刷新と詳細コンソールログの実装
- **Description:** None

### `443c828`
- **Date:** 2026-07-07 11:09:11
- **Commit Message:** [fix] 仮想NICの除外とタイムアウトフォールバックによるWebRTC接続フリーズの解消
- **Description:** None

### `bfe6155`
- **Date:** 2026-07-07 11:03:03
- **Commit Message:** fix: ICE収集完了待機の差し戻しとゾンビプロセスの対応
- **Description:** 接続の完全性を維持するため、タイムアウトによるICE収集の打ち切り処理を差し戻し、標準の <-gatherComplete を待つ実装に戻しました。また、起動ポート競合の主要因であるバックグラウンドプロセスを停止させました。
- **Constraint:** 手動シグナリングで完全なSDPをコピペするため、すべてのICE候補の収集完了を保証する必要があります。
- **Rejected:** ハング回避のタイムアウト処理は中途半端なSDPを返すリスクがあったため却下し、プロセスの強制終了を優先しました。
- **Chosen:** webrtc.go を <-gatherComplete に差し戻しました。

### `ffc518d`
- **Date:** 2026-07-07 11:00:58
- **Commit Message:** fix: STUNサーバーによるICE収集のハングを回避するタイムアウト処理の追加
- **Description:** ICEServer（STUN）への接続がファイアウォール等の環境要因でブロックされた場合に、SDP生成時の ICE gathering 処理が無期限に待機（ハング）してしまう問題を修正するため、3秒のタイムアウト付き select 待機を導入しました。
- **Constraint:** 最大3秒間で ICE 候補収集を切り上げ、その時点の SDP を返すことで接続確立を続行可能にします。
- **Rejected:** STUN サーバーそのものを外す方法も検討しましたが、インターネット経由の通信ができなくなるため、タイムアウトを設ける設計を採用しました。
- **Chosen:** webrtc.go 内の webrtc.GatheringCompletePromise の読み込み待機に time.After(3 * time.Second) を併用しました。

### `4b707b0`
- **Date:** 2026-07-07 10:57:57
- **Commit Message:** feat: 起動ポートを変更できる -port オプションの追加
- **Description:** 1台のPCで送信側と受信側の2つのインスタンスを起動してセルフテストを行えるようにするため、コマンドライン引数 -port でWebサーバーの起動ポートを変更可能にしました。
- **Constraint:** flag パッケージによる標準コマンドライン引数解析を利用しています。
- **Rejected:** ポートが競合した際に自動で空きポートを探す仕様も検討しましたが、手動テスト時にポート番号を明示的に把握できた方がコントロールしやすいため、明示的に引数で渡す仕様を選択しました。
- **Chosen:** main.go に -port フラグを追加し、デフォルト値を 8080 に設定しました。

### `011ef53`
- **Date:** 2026-07-07 10:55:39
- **Commit Message:** fix: TypeScriptコンパイルエラー（未使用変数）の修正
- **Description:** Vite/Reactのビルド時に noUnusedLocals ルールによって引っかかっていた、onClick ハンドラ内の未使用変数 'e' を削除し、ビルドを成功させました。
- **Constraint:** TypeScriptの strict ルールおよび未使用変数チェックに準拠したコードを書く必要があります。
- **Rejected:** TypeScriptの設定（tsconfig.json）を書き換えてチェックを無効化することを検討しましたが、コード品質を維持するためコード側を修正しました。
- **Chosen:** App.tsx のハンドラ定義を () => に修正しました。

### `b2ff060`
- **Date:** 2026-07-07 10:55:01
- **Commit Message:** feat: UIの実装とCSS Modulesの適用
- **Description:** 「ユズコ専用ダーク」と「GitHub人気」のトグル切替をサポートしたReact UIを実装し、CSS Modules（App.module.css）でスタイルをカプセル化しました。また、Goサーバーにダウンロード指示用APIを追加しました。
- **Constraint:** UI専用の配色設定（ユズコ専用ダーク：#111111ベース、GitHub人気：#ffffffベース）およびDESIGN.mdに基づく日本語タイポグラフィの行間・字間を適用しています。
- **Rejected:** ブラウザにファイルを直接ロードしてWebSocketでチャンク送信する構成を検討しましたが、メモリ効率の観点からGo側でOSダイアログを開き直接ファイルをロードする方式を採用しました。
- **Chosen:** frontend/src/App.tsx および backend/server.go のAPIを実装・調整しました。

### `3c06c2e`
- **Date:** 2026-07-07 10:54:11
- **Commit Message:** feat: Vite/Reactフロントエンドプロジェクトの初期化
- **Description:** Viteを利用して React + TypeScript + Vite プロジェクトを frontend/ フォルダ内に初期化し、npmパッケージをインストールしました。
- **Constraint:** node_modules などの依存関係パッケージや dist/ ビルド成果物は git に追加されません。
- **Rejected:** frontend/ フォルダがすでに空でない状態で初期化しようとしてエラーが発生したため、一度 frontend/ フォルダを綺麗に削除してから再初期化しました。
- **Chosen:** frontend/ 配下にViteのデフォルト構成を初期化しました。

### `608fb28`
- **Date:** 2026-07-07 10:53:03
- **Commit Message:** fix: 仕様書テンプレートの復元および webrtc の警告修正
- **Description:** .gitignores/袖の下のファイル.gitignore から仕様書を誤って除外していた設定を削除し、mushiを実行しました。また、webrtc.go 内の未使用引数の削除や select の単純化を行いました。
- **Constraint:** 袖の下のファイル仕様書.md は git の管理対象外とします。
- **Rejected:** 仕様書を git にコミットしようとしましたが、ユズコの「載せるつもり無い」という仕様に合わせて差し戻しました。
- **Chosen:** .gitignores テンプレートから仕様書を除外して再生成し、webrtc.go の静的解析エラーを修正しました。

### `5dd6923`
- **Date:** 2026-07-07 10:52:10
- **Commit Message:** feat: Goパッケージ構成の整理とルート main.go の追加
- **Description:** go:embed の制約に対応するため、エントリーポイント main.go をプロジェクトルートに戻し、実装モジュール（webrtc, dialog, server, utils）を backend パッケージとして完全に整理しました。
- **Constraint:** go:embed は親パスを参照できないため、埋め込み対象と同階層のルートに main.go を配置する必要があります。
- **Rejected:** Goモジュール全体を backend/ に閉じ込めることを試みましたが、埋め込み参照エラーが発生したため却下しました。
- **Chosen:** main.go はルートに配置し、その他のロジックは backend/ 以下に分離しました。

### `60264d4`
- **Date:** 2026-07-07 10:43:52
- **Commit Message:** feat: HTTP APIおよびSSE進捗通知サーバーの実装
- **Description:** go:embed によるフロントエンド配信、WebRTCシグナリング、OSダイアログ呼び出し用のHTTP APIエンドポイント、およびSSEによるリアルタイム進捗通知サーバーを実装しました。
- **Constraint:** Goの go:embed における親ディレクトリ参照制限を回避するため、エントリーポイント main.go はプロジェクトルートに配置し、実装コードは backend/ パッケージに隔離しています。
- **Rejected:** すべてのGoコードを backend/ フォルダに収めることを試みましたが、Reactのビルドファイルを go:embed する際に親パス指定エラーになるため、main.go のみをルートに配置するアプローチを選択しました。
- **Chosen:** backend/server.go にWebサーバーロジックを実装し、ルートの main.go から引き渡す形で起動を統合しました。

### `edcffbd`
- **Date:** 2026-07-07 10:42:10
- **Commit Message:** feat: WebRTC通信およびハイブリッドファイル転送ロジックの実装
- **Description:** pion/webrtc を利用し、P2Pピア接続、シグナリング、個別ファイルストリーミング転送、および io.Pipe/archive/zip によるオンザフライ動的ZIPストリーミング転送を実装しました。
- **Constraint:** 大容量ファイルの転送時にメモリを圧迫しないよう、16KB〜64KBのチャンク転送とバッファ監視によるフロー制御を設けています。
- **Rejected:** メモリ上やディスク上に一時ZIPファイルを保存してから送信することを検討しましたが、ディスク領域とメモリの浪費を防ぐため、io.Pipeを用いたオンザフライZIP送信を採用しました。
- **Chosen:** backend/webrtc.go として実装を新規追加しました。

### `5af95ed`
- **Date:** 2026-07-07 10:41:00
- **Commit Message:** feat: OSダイアログ連携モジュール（dialog.go）の実装
- **Description:** ncruces/zenity を利用し、OSの標準ファイルダイアログから複数ファイルやディレクトリを選択して絶対パスを返す関数を実装しました。
- **Constraint:** UI側のセキュリティ制限を回避するため、ファイルのパス選択はGo側でOSダイアログを起動して行います。
- **Rejected:** React側でブラウザのファイル選択を使おうとしましたが、絶対パスが取得できずGo側で直接ファイルを読めなくなるため却下しました。
- **Chosen:** backend/dialog.go としてダイアログ機能を切り出して実装しました。

### `3caf6c4`
- **Date:** 2026-07-07 10:40:21
- **Commit Message:** feat: SDPの圧縮・展開ロジックの実装とテスト追加
- **Description:** WebRTCのSDPテキストをzlibで圧縮してBase64URL化する CompressSDP および DecompressSDP 関数を実装し、テストをパスさせました。
- **Constraint:** Goのソースコードはすべて backend/ ディレクトリ配下に配置します。
- **Rejected:** Goファイルをプロジェクトルートに配置することを検討しましたが、関心の分離のために backend/ フォルダへ隔離しました。
- **Chosen:** backend/main.go に圧縮ユーティリティ関数を実装しました。

### `4c1062b`
- **Date:** 2026-07-07 10:32:55
- **Commit Message:** docs: tag-index.md の追加
- **Description:** ドキュメントフォルダの作成およびタグインデックスファイルの追加を行いました。
- **Constraint:** .gitignoreファイルの直接編集および自動生成テンプレートの勝手な変更は禁止されています。
- **Rejected:** GoやReactのファイルをgit管理するため自動生成テンプレートを一度上書きしてmushiを実行しましたが、gitignoreの管理ルール違反にあたるため差し戻しました。
- **Chosen:** ユーザー側で.gitignores下の個別テンプレートを整理・更新いただいたため、docs/ディレクトリおよびtag-index.mdのみをコミットします。

### `44275bc`
- **Date:** 2026-07-07 10:22:48
- **Commit Message:** docs: 初期コミットとドキュメント構成の作成
- **Description:** None
