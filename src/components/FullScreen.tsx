import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { useState } from 'react';

export const FullScreen = () => {
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
    <div className="absolute bottom-14 right-6">
      {isFullScreen ? (
        <FullscreenExitIcon className="cursor-pointer text-white" onClick={handleFullScreen} />
      ) : (
        <FullscreenIcon className="cursor-pointer text-white" onClick={handleFullScreen} />
      )}
    </div>
  );
};
