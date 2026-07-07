import { useState, useEffect } from 'react';
import styles from './App.module.css';
import { locales } from './locales';
import { 
	Settings, 
	HelpCircle, 
	Copy, 
	Check, 
	Upload, 
	Download, 
	RefreshCw, 
	Moon, 
	Sun, 
	X
} from './icons';

interface FileInfo {
	name: string;
	size: number;
}

export default function App() {
	const [theme, setTheme] = useState<'light' | 'dark'>('dark');
	const [lang, setLang] = useState<string>('ja');
	const [connState, setConnState] = useState<string>('disconnected');
	const [fsmState, setFsmState] = useState<string>('IDLE');
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

	// UI状態
	const [showSettings, setShowSettings] = useState<boolean>(false);
	const [showHelp, setShowHelp] = useState<boolean>(false);
	const [copiedA, setCopiedA] = useState<boolean>(false);
	const [copiedB, setCopiedB] = useState<boolean>(false);

	// 言語用辞書
	const t = locales[lang] || locales.ja;

	// GoのSSEステータス監視
	useEffect(() => {
		const eventSource = new EventSource('/api/status');

		eventSource.onmessage = (event) => {
			try {
				const state = JSON.parse(event.data);
				setConnState(state.connState);
				setFsmState(state.fsmState || 'IDLE');
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

				// 設定の同期
				if (state.config) {
					if (state.config.theme) setTheme(state.config.theme);
					if (state.config.lang) setLang(state.config.lang);
				}
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

	// API呼び出し：設定更新
	const updateConfig = async (nextTheme?: string, nextLang?: string) => {
		try {
			const body: any = {};
			if (nextTheme) body.theme = nextTheme;
			if (nextLang) body.lang = nextLang;

			const res = await fetch('/api/config/update', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			const data = await res.json();
			if (data.error) {
				setAlertMsg(`Error: ${data.error}`);
			}
		} catch (e) {
			console.error('Failed to update config:', e);
		}
	};

	// API呼び出し：ファイル選択
	const selectFiles = async () => {
		try {
			const res = await fetch('/api/dialog/file', { method: 'POST' });
			const data = await res.json();
			if (data.error) {
				setAlertMsg(`Error: ${data.error}`);
			} else {
				setSelectedFiles(data.files || []);
			}
		} catch (e) {
			setAlertMsg(lang === 'ja' ? 'ファイルの選択に失敗しました' : 'Failed to select files');
		}
	};

	// API呼び出し：保存先フォルダ選択
	const selectSaveDir = async () => {
		try {
			const res = await fetch('/api/dialog/dir', { method: 'POST' });
			const data = await res.json();
			if (data.error) {
				setAlertMsg(`Error: ${data.error}`);
			} else {
				setSaveDir(data.dir || '');
			}
		} catch (e) {
			setAlertMsg(lang === 'ja' ? '保存先フォルダの選択に失敗しました' : 'Failed to select save directory');
		}
	};

	// 接続コードA (Offer) の生成
	const createOffer = async () => {
		try {
			const res = await fetch('/api/webrtc/offer', { method: 'POST' });
			const data = await res.json();
			if (data.error) {
				setAlertMsg(`Error: ${data.error}`);
			} else {
				setGeneratedCode(data.code);
			}
		} catch (e) {
			setAlertMsg(lang === 'ja' ? '接続コードの生成に失敗しました' : 'Failed to generate connection code');
		}
	};

	// 接続コードAを解析し、接続コードB (Answer) を生成
	const acceptOffer = async () => {
		if (!inputCode) {
			setAlertMsg(lang === 'ja' ? '接続コードを入力してください' : 'Please enter connection code');
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
				setAlertMsg(`Error: ${data.error}`);
			} else {
				setAnswerCode(data.code);
				setInputCode('');
			}
		} catch (e) {
			setAlertMsg(lang === 'ja' ? 'コードの解析に失敗しました' : 'Failed to parse connection code');
		}
	};

	// 接続コードBを入力し、接続を確立
	const connectAnswer = async () => {
		if (!inputCode) {
			setAlertMsg(lang === 'ja' ? '接続コードを入力してください' : 'Please enter connection code');
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
				setAlertMsg(`Error: ${data.error}`);
			} else {
				setAlertMsg(lang === 'ja' ? '接続を登録しました。P2P接続完了を待っています...' : 'Registered connection. Waiting for P2P completion...');
				setInputCode('');
			}
		} catch (e) {
			setAlertMsg(lang === 'ja' ? '接続に失敗しました' : 'Failed to connect');
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
				setAlertMsg(`Error: ${data.error}`);
			}
		} catch (e) {
			setAlertMsg(lang === 'ja' ? 'ダウンロード開始に失敗しました' : 'Failed to start download');
		}
	};

	// まとめてダウンロードの開始
	const downloadAll = async () => {
		try {
			const res = await fetch('/api/download/all', { method: 'POST' });
			const data = await res.json();
			if (data.error) {
				setAlertMsg(`Error: ${data.error}`);
			}
		} catch (e) {
			setAlertMsg(lang === 'ja' ? '一括ダウンロード開始に失敗しました' : 'Failed to start batch download');
		}
	};

	// FSMのリセット
	const resetFSM = async () => {
		try {
			const res = await fetch('/api/webrtc/reset', { method: 'POST' });
			const data = await res.json();
			if (data.error) {
				setAlertMsg(`Error: ${data.error}`);
			} else {
				setGeneratedCode('');
				setInputCode('');
				setAnswerCode('');
				setAlertMsg(lang === 'ja' ? '接続をリセットしました' : 'Connection reset successfully');
			}
		} catch (e) {
			setAlertMsg(lang === 'ja' ? 'リセットに失敗しました' : 'Failed to reset');
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

	// コピー処理
	const handleCopy = (code: string, isOffer: boolean) => {
		navigator.clipboard.writeText(code);
		if (isOffer) {
			setCopiedA(true);
			setTimeout(() => setCopiedA(false), 2000);
		} else {
			setCopiedB(true);
			setTimeout(() => setCopiedB(false), 2000);
		}
	};

	// 進行状況の計算
	const currentBytes = role === 'sender' ? bytesSent : bytesReceived;
	const progressPercent = totalBytes > 0 ? Math.min(100, (currentBytes / totalBytes) * 100) : 0;

	return (
		<div className={styles.app} data-theme={theme}>
			<div className={styles.container}>
				<header className={styles.header}>
					<h1 className={styles.title}>{t.title}</h1>
					<div className={styles.navActions}>
						<button className={styles.iconBtn} onClick={() => setShowHelp(true)} title={t.btnHelp}>
							<HelpCircle size={20} />
						</button>
						<button className={styles.iconBtn} onClick={() => setShowSettings(true)} title={t.settingsTitle}>
							<Settings size={20} />
						</button>
					</div>
				</header>

				{alertMsg && (
					<div className={styles.panel} style={{ borderColor: 'var(--accent)', color: 'var(--text)', marginBottom: '16px', borderLeft: '4px solid var(--accent)' }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<span style={{ fontSize: '14px', fontWeight: 600 }}>{alertMsg}</span>
							<button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '16px' }} onClick={() => setAlertMsg('')}>✕</button>
						</div>
					</div>
				)}

				<div className={styles.grid}>
					{/* P2P接続パネル */}
					<div className={styles.panel}>
						<h2 className={styles.sectionTitle}>{t.p2pEstablish}</h2>
						
						<div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
							<span className={styles.label} style={{ margin: 0 }}>{t.statusLabel}:</span>
							<span className={`${styles.statusBadge} ${styles[connState]}`}>
								{connState === 'connected' ? t.statusConnected : connState === 'connecting' ? t.statusConnecting : t.statusDisconnected}
							</span>
							<span style={{ fontSize: '11px', color: 'var(--muted)' }}>
								({t.statusTitle}: {fsmState})
							</span>
						</div>

						{/* 初期状態 (IDLE) */}
						{fsmState === 'IDLE' && (
							<>
								<div className={styles.formGroup} style={{ marginTop: '20px' }}>
									<button className={styles.button} onClick={createOffer}>
										{t.btnCreateOffer}
									</button>
								</div>

								<div className={styles.formGroup}>
									<span className={styles.label}>{t.placeholderCode}</span>
									<textarea 
										className={styles.textarea} 
										placeholder={t.placeholderCode}
										value={inputCode}
										onChange={(e) => setInputCode(e.target.value)}
									/>
								</div>

								<div className={styles.formGroup}>
									<button className={`${styles.button} ${styles.buttonSecondary}`} onClick={acceptOffer}>
										{t.btnCreateAnswer}
									</button>
								</div>
							</>
						)}

						{/* Offerコード生成中 */}
						{fsmState === 'GENERATING_OFFER' && (
							<div className={styles.loaderWrapper}>
								<div className={styles.spinner} />
								<span className={styles.label}>{t.generatingOffer}</span>
							</div>
						)}

						{/* Answerコード生成中 */}
						{fsmState === 'GENERATING_ANSWER' && (
							<div className={styles.loaderWrapper}>
								<div className={styles.spinner} />
								<span className={styles.label}>{t.generatingAnswer}</span>
							</div>
						)}

						{/* 相手からのAnswer待ち (WAITING_FOR_ANSWER) */}
						{fsmState === 'WAITING_FOR_ANSWER' && (
							<>
								{generatedCode && (
									<div className={styles.formGroup} style={{ marginTop: '20px' }}>
										<span className={styles.label}>{t.labelOffer}</span>
										<div className={styles.copyGroup}>
											<textarea 
												className={styles.textarea} 
												readOnly 
												value={generatedCode} 
											/>
											<button className={styles.copyBtn} onClick={() => handleCopy(generatedCode, true)}>
												{copiedA ? <Check size={16} /> : <Copy size={16} />}
												<span>{t.btnCopy}</span>
											</button>
										</div>
									</div>
								)}

								<div className={styles.formGroup}>
									<span className={styles.label}>{t.btnConnect}</span>
									<textarea 
										className={styles.textarea} 
										placeholder={t.placeholderCode}
										value={inputCode}
										onChange={(e) => setInputCode(e.target.value)}
									/>
								</div>

								<div className={styles.formGroup}>
									<button className={styles.button} onClick={connectAnswer}>
										{t.btnConnect}
									</button>
								</div>
							</>
						)}

						{/* 接続中 (CONNECTING) */}
						{fsmState === 'CONNECTING' && (
							<>
								<div className={styles.loaderWrapper}>
									<div className={styles.spinner} />
									<span className={styles.label}>{t.connectingMsg}</span>
								</div>
								
								{answerCode && (
									<div className={styles.formGroup}>
										<span className={styles.label}>{t.labelAnswer}</span>
										<div className={styles.copyGroup}>
											<textarea 
												className={styles.textarea} 
												readOnly 
												value={answerCode} 
											/>
											<button className={styles.copyBtn} onClick={() => handleCopy(answerCode, false)}>
												{copiedB ? <Check size={16} /> : <Copy size={16} />}
												<span>{t.btnCopy}</span>
											</button>
										</div>
									</div>
								)}
							</>
						)}

						{/* 失敗 (FAILED) */}
						{fsmState === 'FAILED' && (
							<div className={styles.loaderWrapper}>
								<span className={styles.label} style={{ color: 'var(--accent)', fontWeight: 'bold' }}>
									{lang === 'ja' ? '接続に失敗しました。タイムアウトまたは切断されました。' : 'Connection failed. Timed out or disconnected.'}
								</span>
								<button className={`${styles.button} ${styles.buttonSecondary}`} style={{ width: 'auto', padding: '10px 24px' }} onClick={resetFSM}>
									{t.btnReset}
								</button>
							</div>
						)}

						{/* 接続完了 (CONNECTED) 時のリセット用ボタン（予備） */}
						{fsmState === 'CONNECTED' && (
							<div className={styles.formGroup} style={{ marginTop: '20px' }}>
								<button className={`${styles.button} ${styles.buttonSecondary}`} onClick={resetFSM}>
									{t.btnReset}
								</button>
							</div>
						)}
					</div>

					{/* ファイル共有・転送パネル */}
					<div className={styles.panel}>
						<h2 className={styles.sectionTitle}>{t.shareDownload}</h2>

						{/* 送信側の設定 */}
						<div className={styles.panel} style={{ marginBottom: '16px', padding: '16px', background: 'rgba(0,0,0,0.02)' }}>
							<h3 style={{ margin: '0 0 12px 0', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
								<Upload size={16} color="var(--accent)" />
								<span>{t.sendTitle}</span>
							</h3>
							<div className={styles.formGroup}>
								<button className={styles.button} onClick={selectFiles}>
									{t.btnSelectSendFiles}
								</button>
							</div>
							{selectedFiles.length > 0 && (
								<div>
									<span className={styles.label}>{t.labelSelectedFiles}:</span>
									<ul style={{ paddingLeft: '20px', margin: '8px 0', fontSize: '13px', lineHeight: 1.5 }}>
										{selectedFiles.map((f, i) => (
											<li key={i}>{f.split('\\').pop()?.split('/').pop()}</li>
										))}
									</ul>
								</div>
							)}
						</div>

						{/* 受信側の設定 */}
						<div className={styles.panel} style={{ padding: '16px', background: 'rgba(0,0,0,0.02)' }}>
							<h3 style={{ margin: '0 0 12px 0', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
								<Download size={16} color="var(--accent)" />
								<span>{t.recvTitle}</span>
							</h3>
							<div className={styles.formGroup}>
								<button className={`${styles.button} ${styles.buttonSecondary}`} onClick={selectSaveDir}>
									{t.btnSelectSaveDir}
								</button>
							</div>
							{saveDir && (
								<div style={{ fontSize: '13px', wordBreak: 'break-all', lineHeight: 1.4 }}>
									<span className={styles.label}>{t.labelSaveDir}:</span>
									<code>{saveDir}</code>
								</div>
							)}
						</div>

						{/* P2P接続完了後のファイルリスト描画 */}
						{connState === 'connected' && (
							<div style={{ marginTop: '24px' }}>
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
									<h3 style={{ margin: '0', fontSize: '15px', fontWeight: 700 }}>{t.fileListTitle}</h3>
									{remoteFiles.length > 0 && role === 'receiver' && (
										<button className={styles.downloadBtn} onClick={downloadAll}>
											{t.btnDownloadAll}
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
														{lang === 'ja' ? 'ダウンロード' : 'Download'}
													</button>
												)}
											</div>
										))}
									</div>
								) : (
									<p style={{ fontSize: '13px', color: 'var(--muted)', textAlign: 'center', margin: '24px 0', lineHeight: 1.5 }}>
										{role === 'sender' ? t.sentListMsg : t.waitingFiles}
									</p>
								)}
							</div>
						)}
					</div>
				</div>

				{/* 転送進捗インジケータ */}
				{isTransferring && (
					<div className={styles.progressContainer}>
						<div className={styles.statusText} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
							<RefreshCw size={16} className={styles.spinner} style={{ animationDuration: '2s' }} />
							<span>
								{role === 'sender' ? t.sending : t.receiving}: <strong>{transferFile}</strong>
							</span>
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

			{/* 設定モーダル */}
			{showSettings && (
				<div className={styles.modalOverlay} onClick={() => setShowSettings(false)}>
					<div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
						<div className={styles.modalHeader}>
							<h3 className={styles.modalTitle}>
								<Settings size={18} />
								<span>{t.settingsTitle}</span>
							</h3>
							<button className={styles.modalClose} onClick={() => setShowSettings(false)}>
								<X size={20} />
							</button>
						</div>
						<div className={styles.settingsGroup}>
							<div className={styles.settingsRow}>
								<span>{t.selectLang}</span>
								<select 
									className={styles.select} 
									value={lang} 
									onChange={(e) => {
										const nextLang = e.target.value;
										setLang(nextLang);
										updateConfig(undefined, nextLang);
									}}
								>
									<option value="ja">日本語 (Japanese)</option>
									<option value="en">English</option>
								</select>
							</div>
							<div className={styles.settingsRow}>
								<span>{t.selectTheme}</span>
								<div style={{ display: 'flex', gap: '8px' }}>
									<button 
										className={`${styles.iconBtn} ${theme === 'light' ? styles.active : ''}`}
										style={{ borderColor: theme === 'light' ? 'var(--accent)' : 'var(--border)' }}
										onClick={() => {
											setTheme('light');
											updateConfig('light', undefined);
										}}
									>
										<Sun size={16} />
									</button>
									<button 
										className={`${styles.iconBtn} ${theme === 'dark' ? styles.active : ''}`}
										style={{ borderColor: theme === 'dark' ? 'var(--accent)' : 'var(--border)' }}
										onClick={() => {
											setTheme('dark');
											updateConfig('dark', undefined);
										}}
									>
										<Moon size={16} />
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* 使い方ガイドモーダル */}
			{showHelp && (
				<div className={styles.modalOverlay} onClick={() => setShowHelp(false)}>
					<div className={styles.modalContent} style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
						<div className={styles.modalHeader}>
							<h3 className={styles.modalTitle}>
								<HelpCircle size={18} />
								<span>{t.helpTitle}</span>
							</h3>
							<button className={styles.modalClose} onClick={() => setShowHelp(false)}>
								<X size={20} />
							</button>
						</div>
						<div>
							<ol className={styles.helpList}>
								{t.helpSteps.map((step, idx) => (
									<li key={idx} className={styles.helpItem}>{step}</li>
								))}
							</ol>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
