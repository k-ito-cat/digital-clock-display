import { useBackground } from '~/store/background-context';
import { useSettings } from '~/store/settings-context';

/**
 * requirements.md: Unsplashの画像を表示している間、出典を表示する。
 * 出典は操作ではなく表示の一部なので、自動非表示の対象にしない。hig: disclosure.auto-hide の例外。
 */
export const Attribution = () => {
  const { settings } = useSettings();
  const { photo } = useBackground();

  if (settings.background !== 'image' || settings.imageSource !== 'unsplash' || !photo) return null;

  return (
    <p className="pointer-events-auto m-0 text-[length:var(--text-label)] text-[var(--color-fg-secondary)]">
      <a href={photo.photoUrl} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
        Photo
      </a>
      {' by '}
      <a href={photo.authorUrl} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
        {photo.authorName}
      </a>
      {' on '}
      <a
        href={`https://unsplash.com?utm_source=digital-clock-display&utm_medium=referral`}
        target="_blank"
        rel="noreferrer"
        className="underline-offset-2 hover:underline"
      >
        Unsplash
      </a>
    </p>
  );
};
