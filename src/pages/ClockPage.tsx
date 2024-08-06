import { ClockBgImage } from "~/components/ClockBgImage";
import { ClockView } from "~/components/ClockView";
import SettingDrawer from "~/components/SettingDrawer";

const ClockPage = () => {
  return (
    <ClockBgImage>
      <div className="absolute bottom-2 right-0 hover:opacity-50 transition duration-300">
        <SettingDrawer />
      </div>
      <ClockView />
    </ClockBgImage>
  );
};

export default ClockPage;
