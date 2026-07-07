import type { Translation } from '../i18n/types';
import { HelpCircle, X } from '../icons';
import { BudouText } from './BudouText';
import styles from '../App.module.css';

interface HelpModalProps {
	lang: string;
	t: Translation;
	onClose: () => void;
}

export function HelpModal({ lang, t, onClose }: HelpModalProps) {
	return (
		<div className={styles.modalOverlay} onClick={onClose}>
			<div
				className={styles.modalContent}
				style={{ maxWidth: '600px' }}
				onClick={(e) => e.stopPropagation()}
			>
				<div className={styles.modalHeader}>
					<h3 className={styles.modalTitle}>
						<HelpCircle size={18} />
						<span>
							<BudouText text={t.helpTitle} enabled={lang === 'ja'} />
						</span>
					</h3>
					<button className={styles.modalClose} onClick={onClose}>
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
	);
}
