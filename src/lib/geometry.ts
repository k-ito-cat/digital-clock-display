export type Point = { x: number; y: number };

/** 浮いている面を、収める面の内側に留める */
export const clampToFrame = (next: Point, frame?: DOMRect, self?: DOMRect): Point => {
  if (!frame || !self) return next;
  return {
    x: Math.min(Math.max(0, next.x), Math.max(0, frame.width - self.width)),
    y: Math.min(Math.max(0, next.y), Math.max(0, frame.height - self.height)),
  };
};
