import { useState } from 'react';
import { ClockBgImage } from '~/components/ClockBgImage';
import { ClockView } from '~/components/ClockView';
import { FullScreen } from '~/components/FullScreen';
import { SettingDrawer } from '~/components/SettingDrawer';

import { STORAGE_KEY_REQUEST_LIMIT } from '~/constants/keyName';

interface Limit {
  requestLimit: number;
  requestRemaining: number;
}

const ClockPage = () => {
  const storageLimit = localStorage.getItem(STORAGE_KEY_REQUEST_LIMIT);

  const [limit, setLimit] = useState<Limit>({
    requestLimit: storageLimit ? Number(JSON.parse(storageLimit).limit) : 50,
    requestRemaining: storageLimit ? Number(JSON.parse(storageLimit).remaining) : 0,
  });

  return (
    <ClockBgImage setLimit={setLimit}>
      <SettingDrawer limit={limit} />
      <ClockView />
      <FullScreen />
    </ClockBgImage>
  );
};

export default ClockPage;
