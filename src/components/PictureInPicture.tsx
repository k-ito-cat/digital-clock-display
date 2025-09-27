import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';
import PictureInPictureAltOutlinedIcon from '@mui/icons-material/PictureInPictureAltOutlined';
import { useEffect, useRef, useState } from 'react';
import { useCurrentTime } from '~/hooks/useCurrentTime';
import { useUnsplashImageContext } from '~/context/UnsplashImageContext';

export const PictureInPicture = () => {
  const timeText = useCurrentTime();
  const [isInPip, setIsInPip] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { photoUrl } = useUnsplashImageContext();

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    canvasRef.current = canvas;

    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    videoRef.current = video;

    const stream = canvas.captureStream(30);
    video.srcObject = stream;
    video.play().catch(() => {});

    const onEnter = () => setIsInPip(true);
    const onLeave = () => setIsInPip(false);
    video.addEventListener('enterpictureinpicture', onEnter);
    video.addEventListener('leavepictureinpicture', onLeave);

    return () => {
      video.removeEventListener('enterpictureinpicture', onEnter);
      video.removeEventListener('leavepictureinpicture', onLeave);
      const tracks = stream.getTracks();
      tracks.forEach((t) => t.stop());
    };
  }, []);

  // 時計の描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Unsplash画像をキャンバスへ描画（存在しなければ単色）
    if (photoUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // cover的にトリミングして描画
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        let offsetX = 0;
        let offsetY = 0;

        if (imgRatio > canvasRatio) {
          drawHeight = canvas.height;
          drawWidth = img.width * (canvas.height / img.height);
          offsetX = (canvas.width - drawWidth) / 2;
        } else {
          drawWidth = canvas.width;
          drawHeight = img.height * (canvas.width / img.width);
          offsetY = (canvas.height - drawHeight) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        drawClockText(ctx, canvas.width, canvas.height, timeText);
      };
      img.src = photoUrl;
    } else {
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawClockText(ctx, canvas.width, canvas.height, timeText);
    }
  }, [timeText, photoUrl]);

  const drawClockText = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    text: string,
  ) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const base = Math.min(width, height);
    ctx.font = `${Math.floor(base * 0.28)}px Roboto, system-ui, -apple-system, Segoe UI, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'`;
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 8;
    ctx.fillText(text, width / 2, height / 2);
    ctx.shadowBlur = 0;
  };

  const togglePip = async () => {
    try {
      if ('pictureInPictureElement' in document && document.pictureInPictureElement) {
        await (document as any).exitPictureInPicture();
        return;
      }

      const video = videoRef.current;
      if (!video) return;

      if ('requestPictureInPicture' in HTMLVideoElement.prototype) {
        await (video as any).requestPictureInPicture();
        return;
      }

      // Fallback をここで追加する場合は Document PiP などを検討
      alert('お使いのブラウザはPicture-in-Pictureに対応していない可能性があります。');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  return (
    <div className="absolute bottom-24 right-6">
      {isInPip ? (
        <PictureInPictureAltOutlinedIcon className="cursor-pointer text-white" onClick={togglePip} />
      ) : (
        <PictureInPictureAltIcon className="cursor-pointer text-white" onClick={togglePip} />
      )}
    </div>
  );
};


