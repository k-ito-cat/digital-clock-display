export const formatTimer = (seconds: number) => {
  const clamped = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(clamped / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((clamped % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const secs = (clamped % 60).toString().padStart(2, '0');

  if (hours === '00') {
    return `${minutes}:${secs}`;
  }

  return `${hours}:${minutes}:${secs}`;
};

