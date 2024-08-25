// import { useUnsplashImage } from "~/hooks/useUnsplashImage";
import { useCurrentTime } from "../hooks/useCurrentTime";

export const ClockView = () => {
  const currentTime = useCurrentTime();

  return (
    <div className="w-[400px] border-[10px] border-white px-4 py-2">
      <p className="text-center text-[64px] tracking-[.1em] text-white">
        {currentTime}
      </p>
    </div>
  );
};
