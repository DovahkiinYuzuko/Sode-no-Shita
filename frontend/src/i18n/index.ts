import type { Translation } from './types';

// localesディレクトリ配下のすべての .ts ファイルを動的インポート
const modules = import.meta.glob<{ default: Translation }>('./locales/*.ts', { eager: true });

export const locales: Record<string, Translation> = {};

for (const path in modules) {
	// パスからファイル名（＝言語キー）を抽出 (例: "./locales/ja.ts" -> "ja")
	const match = path.match(/\/([^/]+)\.ts$/);
	if (match) {
		const lang = match[1];
		const module = modules[path];
		if (module && module.default) {
			locales[lang] = module.default;
		}
	}
}

// デフォルト言語の設定
export const defaultLang = 'en';
export type { Translation };
