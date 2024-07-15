// import { useUnsplashImage } from "~/hooks/useUnsplashImage";
import { useCurrentTime } from "../hooks/useCurrentTime";

export const ClockView = () => {
  const currentTime = useCurrentTime();

  return (
    <p className="border-4 px-4 py-2 text-4xl w-[220px] text-center">
      {currentTime}
    </p>
  );
};
