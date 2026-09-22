export type Point = { x: number; y: number };
export type Size = { width: number; height: number };

/**
 * 浮いている面を、収める面の内側に留める。
 * 大きさが変わる途中でも呼べるよう、実測の矩形ではなく幅と高さだけを受け取る。
 */
export const clampToFrame = (next: Point, frame?: Size, self?: Size): Point => {
  if (!frame || !self) return next;
  return {
    x: Math.min(Math.max(0, next.x), Math.max(0, frame.width - self.width)),
    y: Math.min(Math.max(0, next.y), Math.max(0, frame.height - self.height)),
  };
};
