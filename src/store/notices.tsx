import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { NoticeContext, type Notice } from './notices-context';

const NOTICE_LIFETIME_MS = 6000;

export const NoticeProvider = ({ children }: { children: ReactNode }) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const nextId = useRef(0);

  /** 同時に出すのは1件。積み上げると平常時の静けさが壊れ、最新の内容も読みにくくなる */
  const notify = useCallback((kind: Notice['kind'], message: string) => {
    const id = ++nextId.current;
    setNotices([{ id, kind, message }]);
    window.setTimeout(() => {
      setNotices((current) => current.filter((notice) => notice.id !== id));
    }, NOTICE_LIFETIME_MS);
  }, []);

  const value = useMemo(() => ({ notices, notify }), [notices, notify]);
  return <NoticeContext.Provider value={value}>{children}</NoticeContext.Provider>;
};
