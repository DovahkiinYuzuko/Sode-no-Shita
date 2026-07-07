import { useState, useEffect } from 'react';
import styles from './App.module.css';
import { locales, defaultLang } from './i18n';
import { loadDefaultJapaneseParser } from 'budoux';
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

const parser = loadDefaultJapaneseParser();

// 日本語の改行を美しくするためのBudouX折り返しコンポーネント
function BudouText({ text, enabled = true }: { text: string; enabled?: boolean }) {
	if (!enabled) {
		return <>{text}</>;
	}
	const chunks = parser.parse(text);
	return (
		<>
			{chunks.map((chunk: string, idx: number) => (
				<span key={idx} style={{ display: 'inline-block' }}>
					{chunk}
				</span>
			))}
		</>
	);
}

export default function App() {
	const [theme, setTheme] = useState<'light' | 'dark'>('dark');
	const [lang, setLang] = useState<string>(defaultLang);
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

	// 言語用辞書（見つからない場合はデフォルトの英語フォールバック）
	const t = locales[lang] || locales[defaultLang] || locales.en;

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
				setAlertMsg(`${t.errSelectFiles} Error: ${data.error}`);
			} else {
				setSelectedFiles(data.files || []);
			}
		} catch (e) {
			setAlertMsg(t.errSelectFiles);
		}
	};

	// API呼び出し：保存先フォルダ選択
	const selectSaveDir = async () => {
		try {
			const res = await fetch('/api/dialog/dir', { method: 'POST' });
			const data = await res.json();
			if (data.error) {
				setAlertMsg(`${t.errSelectSaveDir} Error: ${data.error}`);
			} else {
				setSaveDir(data.dir || '');
			}
		} catch (e) {
			setAlertMsg(t.errSelectSaveDir);
		}
	};

	// 接続コードA (Offer) の生成
	const createOffer = async () => {
		try {
			const res = await fetch('/api/webrtc/offer', { method: 'POST' });
			const data = await res.json();
			if (data.error) {
				setAlertMsg(`${t.errGenOffer} Error: ${data.error}`);
			} else {
				setGeneratedCode(data.code);
			}
		} catch (e) {
			setAlertMsg(t.errGenOffer);
		}
	};

	// 接続コードAを解析し、接続コードB (Answer) を生成
	const acceptOffer = async () => {
		if (!inputCode) {
			setAlertMsg(t.enterCodeWarning);
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
				setAlertMsg(`${t.errGenAnswer} Error: ${data.error}`);
			} else {
				setAnswerCode(data.code);
				setInputCode('');
			}
		} catch (e) {
			setAlertMsg(t.errGenAnswer);
		}
	};

	// 接続コードBを入力し、接続を確立
	const connectAnswer = async () => {
		if (!inputCode) {
			setAlertMsg(t.enterCodeWarning);
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
				setAlertMsg(`${t.errConnect} Error: ${data.error}`);
			} else {
				setAlertMsg(t.connectSuccessMsg);
				setInputCode('');
			}
		} catch (e) {
			setAlertMsg(t.errConnect);
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
				setAlertMsg(`${t.errDownload} Error: ${data.error}`);
			}
		} catch (e) {
			setAlertMsg(t.errDownload);
		}
	};

	// まとめてダウンロードの開始
	const downloadAll = async () => {
		try {
			const res = await fetch('/api/download/all', { method: 'POST' });
			const data = await res.json();
			if (data.error) {
				setAlertMsg(`${t.errBatchDownload} Error: ${data.error}`);
			}
		} catch (e) {
			setAlertMsg(t.errBatchDownload);
		}
	};

	// FSMのリセット
	const resetFSM = async () => {
		try {
			const res = await fetch('/api/webrtc/reset', { method: 'POST' });
			const data = await res.json();
			if (data.error) {
				setAlertMsg(`${t.errReset} Error: ${data.error}`);
			} else {
				setGeneratedCode('');
				setInputCode('');
				setAnswerCode('');
				setAlertMsg(t.resetSuccessMsg);
			}
		} catch (e) {
			setAlertMsg(t.errReset);
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
					<h1 className={styles.title}>
						<BudouText text={t.title} enabled={lang === 'ja'} />
					</h1>
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
						<h2 className={styles.sectionTitle}>
							<BudouText text={t.p2pEstablish} enabled={lang === 'ja'} />
						</h2>
						
						<div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
							<span className={styles.label} style={{ margin: 0 }}>
								<BudouText text={t.statusLabel} enabled={lang === 'ja'} />:
							</span>
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
										<BudouText text={t.btnCreateOffer} enabled={lang === 'ja'} />
									</button>
								</div>

								<div className={styles.formGroup}>
									<span className={styles.label}>
										<BudouText text={t.placeholderCode} enabled={lang === 'ja'} />
									</span>
									<textarea 
										className={styles.textarea} 
										placeholder={t.placeholderCode}
										value={inputCode}
										onChange={(e) => setInputCode(e.target.value)}
									/>
								</div>

								<div className={styles.formGroup}>
									<button className={`${styles.button} ${styles.buttonSecondary}`} onClick={acceptOffer}>
										<BudouText text={t.btnCreateAnswer} enabled={lang === 'ja'} />
									</button>
								</div>
							</>
						)}

						{/* Offerコード生成中 */}
						{fsmState === 'GENERATING_OFFER' && (
							<div className={styles.loaderWrapper}>
								<div className={styles.spinner} />
								<span className={styles.label}>
									<BudouText text={t.generatingOffer} enabled={lang === 'ja'} />
								</span>
							</div>
						)}

						{/* Answerコード生成中 */}
						{fsmState === 'GENERATING_ANSWER' && (
							<div className={styles.loaderWrapper}>
								<div className={styles.spinner} />
								<span className={styles.label}>
									<BudouText text={t.generatingAnswer} enabled={lang === 'ja'} />
								</span>
							</div>
						)}

						{/* 相手からのAnswer待ち (WAITING_FOR_ANSWER) */}
						{fsmState === 'WAITING_FOR_ANSWER' && (
							<>
								{generatedCode && (
									<div className={styles.formGroup} style={{ marginTop: '20px' }}>
										<span className={styles.label}>
											<BudouText text={t.labelOffer} enabled={lang === 'ja'} />
										</span>
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
									<span className={styles.label}>
										<BudouText text={t.btnConnect} enabled={lang === 'ja'} />
									</span>
									<textarea 
										className={styles.textarea} 
										placeholder={t.placeholderCode}
										value={inputCode}
										onChange={(e) => setInputCode(e.target.value)}
									/>
								</div>

								<div className={styles.formGroup}>
									<button className={styles.button} onClick={connectAnswer}>
										<BudouText text={t.btnConnect} enabled={lang === 'ja'} />
									</button>
								</div>
							</>
						)}

						{/* 接続中 (CONNECTING) */}
						{fsmState === 'CONNECTING' && (
							<>
								<div className={styles.loaderWrapper}>
									<div className={styles.spinner} />
									<span className={styles.label}>
										<BudouText text={t.connectingMsg} enabled={lang === 'ja'} />
									</span>
								</div>
								
								{answerCode && (
									<div className={styles.formGroup}>
										<span className={styles.label}>
											<BudouText text={t.labelAnswer} enabled={lang === 'ja'} />
										</span>
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
									<BudouText text={t.connectionFailedUI} enabled={lang === 'ja'} />
								</span>
								<button className={`${styles.button} ${styles.buttonSecondary}`} style={{ width: 'auto', padding: '10px 24px' }} onClick={resetFSM}>
									<BudouText text={t.btnReset} enabled={lang === 'ja'} />
								</button>
							</div>
						)}

						{/* 接続完了 (CONNECTED) 時のリセット用ボタン（予備） */}
						{fsmState === 'CONNECTED' && (
							<div className={styles.formGroup} style={{ marginTop: '20px' }}>
								<button className={`${styles.button} ${styles.buttonSecondary}`} onClick={resetFSM}>
									<BudouText text={t.btnReset} enabled={lang === 'ja'} />
								</button>
							</div>
						)}
					</div>

					{/* ファイル共有・転送パネル */}
					<div className={styles.panel}>
						<h2 className={styles.sectionTitle}>
							<BudouText text={t.shareDownload} enabled={lang === 'ja'} />
						</h2>

						{/* 送信側の設定 */}
						<div className={styles.panel} style={{ marginBottom: '16px', padding: '16px', background: 'rgba(0,0,0,0.02)' }}>
							<h3 style={{ margin: '0 0 12px 0', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
								<Upload size={16} color="var(--accent)" />
								<span>
									<BudouText text={t.sendTitle} enabled={lang === 'ja'} />
								</span>
							</h3>
							<div className={styles.formGroup}>
								<button className={styles.button} onClick={selectFiles}>
									<BudouText text={t.btnSelectSendFiles} enabled={lang === 'ja'} />
								</button>
							</div>
							{selectedFiles.length > 0 && (
								<div>
									<span className={styles.label}>
										<BudouText text={t.labelSelectedFiles} enabled={lang === 'ja'} />:
									</span>
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
								<span>
									<BudouText text={t.recvTitle} enabled={lang === 'ja'} />
								</span>
							</h3>
							<div className={styles.formGroup}>
								<button className={`${styles.button} ${styles.buttonSecondary}`} onClick={selectSaveDir}>
									<BudouText text={t.btnSelectSaveDir} enabled={lang === 'ja'} />
								</button>
							</div>
							{saveDir && (
								<div style={{ fontSize: '13px', wordBreak: 'break-all', lineHeight: 1.4 }}>
									<span className={styles.label}>
										<BudouText text={t.labelSaveDir} enabled={lang === 'ja'} />:
									</span>
									<code>{saveDir}</code>
								</div>
							)}
						</div>

						{/* P2P接続完了後のファイルリスト描画 */}
						{connState === 'connected' && (
							<div style={{ marginTop: '24px' }}>
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
									<h3 style={{ margin: '0', fontSize: '15px', fontWeight: 700 }}>
										<BudouText text={t.fileListTitle} enabled={lang === 'ja'} />
									</h3>
									{remoteFiles.length > 0 && role === 'receiver' && (
										<button className={styles.downloadBtn} onClick={downloadAll}>
											<BudouText text={t.btnDownloadAll} enabled={lang === 'ja'} />
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
														{t.downloadLabel}
													</button>
												)}
											</div>
										))}
									</div>
								) : (
									<p style={{ fontSize: '13px', color: 'var(--muted)', textAlign: 'center', margin: '24px 0', lineHeight: 1.5 }}>
										<BudouText text={role === 'sender' ? t.sentListMsg : t.waitingFiles} enabled={lang === 'ja'} />
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
								<span>
									<BudouText text={t.settingsTitle} enabled={lang === 'ja'} />
								</span>
							</h3>
							<button className={styles.modalClose} onClick={() => setShowSettings(false)}>
								<X size={20} />
							</button>
						</div>
						<div className={styles.settingsGroup}>
							<div className={styles.settingsRow}>
								<span>
									<BudouText text={t.selectLang} enabled={lang === 'ja'} />
								</span>
								<select 
									className={styles.select} 
									value={lang} 
									onChange={(e) => {
										const nextLang = e.target.value;
										setLang(nextLang);
										updateConfig(undefined, nextLang);
									}}
								>
									{Object.keys(locales).map((key) => (
										<option key={key} value={key}>
											{key === 'ja' ? '日本語 (Japanese)' : key === 'en' ? 'English (US)' : key.toUpperCase()}
										</option>
									))}
								</select>
							</div>
							<div className={styles.settingsRow}>
								<span>
									<BudouText text={t.selectTheme} enabled={lang === 'ja'} />
								</span>
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
								<span>
									<BudouText text={t.helpTitle} enabled={lang === 'ja'} />
								</span>
							</h3>
							<button className={styles.modalClose} onClick={() => setShowHelp(false)}>
								<X size={20} />
							</button>
						</div>
						<div>
							<ol className={styles.helpList}>
								{t.helpSteps.map((step, idx) => (
									<li key={idx} className={styles.helpItem}>
										<BudouText text={step} enabled={lang === 'ja'} />
									</li>
								))}
							</ol>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
