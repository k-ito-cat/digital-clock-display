/**
 * Picture-in-Picture は canvas へ描画するため CSS を適用できない。
 * DOM と同じ token 値を使うための読み取り口。
 * docs/design/tokens.md の運用方針に対応する。
 */
export const readToken = (name: string, from: Element = document.documentElement) =>
  getComputedStyle(from).getPropertyValue(name).trim();
