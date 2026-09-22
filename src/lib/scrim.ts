export const SCRIM_VALUE_MIN = 0;
export const SCRIM_VALUE_MAX = 100;

const clamp = (value: number) => Math.min(SCRIM_VALUE_MAX, Math.max(SCRIM_VALUE_MIN, value));
const ratio = (value: number) => clamp(value) / SCRIM_VALUE_MAX;
const interpolate = (from: number, to: number, value: number) => from + (to - from) * ratio(value);

export const clampScrimValue = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? clamp(value) : fallback;

export const describeScrimValue = (value: number) => {
  const normalized = clamp(value);
  if (normalized === SCRIM_VALUE_MIN) return '最小';
  if (normalized === SCRIM_VALUE_MAX) return '最大';
  if (normalized < 34) return '小さめ';
  if (normalized < 67) return '中間';
  return '大きめ';
};

export const getScrimAppearance = (range: number, amount: number) => ({
  insetInlinePercent: interpolate(10, 40, range),
  insetBlockPercent: interpolate(14, 56, range),
  radiusRatio: interpolate(0.75, 1.25, range),
  darkOpacity: interpolate(0.35, 0.75, amount),
  lightOpacity: interpolate(0.52, 0.92, amount),
});
