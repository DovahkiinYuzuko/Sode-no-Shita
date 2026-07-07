import type { Translation } from '../i18n/types';
import { Settings, X, Sun, Moon } from '../icons';
import { BudouText } from './BudouText';
import styles from '../App.module.css';

interface SettingsModalProps {
	lang: string;
	locales: Record<string, Translation>;
	theme: 'light' | 'dark';
	t: Translation;
	onClose: () => void;
	onLangChange: (lang: string) => void;
	onThemeChange: (theme: 'light' | 'dark') => void;
}

export function SettingsModal({
	lang,
	locales,
	theme,
	t,
	onClose,
	onLangChange,
	onThemeChange,
}: SettingsModalProps) {
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
				</div>
			</div>
		</div>
	);
}
