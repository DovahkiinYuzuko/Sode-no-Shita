import type { Translation } from '../i18n/types';
import { Check, X } from '../icons';
import { BudouText } from './BudouText';
import styles from '../App.module.css';

interface TransferCompleteModalProps {
	lang: string;
	t: Translation;
	fileName: string;
	role: 'sender' | 'receiver';
	onClose: () => void;
}

export function TransferCompleteModal({
	lang,
	t,
	fileName,
	role,
	onClose,
}: TransferCompleteModalProps) {
	return (
		<div className={styles.modalOverlay} onClick={onClose}>
			<div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
				<div className={styles.modalHeader}>
					<h3 className={styles.modalTitle}>
						<Check size={18} color="var(--accent)" />
						<span>
							<BudouText
								text={role === 'receiver' ? t.downloadCompleteTitle : t.uploadCompleteTitle}
								enabled={lang === 'ja'}
							/>
						</span>
					</h3>
					<button className={styles.modalClose} onClick={onClose}>
						<X size={20} />
					</button>
				</div>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '16px',
						alignItems: 'center',
						textAlign: 'center',
						padding: '10px 0',
					}}
				>
					<p style={{ fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
						<BudouText
							text={role === 'receiver' ? t.downloadCompleteMsg : t.uploadCompleteMsg}
							enabled={lang === 'ja'}
						/>
					</p>
					<div
						style={{
							width: '100%',
							padding: '12px',
							backgroundColor: 'rgba(0, 0, 0, 0.05)',
							borderRadius: 'var(--radius-input)',
							fontSize: '13px',
							fontWeight: 600,
							wordBreak: 'break-all',
							fontFamily: 'monospace',
						}}
					>
						{fileName}
					</div>
					<button
						className={styles.button}
						style={{ width: 'auto', padding: '10px 32px', marginTop: '8px' }}
						onClick={onClose}
					>
						{t.btnOk}
					</button>
				</div>
			</div>
		</div>
	);
}
