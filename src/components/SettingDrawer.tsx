import * as React from "react";
import { useState, memo, useEffect } from "react";
import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import BrightnessHighIcon from "@mui/icons-material/BrightnessHigh";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import {
  DEFAULT_FETCH_INTERVAL,
  INTERVAL_TIME,
} from "~/constants/intervalTime";
import { formattedDate } from "~/utils/dateFormat";
import { useSettingHandler } from "~/hooks/useSettingHandler";
import { getNextFetchTime } from "~/utils/nextFetchTime";
import PhotoIcon from "@mui/icons-material/Photo";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useUnsplashImageContext } from "~/context/UnsplashImageContext";
import { useClockSettings } from "~/context/ClockSettingsContext";
import type { ThemeMode, BackgroundType } from "~/context/ClockSettingsContext";
import type { TimeFormat } from "~/hooks/useCurrentTime";
import { THEME_TEXT } from "~/constants/labels";

// TODO: type model
interface SettingDrawerProps {
  limit: { requestLimit: number; requestRemaining: number };
  renderTrigger?: (options: { open: () => void; id: string }) => React.ReactNode;
}

const UNSPLASH_QUERIES = [
  { label: "自然", value: "nature" },
  { label: "都市", value: "city" },
  { label: "山", value: "mountains" },
  { label: "海", value: "ocean" },
  { label: "動物", value: "animals" },
  { label: "宇宙", value: "space" },
];

const CURSOR_SECONDS_OPTIONS = [
  { label: "3秒", value: 3 },
  { label: "5秒", value: 5 },
  { label: "10秒", value: 10 },
  { label: "30秒", value: 30 },
  { label: "60秒", value: 60 },
  { label: "90秒", value: 90 },
  { label: "120秒", value: 120 },
];

const TIME_FORMAT_OPTIONS = [
  { label: "HH:mm:ss", value: "HH:mm:ss" },
  { label: "HH:mm", value: "HH:mm" },
];

const BACKGROUND_TYPE_OPTIONS: Array<{ label: string; value: BackgroundType }> = [
  { label: "画像", value: "image" },
  { label: "白", value: "white" },
  { label: "黒", value: "black" },
  { label: "透明", value: "transparent" },
  { label: "任意色", value: "solid" },
];

const TRIGGER_ID = "setting-button";

