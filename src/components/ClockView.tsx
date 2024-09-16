import { useCurrentTime } from "../hooks/useCurrentTime";

export const ClockView = () => {
  const currentTime = useCurrentTime();

  return (
    <div className="mx-8 w-[280px] border-white px-4 py-2 sm:w-[380px] md:w-[400px]">
      <p className="text-center text-[32px] tracking-[.1em] text-white sm:text-[48px] md:text-[64px]">
        {currentTime}
      </p>
    </div>
  );
};
