import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';
import PictureInPictureAltOutlinedIcon from '@mui/icons-material/PictureInPictureAltOutlined';
import clsx from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useClockSettings } from '~/context/ClockSettingsContext';
import { useCurrentTime } from '~/hooks/useCurrentTime';
import { useUnsplashImageContext } from '~/context/UnsplashImageContext';
import { useViewContext } from '~/context/ViewContext';
import { usePomodoroContext } from '~/context/PomodoroContext';
import { useTimerContext } from '~/context/TimerContext';
import { formatTimer } from '~/utils/timerFormat';

type PictureInPictureProps = {
  className?: string;
};

export const PictureInPicture = ({ className }: PictureInPictureProps) => {
  const { timeFormat } = useClockSettings();
  const { timeText } = useCurrentTime(timeFormat);
  const [isInPip, setIsInPip] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { photoUrl } = useUnsplashImageContext();
  const { view } = useViewContext();
  const { remainingSeconds, currentSet, totalSets, mode } = usePomodoroContext();
  const {
    totalSeconds: timerTotalSeconds,
    remainingSeconds: timerRemainingSeconds,
    running: timerRunning,
  } = useTimerContext();

  useEffect(() => {
    // iOS Chrome では captureStream / PiP 非対応のため安全にスキップ
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      canvasRef.current = canvas;

      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      videoRef.current = video;

      const hasCaptureStream = typeof canvas.captureStream === 'function';
      if (!hasCaptureStream) {
        return;
      }

      const stream = canvas.captureStream(30);
      video.srcObject = stream;
      void video.play();

      const onEnter = () => setIsInPip(true);
      const onLeave = () => setIsInPip(false);
      video.addEventListener('enterpictureinpicture', onEnter);
      video.addEventListener('leavepictureinpicture', onLeave);

      return () => {
        video.removeEventListener('enterpictureinpicture', onEnter);
        video.removeEventListener('leavepictureinpicture', onLeave);
        stream.getTracks().forEach((track) => track.stop());
      };
    } catch (_) {
      // 未対応環境でのエラー抑止
    }
  }, []);

  const drawCenterText = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
    ) => {
      const base = Math.min(width, height);
      const big = `${Math.floor(base * 0.28)}px Roboto, system-ui, -apple-system, Segoe UI, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'`;
      const small = `${Math.floor(base * 0.08)}px Roboto, system-ui, -apple-system, Segoe UI, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'`;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#FFFFFF';

      if (view === 'pomodoro') {
        const m = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
        const s = Math.floor(remainingSeconds % 60).toString().padStart(2, '0');
        const timer = `${m}:${s}`;

        ctx.font = big;
        ctx.fillText(timer, width / 2, height / 2);

        ctx.font = small;
        const modeLabel = mode === 'work' ? '作業' : mode === 'shortBreak' ? '小休憩' : mode === 'longBreak' ? '長休憩' : '準備中';
        ctx.fillText(`セット ${currentSet}/${totalSets} ・ ${modeLabel}`, width / 2, height / 2 + base * 0.22);
      } else if (view === 'timer') {
        ctx.font = big;
        ctx.fillText(formatTimer(timerRemainingSeconds), width / 2, height / 2);

        ctx.font = small;
        const suffix = timerRunning ? '進行中' : '停止中';
        ctx.fillText(`設定 ${formatTimer(timerTotalSeconds)} ・ ${suffix}`, width / 2, height / 2 + base * 0.22);
      } else {
        ctx.font = big;
        ctx.fillText(timeText, width / 2, height / 2);
      }

      ctx.shadowBlur = 0;
    },
    [view, remainingSeconds, mode, currentSet, totalSets, timerRemainingSeconds, timerRunning, timerTotalSeconds, timeText],
  );

  // 描画
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

        drawCenterText(ctx, canvas.width, canvas.height);
      };
      img.src = photoUrl;
    } else {
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawCenterText(ctx, canvas.width, canvas.height);
    }
  }, [timeText, photoUrl, view, remainingSeconds, currentSet, totalSets, mode, timerRemainingSeconds, timerRunning, timerTotalSeconds, drawCenterText]);

  const togglePip = async () => {
    try {
      if ('pictureInPictureElement' in document && document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        return;
      }

      const video = videoRef.current;
      if (!video) return;

      const canRequest = 'requestPictureInPicture' in HTMLVideoElement.prototype;
      if (canRequest) {
        await video.requestPictureInPicture();
        return;
      }

      // 未対応環境（iOS Chrome 等）は何もしない
      alert('お使いのブラウザはPicture-in-Pictureに対応していない可能性があります。');
    } catch (e) {
      console.error(e);
    }
  };

  const isPipSupported = typeof HTMLVideoElement !== 'undefined' && 'requestPictureInPicture' in HTMLVideoElement.prototype;

  if (!isPipSupported) return null;

  return (
    <button
      type="button"
      onClick={togglePip}
      aria-label={isInPip ? 'Picture in Picture を終了' : 'Picture in Picture を開始'}
      className={clsx('flex h-11 w-11 items-center justify-center rounded-full bg-black/30 text-white transition hover:bg-black/50', className)}
    >
      {isInPip ? <PictureInPictureAltOutlinedIcon fontSize="small" /> : <PictureInPictureAltIcon fontSize="small" />}
    </button>
  );
};


