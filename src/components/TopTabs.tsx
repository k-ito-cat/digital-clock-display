import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import React from 'react';
import '~/styles/autoHide.css';

type TopTabsProps = {
  value: 'top' | 'pomodoro';
  onChange: (value: 'top' | 'pomodoro') => void;
};

export const TopTabs: React.FC<TopTabsProps> = ({ value, onChange }) => {
  const handleChange = (_e: React.SyntheticEvent, newValue: string) => {
    onChange(newValue as 'top' | 'pomodoro');
  };

  return (
    <Box
      className="auto-hide-ui"
      sx={{
        position: 'absolute',
        top: { xs: 16, sm: 24 },
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 9999,
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      }}
    >
      <Tabs
        value={value}
        onChange={handleChange}
        TabIndicatorProps={{ style: { display: 'none' } }}
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
          value="top"
          label="TOP"
          sx={{
            minHeight: 0,
            minWidth: 0,
            padding: { xs: '6px 12px', sm: '8px 16px' },
            color: '#374151',
            textTransform: 'none',
            fontWeight: value === 'top' ? 700 : 500,
            borderRadius: 9999,
            transition: 'background-color 160ms ease, box-shadow 160ms ease, color 160ms ease',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.95)',
            },
            '&[aria-selected="true"]': {
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              color: '#111827',
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
            color: '#374151',
            textTransform: 'none',
            fontWeight: value === 'pomodoro' ? 700 : 500,
            borderRadius: 9999,
            transition: 'background-color 160ms ease, box-shadow 160ms ease, color 160ms ease',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.95)',
            },
            '&[aria-selected="true"]': {
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              color: '#111827',
            },
          }}
        />
      </Tabs>
    </Box>
  );
};


