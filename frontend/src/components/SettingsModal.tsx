import { useState, useEffect } from 'react';
import type { Translation } from '../i18n/types';
import { Settings, X, Sun, Moon } from '../icons';
import { BudouText } from './BudouText';
import styles from '../App.module.css';

interface SettingsModalProps {
	lang: string;
	locales: Record<string, Translation>;
	theme: 'light' | 'dark';
	t: Translation;
	turnServerUrl: string;
	turnUsername: string;
	turnCredential: string;
	onClose: () => void;
	onLangChange: (lang: string) => void;
	onThemeChange: (theme: 'light' | 'dark') => void;
	onTurnConfigChange: (turnServerUrl: string, turnUsername: string, turnCredential: string) => void;
}

export function SettingsModal({
	lang,
	locales,
	theme,
	t,
	turnServerUrl,
	turnUsername,
	turnCredential,
	onClose,
	onLangChange,
	onThemeChange,
	onTurnConfigChange,
}: SettingsModalProps) {
	const [url, setUrl] = useState(turnServerUrl);
	const [user, setUser] = useState(turnUsername);
	const [cred, setCred] = useState(turnCredential);

	useEffect(() => {
		setUrl(turnServerUrl);
	}, [turnServerUrl]);

	useEffect(() => {
		setUser(turnUsername);
	}, [turnUsername]);

	useEffect(() => {
		setCred(turnCredential);
	}, [turnCredential]);

	const handleBlur = () => {
		if (url !== turnServerUrl || user !== turnUsername || cred !== turnCredential) {
			onTurnConfigChange(url, user, cred);
		}
	};

	return (
		<div className={styles.modalOverlay} onClick={onClose}>
			<div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
				<div className={styles.modalHeader}>
					<h3 className={styles.modalTitle}>
						<Settings size={18} />
						<span>
							<BudouText text={t.settingsTitle} enabled={lang === 'ja'} />
						</span>
					</h3>
					<button className={styles.modalClose} onClick={onClose}>
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
							onChange={(e) => onLangChange(e.target.value)}
						>
							{Object.keys(locales).map((key) => (
								<option key={key} value={key}>
									{locales[key].langDisplayName}
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
								onClick={() => onThemeChange('light')}
							>
								<Sun size={16} />
							</button>
							<button
								className={`${styles.iconBtn} ${theme === 'dark' ? styles.active : ''}`}
								style={{ borderColor: theme === 'dark' ? 'var(--accent)' : 'var(--border)' }}
								onClick={() => onThemeChange('dark')}
							>
								<Moon size={16} />
							</button>
						</div>
					</div>

					<div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
						<h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
							<BudouText text={t.turnSettingsTitle} enabled={lang === 'ja'} />
						</h4>
						<p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--muted)' }}>
							<BudouText text={t.turnSettingsHint} enabled={lang === 'ja'} />
						</p>

						<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
							<div>
								<label className={styles.label} style={{ marginBottom: '4px', fontSize: '12px' }}>
									{t.turnServerUrlLabel}
								</label>
								<input
									type="text"
									className={styles.input}
									value={url}
									placeholder={t.turnServerUrlPlaceholder}
									onChange={(e) => setUrl(e.target.value)}
									onBlur={handleBlur}
								/>
							</div>

							<div>
								<label className={styles.label} style={{ marginBottom: '4px', fontSize: '12px' }}>
									{t.turnUsernameLabel}
								</label>
								<input
									type="text"
									className={styles.input}
									value={user}
									placeholder={t.turnUsernamePlaceholder}
									onChange={(e) => setUser(e.target.value)}
									onBlur={handleBlur}
								/>
							</div>

							<div>
								<label className={styles.label} style={{ marginBottom: '4px', fontSize: '12px' }}>
									{t.turnCredentialLabel}
								</label>
								<input
									type="password"
									className={styles.input}
									value={cred}
									placeholder={t.turnCredentialPlaceholder}
									onChange={(e) => setCred(e.target.value)}
									onBlur={handleBlur}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
