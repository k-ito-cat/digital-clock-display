import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import clsx from 'clsx';
import { useState } from 'react';
import { AppTooltip } from '~/components/AppTooltip';

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
    <AppTooltip title={isFullScreen ? 'フルスクリーンを終了' : 'フルスクリーン表示'} placement="top">
      <button
        type="button"
        onClick={handleFullScreen}
        aria-label={isFullScreen ? 'フルスクリーンを終了' : 'フルスクリーン表示'}
        className={clsx('btn-theme flex h-11 w-11 items-center justify-center rounded-full transition hover:-translate-y-[1px]', className)}
      >
        {isFullScreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
      </button>
    </AppTooltip>
  );
};
