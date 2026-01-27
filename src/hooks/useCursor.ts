export const useCursor = () => {
  /**
   * 一定時間後にカーソルを自動で非表示にする
   * @param enabled 有効化/無効化
   * @param intervalSecond カーソル非表示までの秒数
   */
  const autoHideCursor = (enabled: boolean, intervalSecond: number) => {
    const bgImageElement = document.getElementById("clock-bg-image");

    let timerId: NodeJS.Timeout;
    const hiddenCursor = (second: number) => {
      clearTimeout(timerId);

      timerId = setTimeout(() => {
        if (bgImageElement) {
          bgImageElement?.classList.add("cursor-none");
          bgImageElement?.classList.remove("cursor-auto");
        }
      }, second * 1000);
    };

    const showUi = () => {
      if (!bgImageElement) return;
      bgImageElement.classList.add("cursor-auto");
      bgImageElement.classList.remove("cursor-none");
      hiddenCursor(intervalSecond);
    };

    if (!bgImageElement) return;

    if (enabled) {
      bgImageElement.classList.add("cursor-none");
      bgImageElement.classList.remove("cursor-auto");
      bgImageElement.addEventListener("mousemove", showUi);
      bgImageElement.addEventListener("touchstart", showUi, { passive: true });
      bgImageElement.addEventListener("pointerdown", showUi);
    } else {
      bgImageElement.classList.remove("cursor-none");
    }
  };

  return { autoHideCursor };
};
