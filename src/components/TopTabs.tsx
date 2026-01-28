import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import React from 'react';
import '~/styles/autoHide.css';
import { useClockSettings } from '~/context/ClockSettingsContext';

type TopTabsProps = {
  value: 'clock' | 'pomodoro' | 'timer';
  onChange: (value: 'clock' | 'pomodoro' | 'timer') => void;
};

export const TopTabs: React.FC<TopTabsProps> = ({ value, onChange }) => {
  const { themeMode } = useClockSettings();
  const isDark = themeMode === 'dark';

  const palette = {
    bg: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)',
    border: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(15, 23, 42, 0.08)',
    text: isDark ? 'rgba(226, 232, 240, 0.7)' : 'rgba(15, 23, 42, 0.6)',
    textActive: isDark ? '#f8fafc' : '#0f172a',
    hover: isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(15, 23, 42, 0.06)',
    active: isDark ? 'rgba(148, 163, 184, 0.22)' : 'rgba(15, 23, 42, 0.08)',
  };

  const handleChange = (_e: React.SyntheticEvent, newValue: string) => {
    onChange(newValue as 'clock' | 'pomodoro' | 'timer');
  };

  return (
    <Box
      className="auto-hide-ui"
      sx={{
        position: 'absolute',
        top: { xs: 16, sm: 24 },
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: palette.bg,
        borderRadius: 9999,
        border: `1px solid ${palette.border}`,
        boxShadow: isDark ? '0 10px 24px rgba(2, 6, 23, 0.35)' : '0 10px 24px rgba(15, 23, 42, 0.08)',
        width: { xs: 'max-content', sm: 'auto' },
      }}
    >
      <Tabs
        value={value}
        onChange={handleChange}
        TabIndicatorProps={{ style: { display: 'none' } }}
        variant="scrollable"
        scrollButtons={false}
        sx={{
          minHeight: 0,
          '& .MuiTabs-flexContainer': {
            gap: { xs: 0.5, sm: 1 },
            padding: { xs: '4px', sm: '6px' },
          },
        }}
      >
        <Tab
          disableRipple
          value="clock"
          label="時計"
          sx={{
            minHeight: 0,
            minWidth: 0,
            padding: { xs: '6px 12px', sm: '8px 16px' },
            color: palette.text,
            textTransform: 'none',
            fontWeight: value === 'clock' ? 700 : 500,
            borderRadius: 9999,
            transition: 'background-color 160ms ease, color 160ms ease',
            '&:hover': {
              backgroundColor: palette.hover,
            },
            '&[aria-selected="true"]': {
              backgroundColor: palette.active,
              color: palette.textActive,
            },
          }}
        />
        <Tab
          disableRipple
          value="pomodoro"
          label="ポモドーロ"
          sx={{
            minHeight: 0,
            minWidth: 0,
            padding: { xs: '6px 12px', sm: '8px 16px' },
            color: palette.text,
            textTransform: 'none',
            fontWeight: value === 'pomodoro' ? 700 : 500,
            borderRadius: 9999,
            transition: 'background-color 160ms ease, color 160ms ease',
            '&:hover': {
              backgroundColor: palette.hover,
            },
            '&[aria-selected="true"]': {
              backgroundColor: palette.active,
              color: palette.textActive,
            },
          }}
        />
        <Tab
          disableRipple
          value="timer"
          label="タイマー"
          sx={{
            minHeight: 0,
            minWidth: 0,
            padding: { xs: '6px 12px', sm: '8px 16px' },
            color: palette.text,
            textTransform: 'none',
            fontWeight: value === 'timer' ? 700 : 500,
            borderRadius: 9999,
            transition: 'background-color 160ms ease, color 160ms ease',
            '&:hover': {
              backgroundColor: palette.hover,
            },
            '&[aria-selected="true"]': {
              backgroundColor: palette.active,
              color: palette.textActive,
            },
          }}
        />
      </Tabs>
    </Box>
  );
};

