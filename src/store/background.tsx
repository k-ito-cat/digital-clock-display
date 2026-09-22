import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { needsFetch, nextRefreshAt, type BackgroundCache } from '~/lib/background';
import { readJson, removeKey, writeJson } from '~/lib/storage';
import { fetchRandomPhoto, type UnsplashRate } from '~/lib/unsplash';
import { BackgroundContext, LOCAL_IMAGE_LIMIT_BYTES, type BackgroundStatus } from './background-context';
import { useNotices } from './notices-context';
import { useSettings } from './settings-context';

const CACHE_KEY = 'background-cache';
const LOCAL_KEY = 'background-local';
/** 期限切れの確認間隔。取得間隔そのものではない */
const CHECK_INTERVAL_MS = 30_000;

export const BackgroundProvider = ({ children }: { children: ReactNode }) => {
  const { settings } = useSettings();
  const { notify } = useNotices();

  const [cache, setCache] = useState<BackgroundCache | null>(() => readJson<BackgroundCache | null>(CACHE_KEY, null));
  const [localImage, setLocalImageState] = useState<string | null>(() => readJson<string | null>(LOCAL_KEY, null));
  const [status, setStatus] = useState<BackgroundStatus>('ok');
  const [rate, setRate] = useState<UnsplashRate | null>(null);
  const inFlight = useRef(false);

  const load = useCallback(
    async (query: string) => {
      if (inFlight.current) return;
      inFlight.current = true;
      const result = await fetchRandomPhoto(query);
      inFlight.current = false;

      if (result.rate) setRate(result.rate);

      if (!result.ok) {
        setStatus(result.reason === 'network' ? 'failed' : result.reason);
        // hig: loading.keep-previous。直前の背景は保ったまま、失敗だけを知らせる
        notify(
          'error',
          result.reason === 'rate-limited'
            ? '背景の取得が1時間あたりの上限に達しました。時間をおくと自動で再開します。'
            : result.reason === 'unauthorized'
              ? '背景を取得できませんでした。Unsplashのアクセスキーを確認してください。'
              : '背景を取得できませんでした。直前の背景を使い続けます。',
        );
        return;
      }

      setStatus('ok');
      const next: BackgroundCache = { photo: result.photo, fetchedAt: Date.now(), query };
      setCache(next);
      writeJson(CACHE_KEY, next);
    },
    [notify],
  );

  // 最新のキャッシュを購読側から参照する。取得のたびに購読を張り直さないため
  const cacheRef = useRef(cache);
  useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);

  /**
   * 期限切れを一定間隔で確かめ、必要なときだけ取得する。
   * 切替間隔の変更は、再読み込みなしで次回の判定から効く。
   * 取得に失敗した場合はこの確認が再取得を兼ねるため、切り替えない設定でも確認自体は続ける。
   */
  useEffect(() => {
    if (settings.background !== 'image' || settings.imageSource !== 'unsplash') return;

    let timer = 0;
    const check = () => {
      if (needsFetch(cacheRef.current, settings.unsplashQuery, settings.refreshIntervalMs, Date.now())) {
        void load(settings.unsplashQuery);
      }
      timer = window.setTimeout(check, CHECK_INTERVAL_MS);
    };

    timer = window.setTimeout(check, 0);
    return () => window.clearTimeout(timer);
  }, [settings.background, settings.imageSource, settings.unsplashQuery, settings.refreshIntervalMs, load]);

  const setLocalImage = useCallback(
    (file: File) => {
      if (file.size > LOCAL_IMAGE_LIMIT_BYTES) {
        const size = (file.size / 1024 / 1024).toFixed(1);
        notify('error', `この画像は ${size}MB で、保存できる大きさを超えています。2MB以下の画像を選んでください。`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== 'string') return;
        const saved = writeJson(LOCAL_KEY, reader.result);
        if (!saved.ok) {
          notify('error', '画像を保存できませんでした。保存領域がいっぱいです。');
          return;
        }
        setLocalImageState(reader.result);
      };
      reader.onerror = () => notify('error', '画像を読み込めませんでした。');
      reader.readAsDataURL(file);
    },
    [notify],
  );

  const clearLocalImage = useCallback(() => {
    removeKey(LOCAL_KEY);
    setLocalImageState(null);
  }, []);

  const value = useMemo(
    () => ({
      imageUrl: settings.imageSource === 'local' ? localImage : (cache?.photo.url ?? null),
      photo: settings.imageSource === 'local' ? null : (cache?.photo ?? null),
      isLocal: localImage !== null,
      status,
      rate,
      nextRefreshAt: nextRefreshAt(cache, settings.refreshIntervalMs),
      refresh: () => void load(settings.unsplashQuery),
      setLocalImage,
      clearLocalImage,
    }),
    [
      localImage,
      cache,
      status,
      rate,
      settings.imageSource,
      settings.refreshIntervalMs,
      settings.unsplashQuery,
      load,
      setLocalImage,
      clearLocalImage,
    ],
  );

  return <BackgroundContext.Provider value={value}>{children}</BackgroundContext.Provider>;
};