export const SettingDrawer = memo(({ limit, renderTrigger }: SettingDrawerProps) => {
  const [drawerState, setDrawerState] = useState<boolean>(false);
  const [nextFetchTime, setNextFetchTime] = useState<string | null>(null);

  const { intervalTime } = useSettingHandler();
  const {
    setCustomBackground,
    clearCustomBackground,
    changeQuery,
    query,
  } = useUnsplashImageContext();
  const {
    cursorHideSeconds,
    setCursorHideSeconds,
    showDate,
    setShowDate,
    timeFormat,
    setTimeFormat,
    showPomodoroControls,
    setShowPomodoroControls,
    showTimerControls,
    setShowTimerControls,
    themeMode,
    setThemeMode,
    backgroundType,
    setBackgroundType,
    backgroundColor,
    setBackgroundColor,
    textColor,
    setTextColor,
    glassmorphismEnabled,
    setGlassmorphismEnabled,
    surfaceBackgroundEnabled,
    setSurfaceBackgroundEnabled,
  } = useClockSettings();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const nextFetchTime = getNextFetchTime(intervalTime.state);

    setNextFetchTime(formattedDate(new Date(nextFetchTime)));
  }, [intervalTime.state, limit]);

  const addSettingIconAnimation = () => {
    const settingButton = document.getElementById(TRIGGER_ID);
    const classes = ["rotate-45", "scale-150"];
    if (settingButton) {
      classes.forEach((className) => {
        settingButton.classList.toggle(className);
      });
    }
  };

  const handleOpen = () => {
    setDrawerState(true);
    addSettingIconAnimation();
  };

  const handleClose = () => {
    setDrawerState(false);
    addSettingIconAnimation();
  };

  const toggleDrawer =
    (open: boolean = true) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event &&
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }
      if (open) {
        handleOpen();
      } else {
        handleClose();
      }
    };

  const isDark = themeMode === 'dark';
  const palette = {
    drawerBg: isDark ? '#0b1220' : '#f7f7f8',
    drawerBorder: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(15, 23, 42, 0.08)',
    cardBg: isDark ? '#111827' : '#ffffff',
    cardBorder: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(15, 23, 42, 0.08)',
    cardShadow: isDark ? '0 10px 24px rgba(2, 6, 23, 0.45)' : '0 10px 24px rgba(15, 23, 42, 0.08)',
    text: isDark ? '#e2e8f0' : '#0f172a',
    textMuted: isDark ? 'rgba(226, 232, 240, 0.6)' : 'rgba(15, 23, 42, 0.6)',
    label: isDark ? 'rgba(226, 232, 240, 0.7)' : 'rgba(15, 23, 42, 0.6)',
    divider: isDark ? 'rgba(148, 163, 184, 0.3)' : 'rgba(15, 23, 42, 0.12)',
    inputBg: isDark ? 'rgba(2, 6, 23, 0.35)' : '#f8fafc',
    inputBorder: isDark ? 'rgba(148, 163, 184, 0.35)' : 'rgba(15, 23, 42, 0.2)',
    inputBorderHover: isDark ? 'rgba(148, 163, 184, 0.6)' : 'rgba(15, 23, 42, 0.35)',
    focus: isDark ? 'rgba(56, 189, 248, 0.7)' : 'rgba(15, 23, 42, 0.6)',
    menuBg: isDark ? '#0f172a' : '#ffffff',
    menuBorder: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(15, 23, 42, 0.12)',
    menuHover: isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(15, 23, 42, 0.08)',
    menuSelected: isDark ? 'rgba(56, 189, 248, 0.22)' : 'rgba(15, 23, 42, 0.12)',
    menuSelectedHover: isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(15, 23, 42, 0.18)',
  };

  const SectionLabel = ({ title, description }: { title: string; description?: string }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: palette.label }}
      >
        {title}
      </Typography>
      {description ? (
        <Typography variant="body2" sx={{ color: palette.textMuted }}>
          {description}
        </Typography>
      ) : null}
    </Box>
  );

  const SectionCard = ({ children }: { children: React.ReactNode }) => (
    <Box
      sx={{
        background: palette.cardBg,
        borderRadius: 3,
        border: `1px solid ${palette.cardBorder}`,
        boxShadow: palette.cardShadow,
        px: { xs: 2, sm: 2.5 },
        py: { xs: 2, sm: 2.5 },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1.5, sm: 2 },
        color: palette.text,
        '& .MuiTypography-root': { color: 'inherit' },
        '& .MuiFormLabel-root': { color: palette.label },
        '& .MuiInputLabel-root': { color: palette.label },
        '& .MuiInputLabel-root.Mui-focused': { color: palette.label },
        '& .MuiInputBase-root': { color: palette.text },
        '& .MuiSelect-icon': { color: palette.label },
        '& .MuiButton-outlined': {
          color: palette.text,
          borderColor: palette.inputBorder,
        },
        '& .MuiButton-outlinedSecondary': {
          color: palette.text,
          borderColor: palette.inputBorder,
        },
      }}
    >
      {children}
    </Box>
  );

  const selectSx = {
    backgroundColor: palette.inputBg,
    borderRadius: 1.5,
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: palette.inputBorder,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: palette.inputBorderHover,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: palette.focus,
      boxShadow: `0 0 0 2px ${isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.12)'}`,
    },
    '& .MuiSelect-select': {
      paddingTop: '10px',
      paddingBottom: '10px',
    },
  } as const;

  const menuProps = {
    PaperProps: {
      sx: {
        mt: 1,
        borderRadius: 2,
        backgroundColor: palette.menuBg,
        color: palette.text,
        border: `1px solid ${palette.menuBorder}`,
        boxShadow: isDark ? '0 16px 40px rgba(2, 6, 23, 0.6)' : '0 16px 40px rgba(15, 23, 42, 0.12)',
      },
    },
    MenuListProps: {
      sx: {
        py: 0.5,
        '& .MuiMenuItem-root': {
          borderRadius: 1,
          mx: 0.5,
          my: 0.25,
          '&.Mui-selected': {
            backgroundColor: palette.menuSelected,
          },
          '&.Mui-selected:hover': {
            backgroundColor: palette.menuSelectedHover,
          },
          '&:hover': {
            backgroundColor: palette.menuHover,
          },
        },
      },
    },
  } as const;

  const list = () => (
    <Box
      role="presentation"
      onKeyDown={toggleDrawer(false)}
      sx={{
        width: 340,
        maxWidth: '100vw',
        px: { xs: 2, sm: 2.5 },
        py: { xs: 2.5, sm: 3 },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 2.5, sm: 3 },
        color: palette.text,
        '& .MuiDivider-root': { borderColor: palette.divider },
        '& .MuiSwitch-root': { color: palette.label },
        '& .MuiRadio-root': { color: palette.label },
      }}
    >
      <Box
        sx={{
          borderRadius: 3,
          p: { xs: 2, sm: 2.5 },
          backgroundColor: palette.cardBg,
          border: `1px solid ${palette.cardBorder}`,
          boxShadow: palette.cardShadow,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography sx={{ fontSize: 20, fontWeight: 700, letterSpacing: 0.6, color: palette.text }}>設定</Typography>
          <Typography variant="body2" sx={{ color: palette.textMuted }}>
            背景・表示・タイマーの見た目をまとめてカスタマイズできます。
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <SectionLabel title="全体" description={THEME_TEXT.description} />
        <SectionCard>
          <RadioGroup
            value={themeMode}
            onChange={(event) => setThemeMode(event.target.value as ThemeMode)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}
          >
            <FormControlLabel value="dark" control={<Radio size="small" />} label={THEME_TEXT.dark} />
            <FormControlLabel value="light" control={<Radio size="small" />} label={THEME_TEXT.light} />
          </RadioGroup>
          <Divider sx={{ borderColor: palette.divider }} />
          <FormControlLabel
            control={
              <Switch
                checked={glassmorphismEnabled}
                onChange={(event) => setGlassmorphismEnabled(event.target.checked)}
                color="primary"
              />
            }
            label="すりガラス背景を有効にする"
          />
          <FormControlLabel
            control={
              <Switch
                checked={surfaceBackgroundEnabled}
                onChange={(event) => setSurfaceBackgroundEnabled(event.target.checked)}
                color="primary"
              />
            }
            label="背景の色を表示"
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" sx={{ color: palette.textMuted }}>
              文字色
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                component="input"
                type="color"
                aria-label="文字色を選択"
                value={textColor || (themeMode === 'dark' ? '#ececec' : '#111827')}
                onChange={(event) => setTextColor(event.target.value)}
                sx={{
                  width: 54,
                  height: 34,
                  border: `1px solid ${palette.inputBorder}`,
                  padding: 0,
                  background: 'transparent',
                  cursor: 'pointer',
                  borderRadius: 1,
                }}
              />
              <Button variant="text" size="small" onClick={() => setTextColor('')}>
                デフォルトに戻す
              </Button>
            </Box>
          </Box>
        </SectionCard>

        <SectionLabel title="操作" description="画像更新やカーソルの非表示時間を調整します。" />
        <SectionCard>
          <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel id="interval-select-label">背景画像の切替間隔</InputLabel>
            <Select
              labelId="interval-select-label"
              id="interval-select"
              value={String(intervalTime.state || DEFAULT_FETCH_INTERVAL)}
              label="背景画像の切替間隔"
              onChange={intervalTime.handler}
              MenuProps={menuProps}
              sx={selectSx}
            >
              {INTERVAL_TIME.map((time) => (
                <MenuItem key={time.value} value={String(time.value)}>
                  {time.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel id="cursor-hide-select-label">カーソル非表示までの秒数</InputLabel>
            <Select
              labelId="cursor-hide-select-label"
              id="cursor-hide-select"
              value={String(cursorHideSeconds)}
              label="カーソル非表示までの秒数"
              onChange={(event) => setCursorHideSeconds(Number(event.target.value) || 3)}
              MenuProps={menuProps}
              sx={selectSx}
            >
              {CURSOR_SECONDS_OPTIONS.map((item) => (
                <MenuItem key={item.value} value={String(item.value)}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </SectionCard>

        <SectionLabel title="画像" description="壁紙や単色背景の設定を行います。" />
        <SectionCard>
          <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel id="background-type-select-label">背景タイプ</InputLabel>
            <Select
              labelId="background-type-select-label"
              id="background-type-select"
              value={backgroundType}
              label="背景タイプ"
              onChange={(event) => setBackgroundType(event.target.value as BackgroundType)}
              MenuProps={menuProps}
              sx={selectSx}
            >
              {BACKGROUND_TYPE_OPTIONS.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" sx={{ color: palette.textMuted }}>
              単色の背景色
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, opacity: backgroundType === 'solid' ? 1 : 0.5 }}>
              <Box
                component="input"
                type="color"
                aria-label="背景色を選択"
                value={backgroundColor || '#ffffff'}
                onChange={(event) => setBackgroundColor(event.target.value)}
                disabled={backgroundType !== 'solid'}
                sx={{
                  width: 54,
                  height: 34,
                  border: `1px solid ${palette.inputBorder}`,
                  padding: 0,
                  background: 'transparent',
                  cursor: 'pointer',
                  borderRadius: 1,
                }}
              />
              <Button variant="text" size="small" onClick={() => setBackgroundColor('#ffffff')} disabled={backgroundType !== 'solid'}>
                白に戻す
              </Button>
            </Box>
          </Box>
          <Stack spacing={1} width="100%">
            <Button
              variant="outlined"
              startIcon={<PhotoIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ borderStyle: 'dashed', borderWidth: 1.5 }}
            >
              画像をアップロード
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === "string") {
                    setCustomBackground(reader.result);
                  }
                };
                reader.readAsDataURL(file);
                event.target.value = "";
              }}
            />
            <Button variant="outlined" color="secondary" startIcon={<CloudUploadIcon />} onClick={() => clearCustomBackground()}>
              Unsplashに戻す
            </Button>
          </Stack>
          <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel id="unsplash-query-select-label">Unsplashカテゴリ</InputLabel>
            <Select
              labelId="unsplash-query-select-label"
              id="unsplash-query-select"
              value={query}
              label="Unsplashカテゴリ"
              onChange={(event) => changeQuery(event.target.value)}
              MenuProps={menuProps}
              sx={selectSx}
            >
              {UNSPLASH_QUERIES.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mt: 0.5 }}>
            <Typography variant="body2" sx={{ color: palette.textMuted }}>
              次の切替予定
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {nextFetchTime}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: palette.textMuted }}>
              １時間あたりのリクエスト上限回数
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              {limit.requestRemaining > 25 ? (
                <Chip label={`${limit.requestRemaining} / ${limit.requestLimit}`} color="success" size="small" />
              ) : limit.requestRemaining <= 0 ? (
                <Chip label={`${limit.requestRemaining} / ${limit.requestLimit}`} color="error" size="small" />
              ) : (
                <Chip label={`${limit.requestRemaining} / ${limit.requestLimit}`} color="warning" size="small" />
              )}
            </Stack>
          </Box>
        </SectionCard>

        <SectionLabel title="時計" description="表示フォーマットを切り替えます。" />
        <SectionCard>
          <FormControlLabel
            control={<Switch checked={showDate} onChange={(event) => setShowDate(event.target.checked)} color="primary" />}
            label="日付を表示"
          />
          <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel id="time-format-select-label">時刻フォーマット</InputLabel>
            <Select
              labelId="time-format-select-label"
              id="time-format-select"
              value={timeFormat}
              label="時刻フォーマット"
              onChange={(event) => setTimeFormat(event.target.value as TimeFormat)}
              MenuProps={menuProps}
              sx={selectSx}
            >
              {TIME_FORMAT_OPTIONS.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </SectionCard>

        <SectionLabel title="ポモドーロ" description="コントロール表示を切り替えます。" />
        <SectionCard>
          <FormControlLabel
            control={<Switch checked={showPomodoroControls} onChange={(event) => setShowPomodoroControls(event.target.checked)} color="primary" />}
            label="コントロールを表示"
          />
        </SectionCard>

        <SectionLabel title="タイマー" description="コントロール表示を切り替えます。" />
        <SectionCard>
          <FormControlLabel
            control={<Switch checked={showTimerControls} onChange={(event) => setShowTimerControls(event.target.checked)} color="primary" />}
            label="コントロールを表示"
          />
        </SectionCard>
      </Box>
    </Box>
  );

  return (
    <>
      {renderTrigger ? (
        renderTrigger({ open: handleOpen, id: TRIGGER_ID })
      ) : (
        <Button
          id={TRIGGER_ID}
          onClick={handleOpen}
          sx={{
            minWidth: "0",
            padding: 0,
            position: "absolute",
            bottom: "24px",
            right: "24px",
            transition: "0.3s",
            ":hover": {
              transform: "scale(1.5)",
              opacity: 0.5,
            },
          }}
        >
          <BrightnessHighIcon sx={{ color: "white" }} />
        </Button>
      )}
      <SwipeableDrawer
        anchor={"left"}
        open={drawerState}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer()}
        PaperProps={{
          sx: {
            backgroundColor: palette.drawerBg,
            borderRight: `1px solid ${palette.drawerBorder}`,
            fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif",
          },
        }}
      >
        {list()}
      </SwipeableDrawer>
    </>
  );
});
