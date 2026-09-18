import { Shell } from '~/components/Shell';
import { AlertWatcher } from '~/store/alerts';
import { BackgroundProvider } from '~/store/background';
import { NoticeProvider } from '~/store/notices';
import { SettingsProvider } from '~/store/settings';
import { TimersProvider } from '~/store/timers';

export const App = () => (
  <NoticeProvider>
    <SettingsProvider>
      <BackgroundProvider>
        <TimersProvider>
          <AlertWatcher>
            <Shell />
          </AlertWatcher>
        </TimersProvider>
      </BackgroundProvider>
    </SettingsProvider>
  </NoticeProvider>
);
