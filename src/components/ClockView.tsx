// import { useUnsplashImage } from "~/hooks/useUnsplashImage";
import { useCurrentTime } from "../hooks/useCurrentTime";

export const ClockView = () => {
  const currentTime = useCurrentTime();

  return (
    <p className="border-[10px] border-white px-4 py-2 text-white border-opacity-50 text-[64px] text-center">
      {currentTime}
    </p>
  );
};
