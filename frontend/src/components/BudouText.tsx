import { loadDefaultJapaneseParser } from 'budoux';

const parser = loadDefaultJapaneseParser();

/**
 * 日本語テキストの改行位置をbudouXで制御するコンポーネント。
 * lang === 'ja' のときのみ enabled=true を渡すことで有効化する。
 */
export function BudouText({ text, enabled = true }: { text: string; enabled?: boolean }) {
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

/**
 * プレーンテキスト属性（textarea の placeholder 等）向けに、
 * budouX の改行推奨位置にゼロ幅スペース（\u200B）を挿入した文字列を返す。
 */
export function toBudouString(text: string, enabled = true): string {
	if (!enabled) {
		return text;
	}
	return parser.parse(text).join('\u200B');
}
