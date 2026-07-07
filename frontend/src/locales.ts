export interface Translation {
	title: string;
	themeLight: string;
	themeDark: string;
	p2pEstablish: string;
	statusLabel: string;
	statusConnected: string;
	statusConnecting: string;
	statusDisconnected: string;
	statusTitle: string;
	btnCreateOffer: string;
	btnCreateAnswer: string;
	btnConnect: string;
	btnReset: string;
	labelOffer: string;
	labelAnswer: string;
	placeholderCode: string;
	shareDownload: string;
	sendTitle: string;
	btnSelectSendFiles: string;
	labelSelectedFiles: string;
	recvTitle: string;
	btnSelectSaveDir: string;
	labelSaveDir: string;
	fileListTitle: string;
	btnDownloadAll: string;
	sending: string;
	receiving: string;
	waitingFiles: string;
	sentListMsg: string;
	copySuccessOffer: string;
	copySuccessAnswer: string;
	btnCopy: string;
	generatingOffer: string;
	generatingAnswer: string;
	connectingMsg: string;
	settingsTitle: string;
	selectLang: string;
	selectTheme: string;
	btnHelp: string;
	helpTitle: string;
	helpSteps: string[];
}

export const locales: Record<string, Translation> = {
	ja: {
		title: "袖の下のファイル",
		themeLight: "ライトモード",
		themeDark: "ダークモード",
		p2pEstablish: "1. P2P接続の確立",
		statusLabel: "現在の接続ステータス",
		statusConnected: "接続完了",
		statusConnecting: "接続中...",
		statusDisconnected: "未接続",
		statusTitle: "状態",
		btnCreateOffer: "接続コードAを生成 (待機側)",
		btnCreateAnswer: "コードAを解析してコードBを生成 (接続側)",
		btnConnect: "コードBを入力して接続確立",
		btnReset: "接続をリセットして初期状態に戻す",
		labelOffer: "生成された接続コードA (コピーして相手に共有)",
		labelAnswer: "生成された接続コードB (待機側に送り返す)",
		placeholderCode: "ここに接続コードを入力してください",
		shareDownload: "2. ファイルの共有とダウンロード",
		sendTitle: "送信する",
		btnSelectSendFiles: "送信ファイルを選択 (OSダイアログ起動)",
		labelSelectedFiles: "選択されたファイル",
		recvTitle: "受信する",
		btnSelectSaveDir: "保存先フォルダを指定 (OSダイアログ起動)",
		labelSaveDir: "保存先",
		fileListTitle: "共有可能なファイル一覧",
		btnDownloadAll: "まとめてダウンロード (ZIP)",
		sending: "送信中",
		receiving: "受信中",
		waitingFiles: "送信側がファイルを選択するのを待っています。",
		sentListMsg: "対向へファイルリストを送信しました。",
		copySuccessOffer: "接続コードAをクリップボードにコピーしました！",
		copySuccessAnswer: "接続コードBをクリップボードにコピーしました！",
		btnCopy: "コピー",
		generatingOffer: "接続コードA（Offer）を生成中...（最大3秒）",
		generatingAnswer: "接続コードB（Answer）を生成中...（最大3秒）",
		connectingMsg: "接続中... P2P接続の確立を待っています...",
		settingsTitle: "設定",
		selectLang: "表示言語",
		selectTheme: "テーマ",
		btnHelp: "使い方説明",
		helpTitle: "使い方ガイド",
		helpSteps: [
			"【待機側】が「接続コードAを生成」をクリックし、コードをコピーして相手に送ります。",
			"【接続側】が受け取ったコードAを貼り付け、「コードAを解析してコードBを生成」をクリックします。",
			"【接続側】は生成されたコードBをコピーし、待機側に送り返します。",
			"【待機側】はコードBを入力欄に貼り付け、「コードBを入力して接続確立」をクリックします。",
			"P2P接続が確立されると、送信ファイルを選択し、ダウンロードできるようになります。"
		]
	},
	en: {
		title: "Sode no Shita File",
		themeLight: "Light Mode",
		themeDark: "Dark Mode",
		p2pEstablish: "1. Establish P2P Connection",
		statusLabel: "Current Connection Status",
		statusConnected: "Connected",
		statusConnecting: "Connecting...",
		statusDisconnected: "Disconnected",
		statusTitle: "Status",
		btnCreateOffer: "Generate Connection Code A (Offer)",
		btnCreateAnswer: "Parse Code A & Generate Code B (Answer)",
		btnConnect: "Enter Code B & Connect",
		btnReset: "Reset Connection",
		labelOffer: "Generated Connection Code A (Copy & share with partner)",
		labelAnswer: "Generated Connection Code B (Send back to partner)",
		placeholderCode: "Enter connection code here",
		shareDownload: "2. File Sharing & Download",
		sendTitle: "Send",
		btnSelectSendFiles: "Select files to send (OS Dialog)",
		labelSelectedFiles: "Selected Files",
		recvTitle: "Receive",
		btnSelectSaveDir: "Select destination folder (OS Dialog)",
		labelSaveDir: "Destination",
		fileListTitle: "Shared File List",
		btnDownloadAll: "Download All (ZIP)",
		sending: "Sending",
		receiving: "Receiving",
		waitingFiles: "Waiting for the sender to select files.",
		sentListMsg: "Sent the list of files to the peer.",
		copySuccessOffer: "Connection Code A copied to clipboard!",
		copySuccessAnswer: "Connection Code B copied to clipboard!",
		btnCopy: "Copy",
		generatingOffer: "Generating Connection Code A... (Max 3s)",
		generatingAnswer: "Generating Connection Code B... (Max 3s)",
		connectingMsg: "Connecting... Waiting for P2P connection...",
		settingsTitle: "Settings",
		selectLang: "Language",
		selectTheme: "Theme",
		btnHelp: "How to Use",
		helpTitle: "User Guide",
		helpSteps: [
			"[Waiting Side] Click 'Generate Connection Code A', copy it, and send it to your partner.",
			"[Connecting Side] Paste Code A and click 'Parse Code A & Generate Code B'.",
			"[Connecting Side] Copy the generated Code B and send it back to the waiting side.",
			"[Waiting Side] Paste Code B and click 'Enter Code B & Connect'.",
			"Once connected directly, you can select files and download them securely."
		]
	}
};
