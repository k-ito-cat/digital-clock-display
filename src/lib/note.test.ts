import { beforeEach, describe, expect, it } from 'vitest';
import { clearNote, NOTE_MAX_LENGTH, NOTE_STORAGE_KEY, normalizeNote, noteOverflow, readNote } from './note';

describe('normalizeNote', () => {
  it('上限を超えた文字列でも切り詰めない', () => {
    const long = 'a'.repeat(NOTE_MAX_LENGTH + 1);
    expect(normalizeNote(long)).toBe(long);
  });

  it('文字列以外は空にする', () => {
    expect(normalizeNote(null)).toBe('');
    expect(normalizeNote({ text: 'memo' })).toBe('');
  });
});

describe('noteOverflow', () => {
  it('上限までは0、超えた分だけを返す', () => {
    expect(noteOverflow('a'.repeat(NOTE_MAX_LENGTH))).toBe(0);
    expect(noteOverflow('a'.repeat(NOTE_MAX_LENGTH + 7))).toBe(7);
    expect(noteOverflow('')).toBe(0);
  });
});

describe('readNote', () => {
  beforeEach(() => localStorage.clear());

  it('専用キーから保存済み内容を読む', () => {
    localStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify('保存済み'));
    expect(readNote()).toBe('保存済み');
  });

  it('壊れた値は空として扱う', () => {
    localStorage.setItem(NOTE_STORAGE_KEY, '{');
    expect(readNote()).toBe('');
  });
});

describe('clearNote', () => {
  beforeEach(() => localStorage.clear());

  it('専用キーごと保存済み内容を消す', () => {
    localStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify('保存済み'));
    localStorage.setItem('settings', JSON.stringify({ theme: 'dark' }));
    clearNote();

    expect(localStorage.getItem(NOTE_STORAGE_KEY)).toBeNull();
    expect(readNote()).toBe('');
    // 設定とは別に保持しているため、ほかのキーは残す
    expect(localStorage.getItem('settings')).not.toBeNull();
  });
});
