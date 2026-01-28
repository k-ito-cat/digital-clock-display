import Tooltip from '@mui/material/Tooltip';
import { useClockSettings } from '~/context/ClockSettingsContext';
import type { ReactElement } from 'react';

type AppTooltipProps = {
  title: string;
  children: ReactElement;
  placement?: 'top' | 'bottom' | 'left' | 'right';
};

export const AppTooltip = ({ title, children, placement = 'top' }: AppTooltipProps) => {
  const { themeMode } = useClockSettings();
  const isDark = themeMode === 'dark';

  return (
    <Tooltip
      title={title}
      placement={placement}
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: isDark ? '#111827' : '#ffffff',
            color: isDark ? '#e2e8f0' : '#0f172a',
            border: `1px solid ${isDark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(15, 23, 42, 0.15)'}`,
            boxShadow: isDark ? '0 10px 24px rgba(2, 6, 23, 0.45)' : '0 10px 24px rgba(15, 23, 42, 0.12)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 0.2,
          },
        },
        arrow: {
          sx: {
            color: isDark ? '#111827' : '#ffffff',
            '&:before': {
              border: `1px solid ${isDark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(15, 23, 42, 0.15)'}`,
            },
          },
        },
      }}
    >
      {children}
    </Tooltip>
  );
};
