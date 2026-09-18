import { Maximize2, Minimize2, type LucideIcon } from 'lucide-react';

export type AdjustVariant = 'compact' | 'full';

/**
 * 調整パネルの2種類。歯車、設定ドロワー、パネル自身の3か所から呼べるため、
 * 名前と説明をここで固定し、呼び出す場所ごとに言い換えない。
 */
export const ADJUST_VARIANTS: Record<AdjustVariant, { short: string; label: string; tip: string; Icon: LucideIcon }> = {
  compact: {
    short: '簡易調整',
    label: '小さいパネルで調整する。書体、文字サイズ、文字色',
    tip: '書体、文字サイズ、文字色だけを調整する',
    Icon: Minimize2,
  },
  full: {
    short: '詳細調整',
    label: '大きいパネルで調整する。表示の設定をすべて含む',
    tip: '表示の設定をすべて出して調整する',
    Icon: Maximize2,
  },
};

/** もう一方の種類。パネルの中から入れ替えるために使う */
export const OTHER_VARIANT: Record<AdjustVariant, AdjustVariant> = { compact: 'full', full: 'compact' };
