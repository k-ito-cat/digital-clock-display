// import { useUnsplashImage } from "~/hooks/useUnsplashImage";
import { useCurrentTime } from "../hooks/useCurrentTime";

export const ClockView = () => {
  const currentTime = useCurrentTime();

  return (
    <div className="border-[10px] w-[400px] border-white px-4 py-2">
      <p className="tracking-[.1em] text-white text-[64px] text-center">
        {currentTime}
      </p>
    </div>
  );
};
