import { useState, useEffect } from 'react';
import styles from './App.module.css';

interface FileInfo {
	name: string;
	size: int64;
}

type int64 = number;

export default function App() {
	const [theme, setTheme] = useState<'light' | 'dark'>('dark');
	const [connState, setConnState] = useState<string>('disconnected');
	const [role, setRole] = useState<string>('sender');
	const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
	const [remoteFiles, setRemoteFiles] = useState<FileInfo[]>([]);
	const [saveDir, setSaveDir] = useState<string>('');
	const [transferFile, setTransferFile] = useState<string>('');
	const [bytesSent, setBytesSent] = useState<number>(0);
	const [bytesReceived, setBytesReceived] = useState<number>(0);
	const [totalBytes, setTotalBytes] = useState<number>(0);
	const [speed, setSpeed] = useState<number>(0);
	const [isTransferring, setIsTransferring] = useState<boolean>(false);

	const [generatedCode, setGeneratedCode] = useState<string>('');
	const [inputCode, setInputCode] = useState<string>('');
	const [answerCode, setAnswerCode] = useState<string>('');
	const [alertMsg, setAlertMsg] = useState<string>('');

	// テーマの切り替え
	const toggleTheme = () => {
		const nextTheme = theme === 'light' ? 'dark' : 'light';
		setTheme(nextTheme);
	};

	// GoのSSEステータス監視
	useEffect(() => {
		const eventSource = new EventSource('/api/status');

		eventSource.onmessage = (event) => {
			try {
				const state = JSON.parse(event.data);
				setConnState(state.connState);
				setRole(state.role);
				setSelectedFiles(state.selectedFiles || []);
				setRemoteFiles(state.remoteFiles || []);
				setSaveDir(state.saveDir || '');
				setTransferFile(state.transferFile || '');
				setBytesSent(state.bytesSent || 0);
				setBytesReceived(state.bytesReceived || 0);
				setTotalBytes(state.totalBytes || 0);
				setSpeed(state.speed || 0);
				setIsTransferring(state.isTransferring || false);
			} catch (e) {
				console.error('SSE JSON parse error:', e);
			}
		};

		eventSource.onerror = (err) => {
			console.error('SSE Error:', err);
		};

		return () => {
			eventSource.close();
		};
	}, []);

	// API呼び出し：ファイル選択
	const selectFiles = async () => {
		try {
			const res = await fetch('/api/dialog/file', { method: 'POST' });
			const data = await res.json();
			if (data.error) {
				setAlertMsg(`エラー: ${data.error}`);
			} else {
				setSelectedFiles(data.files || []);
			}
		} catch (e) {
			setAlertMsg('ファイルの選択に失敗しました');
		}
	};

	// API呼び出し：保存先フォルダ選択
	const selectSaveDir = async () => {
		try {
			const res = await fetch('/api/dialog/dir', { method: 'POST' });
			const data = await res.json();
			if (data.error) {
				setAlertMsg(`エラー: ${data.error}`);
			} else {
				setSaveDir(data.dir || '');
			}
		} catch (e) {
			setAlertMsg('保存先フォルダの選択に失敗しました');
		}
	};

	// 接続コードA (Offer) の生成
	const createOffer = async () => {
		try {
			const res = await fetch('/api/webrtc/offer', { method: 'POST' });
			const data = await res.json();
			if (data.error) {
				setAlertMsg(`エラー: ${data.error}`);
			} else {
				setGeneratedCode(data.code);
			}
		} catch (e) {
			setAlertMsg('接続コードの生成に失敗しました');
		}
	};

	// 接続コードAを解析し、接続コードB (Answer) を生成
	const acceptOffer = async () => {
		if (!inputCode) {
			setAlertMsg('接続コードを入力してください');
			return;
		}
		try {
			const res = await fetch('/api/webrtc/answer', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code: inputCode }),
			});
			const data = await res.json();
			if (data.error) {
				setAlertMsg(`エラー: ${data.error}`);
			} else {
				setAnswerCode(data.code);
			}
		} catch (e) {
			setAlertMsg('コードの解析に失敗しました');
		}
	};

	// 接続コードBを入力し、接続を確立
	const connectAnswer = async () => {
		if (!inputCode) {
			setAlertMsg('接続コードを入力してください');
			return;
		}
		try {
			const res = await fetch('/api/webrtc/connect', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code: inputCode }),
			});
			const data = await res.json();
			if (data.error) {
				setAlertMsg(`エラー: ${data.error}`);
			} else {
				setAlertMsg('接続を登録しました。P2P接続完了を待っています...');
				setInputCode('');
			}
		} catch (e) {
			setAlertMsg('接続に失敗しました');
		}
	};

	// 個別ダウンロードの開始
	const downloadFile = async (name: string) => {
		try {
			const res = await fetch('/api/download/file', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name }),
			});
			const data = await res.json();
			if (data.error) {
				setAlertMsg(`エラー: ${data.error}`);
			}
		} catch (e) {
			setAlertMsg('ダウンロード開始に失敗しました');
		}
	};

	// まとめてダウンロードの開始
	const downloadAll = async () => {
		try {
			const res = await fetch('/api/download/all', { method: 'POST' });
			const data = await res.json();
			if (data.error) {
				setAlertMsg(`エラー: ${data.error}`);
			}
		} catch (e) {
			setAlertMsg('一括ダウンロード開始に失敗しました');
		}
	};

	const formatSize = (bytes: number) => {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const formatSpeed = (bytesPerSec: number) => {
		return `${formatSize(bytesPerSec)}/s`;
	};

	// 進行状況の計算
	const currentBytes = role === 'sender' ? bytesSent : bytesReceived;
	const progressPercent = totalBytes > 0 ? Math.min(100, (currentBytes / totalBytes) * 100) : 0;

	return (
		<div className={styles.app} data-theme={theme}>
			<div className={styles.container}>
				<header className={styles.header}>
					<h1 className={styles.title}>袖の下のファイル</h1>
					<button className={styles.themeToggle} onClick={toggleTheme}>
						{theme === 'light' ? 'ダークモード' : 'ライトモード'}
					</button>
				</header>

				{alertMsg && (
					<div className={styles.panel} style={{ borderColor: 'var(--accent)', color: 'var(--accent)', marginBottom: '16px' }}>
						<div style={{ display: 'flex', justifyContent: 'space-between' }}>
							<span>{alertMsg}</span>
							<button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }} onClick={() => setAlertMsg('')}>✕</button>
						</div>
					</div>
				)}

				<div className={styles.grid}>
					{/* P2P接続パネル */}
					<div className={styles.panel}>
						<h2 className={styles.sectionTitle}>1. P2P接続の確立</h2>
						<div className={styles.formGroup}>
							<span className={styles.label}>現在の接続ステータス</span>
							<span className={`${styles.statusBadge} ${styles[connState]}`}>
								{connState === 'connected' ? '接続完了' : connState === 'connecting' ? '接続中...' : '未接続'}
							</span>
						</div>

						{connState === 'disconnected' && (
							<>
								<div className={styles.formGroup}>
									<button className={styles.button} onClick={createOffer}>
										接続コードAを生成 (待機側)
									</button>
								</div>

								{generatedCode && (
									<div className={styles.formGroup}>
										<span className={styles.label}>生成された接続コードA (コピーして相手に共有)</span>
										<textarea 
											className={styles.textarea} 
											readOnly 
											value={generatedCode} 
											onClick={() => {
												navigator.clipboard.writeText(generatedCode);
												setAlertMsg('接続コードAをクリップボードにコピーしました！');
											}}
										/>
									</div>
								)}

								<div className={styles.formGroup}>
									<span className={styles.label}>対向から受け取ったコードを入力</span>
									<textarea 
										className={styles.textarea} 
										placeholder="ここに接続コードを入力してください"
										value={inputCode}
										onChange={(e) => setInputCode(e.target.value)}
									/>
								</div>

								<div className={styles.formGroup} style={{ display: 'flex', gap: '10px' }}>
									<button className={`${styles.button} ${styles.buttonSecondary}`} onClick={acceptOffer}>
										コードAを解析してコードBを生成 (接続側)
									</button>
									<button className={styles.button} onClick={connectAnswer}>
										コードBを入力して接続確立 (待機側)
									</button>
								</div>

								{answerCode && (
									<div className={styles.formGroup}>
										<span className={styles.label}>生成された接続コードB (待機側に送り返す)</span>
										<textarea 
											className={styles.textarea} 
											readOnly 
											value={answerCode}
											onClick={() => {
												navigator.clipboard.writeText(answerCode);
												setAlertMsg('接続コードBをクリップボードにコピーしました！');
											}}
										/>
									</div>
								)}
							</>
						)}
					</div>

					{/* ファイル共有・転送パネル */}
					<div className={styles.panel}>
						<h2 className={styles.sectionTitle}>2. ファイルの共有とダウンロード</h2>

						{/* 送信側の設定 */}
						<div className={styles.panel} style={{ marginBottom: '16px', padding: '16px', background: 'rgba(0,0,0,0.05)' }}>
							<h3 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>📤 ファイルを送信する</h3>
							<div className={styles.formGroup}>
								<button className={styles.button} onClick={selectFiles}>
									送信ファイルを選択 (OSダイアログ起動)
								</button>
							</div>
							{selectedFiles.length > 0 && (
								<div>
									<span className={styles.label}>選択されたファイル:</span>
									<ul style={{ paddingLeft: '20px', margin: '8px 0', fontSize: '13px' }}>
										{selectedFiles.map((f, i) => (
											<li key={i}>{f.split('\\').pop()?.split('/').pop()}</li>
										))}
									</ul>
								</div>
							)}
						</div>

						{/* 受信側の設定 */}
						<div className={styles.panel} style={{ padding: '16px', background: 'rgba(0,0,0,0.05)' }}>
							<h3 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>📥 ファイルを受信する</h3>
							<div className={styles.formGroup}>
								<button className={`${styles.button} ${styles.buttonSecondary}`} onClick={selectSaveDir}>
									保存先フォルダを指定 (OSダイアログ起動)
								</button>
							</div>
							{saveDir && (
								<div style={{ fontSize: '13px', wordBreak: 'break-all' }}>
									<span className={styles.label}>保存先:</span>
									<code>{saveDir}</code>
								</div>
							)}
						</div>

						{/* P2P接続完了後のファイルリスト描画 */}
						{connState === 'connected' && (
							<div style={{ marginTop: '24px' }}>
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<h3 style={{ margin: '0', fontSize: '15px' }}>共有可能なファイル一覧</h3>
									{remoteFiles.length > 0 && role === 'receiver' && (
										<button className={styles.downloadBtn} onClick={downloadAll}>
											まとめてダウンロード (ZIP)
										</button>
									)}
								</div>

								{remoteFiles.length > 0 ? (
									<div className={styles.fileList}>
										{remoteFiles.map((file, i) => (
											<div key={i} className={styles.fileItem}>
												<div className={styles.fileDetails}>
													<span className={styles.fileName}>{file.name}</span>
													<span className={styles.fileSize}>{formatSize(file.size)}</span>
												</div>
												{role === 'receiver' && (
													<button className={styles.downloadBtn} onClick={() => downloadFile(file.name)}>
														ダウンロード
													</button>
												)}
											</div>
										))}
									</div>
								) : (
									<p style={{ fontSize: '13px', color: 'var(--muted)', textAlign: 'center', margin: '16px 0' }}>
										{role === 'sender' ? '対向へファイルリストを送信しました。' : '送信側がファイルを選択するのを待っています。'}
									</p>
								)}
							</div>
						)}
					</div>
				</div>

				{/* 転送進捗インジケータ */}
				{isTransferring && (
					<div className={styles.progressContainer}>
						<div className={styles.statusText}>
							{role === 'sender' ? '📤 送信中:' : '📥 受信中:'} <strong>{transferFile}</strong>
						</div>
						<div className={styles.progressBarBackground}>
							<div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
						</div>
						<div className={styles.transferMeta}>
							<span>{progressPercent.toFixed(1)}% ({formatSize(currentBytes)} / {formatSize(totalBytes)})</span>
							<span>{formatSpeed(speed)}</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
