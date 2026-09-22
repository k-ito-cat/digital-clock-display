import { useEffect, useImperativeHandle, useRef, type RefObject } from 'react';
import { formatGoalCountdown } from '~/lib/goal';
import { readToken } from '~/lib/tokens';
import { getScrimAppearance } from '~/lib/scrim';
import { formatClock, formatDuration } from '~/lib/time';
import { useBackground } from '~/store/background-context';
import { useSettings, type FaceId } from '~/store/settings-context';
import { PHASE_LABEL, useTimers } from '~/store/timers-context';
import type { ViewId } from './Shell';

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 360;

const FACE_STACK: Record<FaceId, string> = {
  sans: 'system-ui, sans-serif',
  mono: 'ui-monospace, Menlo, monospace',
  serif: '"Hiragino Mincho ProN", Georgia, serif',
};

export type PipHandle = { toggle: () => Promise<void> };

type Props = {
  view: ViewId;
  /** token を読むための要素。DOM と同じ値を canvas でも使う */
  themeRef: RefObject<HTMLElement | null>;
  handle: RefObject<PipHandle | null>;
  onUnsupported: () => void;
  onError: () => void;
};

/**
 * Picture-in-Picture は canvas への描画であり、DOM の装飾を持たない。
 * docs/design/layouts.md の Picture-in-Picture と tokens.md の運用方針に対応する。
 */
export const PipSurface = ({ view, themeRef, handle, onUnsupported, onError }: Props) => {
  const { settings } = useSettings();
  const { imageUrl } = useBackground();
  const { timer, pomodoro, phase, set, remaining, now } = useTimers();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // canvas と video は表示しない。PiP の描画元としてだけ使う
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvasRef.current = canvas;

    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    videoRef.current = video;

    if (typeof canvas.captureStream !== 'function') return;
    const stream = canvas.captureStream(15);
    video.srcObject = stream;
    void video.play();

    return () => {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current = null;
      canvasRef.current = null;
    };
  }, []);

  // 背景画像は読み込み直後だけ差し替える。毎フレーム作り直さない
  useEffect(() => {
    if (!imageUrl) {
      imageRef.current = null;
      return;
    }
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      imageRef.current = image;
    };
    image.onerror = () => {
      imageRef.current = null;
    };
    image.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const themeHost = themeRef.current ?? document.documentElement;
    const foreground = settings.textColor || readToken('--color-fg-primary', themeHost);
    const secondary = readToken('--color-fg-secondary', themeHost);
    const short = Math.min(canvas.width, canvas.height);

    context.clearRect(0, 0, canvas.width, canvas.height);

    const image = imageRef.current;
    if (settings.background === 'image' && image) {
      const canvasRatio = canvas.width / canvas.height;
      const imageRatio = image.width / image.height;
      const width = imageRatio > canvasRatio ? image.width * (canvas.height / image.height) : canvas.width;
      const height = imageRatio > canvasRatio ? canvas.height : image.height * (canvas.width / image.width);
      context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    } else {
      context.fillStyle =
        settings.background === 'solid' ? settings.solidColor : settings.background === 'black' ? '#000000' : '#12161b';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    const main =
      view === 'clock'
        ? formatClock(new Date(now), { showSeconds: settings.showSeconds, hour12: settings.hour12 })
        : view === 'pomodoro'
          ? formatDuration(remaining(pomodoro))
          : formatDuration(remaining(timer));

    const goal = settings.goalEnabled ? formatGoalCountdown(settings.goalName, settings.goalDate, new Date(now)) : null;

    const sub =
      view === 'clock'
        ? goal
        : view === 'pomodoro'
          ? `${PHASE_LABEL[phase]}  ${set}/${settings.totalSets}`
          : timer.status === 'running'
            ? '計測中'
            : '停止中';

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    if (settings.legibility === 'shadow') {
      context.shadowColor = 'rgba(0, 0, 0, 0.45)';
      context.shadowBlur = 10;
    } else if (settings.legibility === 'panel' || settings.legibility === 'glass') {
      // canvas ではぼかしを再現できないため、面だけを敷く
      const width = canvas.width * 0.72;
      const height = canvas.height * 0.52;
      context.fillStyle = readToken('--color-surface-readout', themeHost) || 'rgba(17,24,39,0.3)';
      context.beginPath();
      context.roundRect((canvas.width - width) / 2, (canvas.height - height) / 2, width, height, 16);
      context.fill();
    } else if (settings.legibility === 'scrim') {
      // DOM 側のスクリムに相当する減光を、文字の周りにだけ敷く
      const scrim = getScrimAppearance(settings.scrimRange, settings.scrimAmount);
      const gradient = context.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        short * scrim.radiusRatio,
      );
      const channel = settings.theme === 'light' ? '255, 255, 255' : '0, 0, 0';
      const opacity = settings.theme === 'light' ? scrim.lightOpacity : scrim.darkOpacity;
      gradient.addColorStop(0, `rgba(${channel}, ${opacity})`);
      gradient.addColorStop(1, `rgba(${channel}, 0)`);
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.fillStyle = foreground;
    context.font = `${Math.floor(short * 0.3 * settings.scale)}px ${FACE_STACK[settings.face]}`;
    context.fillText(main, canvas.width / 2, sub ? canvas.height / 2 - short * 0.04 : canvas.height / 2);

    if (sub) {
      context.fillStyle = secondary;
      context.font = `${Math.floor(short * 0.08)}px ${FACE_STACK[settings.face]}`;
      context.fillText(sub, canvas.width / 2, canvas.height / 2 + short * 0.2);
    }

    context.shadowBlur = 0;
  }, [view, now, settings, timer, pomodoro, phase, set, remaining, themeRef]);

  useImperativeHandle(handle, () => ({
    toggle: async () => {
      const video = videoRef.current;
      if (!video || !('requestPictureInPicture' in HTMLVideoElement.prototype)) {
        onUnsupported();
        return;
      }
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          return;
        }
        await video.requestPictureInPicture();
      } catch {
        // hig: feedback.failure。ブラウザ標準のダイアログは使わない
        onError();
      }
    },
  }));

  return null;
};
