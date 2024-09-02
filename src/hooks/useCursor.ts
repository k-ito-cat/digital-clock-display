export const useCursor = () => {
  /**
   * 一定時間後にカーソルを自動で非表示にする
   * @param enabled 有効化/無効化
   * @param intervalSecond カーソル非表示までの秒数
   */
  const autoHideCursor = (enabled: boolean, intervalSecond: number) => {
    const bgImageElement = document.getElementById("clock-bg-image");

    const onMouseMove = () => {
      bgImageElement?.classList.add("cursor-auto");
      bgImageElement?.classList.remove("cursor-none");
      hiddenCursor(intervalSecond);
    };

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

    if (bgImageElement && enabled) {
      bgImageElement.addEventListener("mousemove", onMouseMove);
    }
  };

  return { autoHideCursor };
};
