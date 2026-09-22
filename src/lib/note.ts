import { readJson, removeKey } from './storage';

export const NOTE_STORAGE_KEY = 'note';
export const NOTE_MAX_LENGTH = 1000;

/** 読み取った値を切り詰めない。上限を超えた本文も、書いた通りに扱って保存だけを止める */
export const normalizeNote = (value: unknown) => (typeof value === 'string' ? value : '');

/** 上限をどれだけ超えているか。0 なら保存できる */
export const noteOverflow = (text: string) => Math.max(0, text.length - NOTE_MAX_LENGTH);

export const readNote = () => normalizeNote(readJson<unknown>(NOTE_STORAGE_KEY, ''));

/** 保存済み内容を消す。設定とは別に保持しているため、専用キーだけを対象にする */
export const clearNote = () => removeKey(NOTE_STORAGE_KEY);
