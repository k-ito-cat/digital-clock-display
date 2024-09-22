export const TIMER_UPDATE_INTERVAL = 1000;
export const DEFAULT_FETCH_INTERVAL = 60 * 60 * 1000;
export const INTERVAL_TIME = [
  { value: 15 * 60 * 1000, label: "15分" },
  { value: 30 * 60 * 1000, label: "30分" },
  { value: 60 * 60 * 1000, label: "1時間" },
  { value: 6 * 60 * 60 * 1000, label: "6時間" },
  { value: 12 * 60 * 60 * 1000, label: "12時間" },
  { value: 24 * 60 * 60 * 1000, label: "1日" },
] as const;
