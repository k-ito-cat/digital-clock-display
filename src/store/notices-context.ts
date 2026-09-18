import { createContext, useContext } from 'react';

/**
 * hig: feedback.failure / feedback.status-color
 * 発生時に一定時間だけ通知を出す。同時に出すのは1件で、新しい通知が前の通知を置き換える。
 * 種類は記号と枠線の色で示す。色だけに頼らないよう、記号を種類ごとに変える。
 */
export type Notice = { id: number; message: string; kind: 'error' | 'warn' | 'info' };

export type NoticeContextValue = {
  notices: Notice[];
  notify: (kind: Notice['kind'], message: string) => void;
};

export const NoticeContext = createContext<NoticeContextValue | null>(null);

export const useNotices = () => {
  const context = useContext(NoticeContext);
  if (!context) throw new Error('useNotices must be used within NoticeProvider');
  return context;
};
