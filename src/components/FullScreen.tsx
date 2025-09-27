import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import clsx from 'clsx';
import { useState } from 'react';

type FullScreenProps = {
  className?: string;
};

export const FullScreen = ({ className }: FullScreenProps) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullScreen(false);
    } else {
      document.body.requestFullscreen();
      setIsFullScreen(true);
    }
  };

  return (
    <button
      type="button"
      onClick={handleFullScreen}
      aria-label={isFullScreen ? 'フルスクリーンを終了' : 'フルスクリーン表示'}
      className={clsx(
        'flex h-11 w-11 items-center justify-center rounded-full bg-black/30 text-white transition hover:bg-black/50',
        className,
      )}
    >
      {isFullScreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
    </button>
  );
};
