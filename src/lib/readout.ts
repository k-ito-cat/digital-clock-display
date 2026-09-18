/**
 * 主表示の大きさを、実際に出す文字列から決める。
 *
 * 面の短辺に一定の係数を掛ける方法は、表示する桁数を無視するため無駄が出る。
 * 例えば縦長の面では、桁数が少なくても文字が小さいままになる。
 * ここでは文字列の見込み幅（em）から、面の幅をどれだけ埋めるかで係数を求める。
 */
const DIGIT_EM = 0.62;
const NARROW_EM: Record<string, number> = { ':': 0.32, ' ': 0.3 };
const OTHER_EM = 0.58;

/** 等幅数字での見込み幅を em で返す */
export const estimateWidthEm = (text: string) =>
  [...text].reduce((sum, char) => {
    if (char in NARROW_EM) return sum + NARROW_EM[char];
    return sum + (char >= '0' && char <= '9' ? DIGIT_EM : OTHER_EM);
  }, 0);

/** 面の幅のうち主表示が占める割合 */
const FILL_RATIO = 88;
/** 面の高さに対する上限。副次情報と操作の場所を残す */
const HEIGHT_CAP_CQB = 38;

/**
 * 画面ごとに桁数が違うと、画面を移るたびに主表示の大きさが跳ねる。
 * 共通の基準となる文字列で大きさを決め、実際の文字列がそれより長い場合だけ縮める。
 */
export const readoutFontSize = (text: string, scale: number, reference = text) => {
  const widthEm = Math.max(estimateWidthEm(text), estimateWidthEm(reference), 1);
  const byWidth = FILL_RATIO / widthEm;
  return `calc(clamp(1.25rem, min(${byWidth.toFixed(1)}cqi, ${HEIGHT_CAP_CQB}cqb), 32rem) * ${scale})`;
};

/** 画面をまたいで共有する基準。時計の書式から決める */
export const readoutReference = ({ showSeconds, hour12 }: { showSeconds: boolean; hour12: boolean }) =>
  `${showSeconds ? '00:00:00' : '00:00'}${hour12 ? ' AM' : ''}`;
