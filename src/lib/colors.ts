/**
 * 文字色の見本。長時間見続ける前提で、彩度を抑えた色に限る。
 * 明るい背景と暗い背景の両方に使えるよう、明るい5色と暗い1色を持つ。
 * 任意の色は色の入力から選べる。ここにあるのは近道であり、選べる色を限定しない。
 */
export const TEXT_COLORS = [
  { value: '#f2ede3', label: '生成り' },
  { value: '#f3c98b', label: '琥珀' },
  { value: '#bcd9c8', label: '若草' },
  { value: '#b9cfe4', label: '空' },
  { value: '#cfc3e2', label: '藤' },
  { value: '#3c4148', label: '墨' },
] as const;
