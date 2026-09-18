/** タイマーでよく使う長さ。主表示の直下のスライダーに、この順で環状に並べる */
export const TIMER_PRESETS = [
  { seconds: 60, label: '1分' },
  { seconds: 3 * 60, label: '3分' },
  { seconds: 5 * 60, label: '5分' },
  { seconds: 10 * 60, label: '10分' },
  { seconds: 15 * 60, label: '15分' },
  { seconds: 30 * 60, label: '30分' },
  { seconds: 45 * 60, label: '45分' },
  { seconds: 60 * 60, label: '1時間' },
  { seconds: 3 * 60 * 60, label: '3時間' },
] as const;
