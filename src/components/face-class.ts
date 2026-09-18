import type { FaceId } from '~/store/settings-context';

/** 書体の選択を class へ対応させる。時刻を出す場所で共有する */
export const FACE_CLASS: Record<FaceId, string> = {
  sans: 'font-sans',
  mono: 'font-mono',
  serif: 'font-serif',
};
