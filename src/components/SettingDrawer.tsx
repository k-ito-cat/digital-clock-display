import * as React from "react";
import { useState, memo, useEffect } from "react";
import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import BrightnessHighIcon from "@mui/icons-material/BrightnessHigh";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import NativeSelect from "@mui/material/NativeSelect";
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

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <Typography
      variant="subtitle2"
      sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary', letterSpacing: 0.4 }}
    >
      {children}
    </Typography>
  );

  const list = () => (
    <Box
      role="presentation"
      onKeyDown={toggleDrawer(false)}
      sx={{ width: 320, maxWidth: '100vw' }}
    >
      <List sx={{ px: { xs: 1.5, sm: 2 }, py: { xs: 2.5, sm: 4 } }}>
        <SectionLabel>全体</SectionLabel>
        <ListItem sx={{ flexDirection: 'column', alignItems: 'stretch', gap: { xs: 1.5, sm: 2 } }}>
          <Typography variant="body2" color="text.secondary">
            {THEME_TEXT.description}
          </Typography>
          <RadioGroup
            value={themeMode}
            onChange={(event) => setThemeMode(event.target.value as ThemeMode)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 0.75 }}
          >
            <FormControlLabel
              value="dark"
              control={<Radio size="small" />}
              label={THEME_TEXT.dark}
              />
            <FormControlLabel
              value="light"
              control={<Radio size="small" />}
              label={THEME_TEXT.light}
            />
          </RadioGroup>
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
            <Typography variant="body2" color="text.secondary">
              文字色
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                component="input"
                type="color"
                aria-label="文字色を選択"
                value={textColor || (themeMode === 'dark' ? '#ececec' : '#111827')}
                onChange={(event) => setTextColor(event.target.value)}
                sx={{ width: 48, height: 32, border: 'none', padding: 0, background: 'transparent', cursor: 'pointer' }}
              />
              <Button variant="text" size="small" onClick={() => setTextColor('')}>
                デフォルトに戻す
              </Button>
            </Box>
          </Box>
        </ListItem>
        <ListItem sx={{ flexDirection: 'column', alignItems: 'stretch', gap: { xs: 1.5, sm: 2 } }}>
          <FormControl variant="standard" fullWidth>
            <InputLabel htmlFor="interval-select">背景画像の切替間隔</InputLabel>
            <NativeSelect
              defaultValue={intervalTime.state || DEFAULT_FETCH_INTERVAL}
              inputProps={{ name: "interval time", id: "interval-select" }}
              onChange={intervalTime.handler}
              sx={{ pr: 2.5 }}
            >
              {INTERVAL_TIME.map((time) => (
                <option key={time.value} value={time.value}>
                  {time.label}
                </option>
              ))}
            </NativeSelect>
          </FormControl>
          <FormControl variant="standard" fullWidth>
            <InputLabel htmlFor="cursor-hide-select">カーソル非表示までの秒数</InputLabel>
            <NativeSelect
              value={cursorHideSeconds}
              onChange={(event) => setCursorHideSeconds(Number(event.target.value) || 3)}
              inputProps={{ name: "cursor hide seconds", id: "cursor-hide-select" }}
              sx={{ pr: 2.5 }}
            >
              {CURSOR_SECONDS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </NativeSelect>
          </FormControl>
        </ListItem>
        <Divider sx={{ my: 2 }} />
        <SectionLabel>画像</SectionLabel>
        <ListItem sx={{ flexDirection: 'column', alignItems: 'stretch', gap: { xs: 1.5, sm: 2 } }}>
          <FormControl variant="standard" fullWidth>
            <InputLabel htmlFor="background-type-select">背景タイプ</InputLabel>
            <NativeSelect
              value={backgroundType}
              onChange={(event) => setBackgroundType(event.target.value as BackgroundType)}
              inputProps={{ name: "background type", id: "background-type-select" }}
              sx={{ pr: 2.5 }}
            >
              {BACKGROUND_TYPE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </NativeSelect>
          </FormControl>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
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
                sx={{ width: 48, height: 32, border: 'none', padding: 0, background: 'transparent', cursor: 'pointer' }}
              />
              <Button variant="text" size="small" onClick={() => setBackgroundColor('#ffffff')} disabled={backgroundType !== 'solid'}>
                白に戻す
              </Button>
            </Box>
          </Box>
          <Stack spacing={1} width="100%">
            <Button variant="outlined" startIcon={<PhotoIcon />} onClick={() => fileInputRef.current?.click()}>
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
          <FormControl variant="standard" fullWidth>
            <InputLabel htmlFor="unsplash-query-select">Unsplashカテゴリ</InputLabel>
            <NativeSelect
              value={query}
              onChange={(event) => changeQuery(event.target.value)}
              inputProps={{ name: "unsplash query", id: "unsplash-query-select" }}
              sx={{ pr: 2.5 }}
            >
              {UNSPLASH_QUERIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </NativeSelect>
          </FormControl>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              次の切替予定
            </Typography>
            <Typography variant="body1">{nextFetchTime}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
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
        </ListItem>
        <Divider sx={{ my: 2 }} />
        <SectionLabel>時計</SectionLabel>
        <ListItem sx={{ flexDirection: 'column', alignItems: 'stretch', gap: { xs: 1, sm: 1.5 } }}>
          <FormControlLabel
            control={<Switch checked={showDate} onChange={(event) => setShowDate(event.target.checked)} color="primary" />}
            label="日付を表示"
          />
          <FormControl variant="standard" fullWidth>
            <InputLabel htmlFor="time-format-select">時刻フォーマット</InputLabel>
            <NativeSelect
              value={timeFormat}
              onChange={(event) => setTimeFormat(event.target.value as TimeFormat)}
              inputProps={{ name: "time format", id: "time-format-select" }}
              sx={{ pr: 2.5 }}
            >
              {TIME_FORMAT_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </NativeSelect>
          </FormControl>
        </ListItem>
        <Divider sx={{ my: 2 }} />
        <SectionLabel>ポモドーロ</SectionLabel>
        <ListItem sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <FormControlLabel
            control={<Switch checked={showPomodoroControls} onChange={(event) => setShowPomodoroControls(event.target.checked)} color="primary" />}
            label="コントロールを表示"
          />
        </ListItem>
        <Divider sx={{ my: 2 }} />
        <SectionLabel>タイマー</SectionLabel>
        <ListItem sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <FormControlLabel
            control={<Switch checked={showTimerControls} onChange={(event) => setShowTimerControls(event.target.checked)} color="primary" />}
            label="コントロールを表示"
          />
        </ListItem>
      </List>
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
      >
        {list()}
      </SwipeableDrawer>
    </>
  );
});
