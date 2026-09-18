/**
 * requirements.md: 保存に失敗した設定を、成功したかのように見せない。
 * 読み書きの失敗を握り潰さず、呼び出し側へ返す。
 */
export type StorageResult = { ok: true } | { ok: false; reason: 'quota' | 'unavailable' };

export const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    // 値が壊れている、または localStorage を参照できない環境
    return fallback;
  }
};

export const writeJson = (key: string, value: unknown): StorageResult => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (error) {
    const isQuota =
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    return { ok: false, reason: isQuota ? 'quota' : 'unavailable' };
  }
};

export const removeKey = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // 参照できない環境では何もしない
  }
};
