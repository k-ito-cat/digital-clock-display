/** Picture-in-Picture を使える環境かどうか。iOS Chrome などでは使えない */
export const isPipSupported = () =>
  typeof HTMLVideoElement !== 'undefined' &&
  'requestPictureInPicture' in HTMLVideoElement.prototype &&
  typeof HTMLCanvasElement !== 'undefined' &&
  typeof HTMLCanvasElement.prototype.captureStream === 'function';
