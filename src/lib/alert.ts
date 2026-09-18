/**
 * 合図の再生。音源ファイルを持たず、短い正弦波を鳴らす。
 * requirements.md: 利用者の明示的な許可なく音や通知を発しない。
 */
let context: AudioContext | null = null;

export const playChime = () => {
  try {
    const Ctor = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    context ??= new Ctor();
    void context.resume();

    const now = context.currentTime;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    gain.connect(context.destination);

    for (const [frequency, at] of [
      [880, 0],
      [1320, 0.12],
    ] as const) {
      const oscillator = context.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      oscillator.start(now + at);
      oscillator.stop(now + at + 0.4);
    }
  } catch {
    // 音を鳴らせない環境では黙って諦める。利用者の操作を妨げない
  }
};

export type NotifyPermission = 'granted' | 'denied' | 'unsupported';

/** 通知の許可は、利用者が有効化した操作と同時にだけ求める */
export const requestNotifyPermission = async (): Promise<NotifyPermission> => {
  try {
    if (typeof Notification === 'undefined') return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    const result = await Notification.requestPermission();
    return result === 'granted' ? 'granted' : 'denied';
  } catch {
    return 'unsupported';
  }
};

export const showNotification = (title: string, body: string) => {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    new Notification(title, { body, silent: true });
  } catch {
    // 通知を出せない環境では黙って諦める
  }
};
