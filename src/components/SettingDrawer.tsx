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
import type { TimeFormat } from "~/hooks/useCurrentTime";

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

  const list = () => (
    <Box
      role="presentation"
      onKeyDown={toggleDrawer(false)}
      sx={{ width: 300 }}
    >
      <List>
        <ListItem>
          <Stack spacing={1} width="100%">
            <Button
              variant="outlined"
              startIcon={<PhotoIcon />}
              onClick={() => fileInputRef.current?.click()}
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
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<CloudUploadIcon />}
              onClick={() => clearCustomBackground()}
            >
              Unsplashに戻す
            </Button>
          </Stack>
        </ListItem>
        <Divider sx={{ my: 1 }} />
        <ListItem>
          <FormControl fullWidth>
            <InputLabel variant="standard" htmlFor="unsplash-query-select">
              Unsplashカテゴリ
            </InputLabel>
            <NativeSelect
              value={query}
              onChange={(event) => changeQuery(event.target.value)}
              inputProps={{
                name: "unsplash query",
                id: "unsplash-query-select",
              }}
            >
              {UNSPLASH_QUERIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </NativeSelect>
          </FormControl>
        </ListItem>
        <Divider sx={{ my: 1 }} />
        <ListItem>
          <FormControl fullWidth>
            <InputLabel variant="standard" htmlFor="uncontrolled-native">
              別の背景画像へ切り替わるまでの間隔
            </InputLabel>
            <NativeSelect
              defaultValue={intervalTime.state || DEFAULT_FETCH_INTERVAL}
              inputProps={{
                name: "interval time",
                id: "uncontrolled-native",
              }}
              onChange={intervalTime.handler}
            >
              {INTERVAL_TIME.map((time) => {
                return (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                );
              })}
            </NativeSelect>
          </FormControl>
        </ListItem>
        <ListItem>
          <FormControl fullWidth>
            <InputLabel variant="standard" htmlFor="cursor-hide-select">
              カーソルを非表示にするまでの秒数
            </InputLabel>
            <NativeSelect
              value={cursorHideSeconds}
              onChange={(event) =>
                setCursorHideSeconds(Number(event.target.value) || 3)
              }
              inputProps={{
                name: "cursor hide seconds",
                id: "cursor-hide-select",
              }}
            >
              {CURSOR_SECONDS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </NativeSelect>
          </FormControl>
        </ListItem>
        <ListItem>
          <FormControlLabel
            control={
              <Switch
                checked={showDate}
                onChange={(event) => setShowDate(event.target.checked)}
                color="primary"
              />
            }
            label="日付を表示"
          />
        </ListItem>
        <ListItem>
          <FormControl fullWidth>
            <InputLabel variant="standard" htmlFor="time-format-select">
              時刻フォーマット
            </InputLabel>
            <NativeSelect
              value={timeFormat}
              onChange={(event) => setTimeFormat(event.target.value as TimeFormat)}
              inputProps={{
                name: "time format",
                id: "time-format-select",
              }}
            >
              {TIME_FORMAT_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </NativeSelect>
          </FormControl>
        </ListItem>
        <Divider sx={{ my: 1 }} />
        <ListItem>
          <FormControlLabel
            control={
              <Switch
                checked={showPomodoroControls}
                onChange={(event) => setShowPomodoroControls(event.target.checked)}
                color="primary"
              />
            }
            label="ポモドーロのコントロールを表示"
          />
        </ListItem>
        <ListItem>
          <FormControlLabel
            control={
              <Switch
                checked={showTimerControls}
                onChange={(event) => setShowTimerControls(event.target.checked)}
                color="primary"
              />
            }
            label="タイマーのコントロールを表示"
          />
        </ListItem>
        <ListItem
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <Typography variant="overline" gutterBottom sx={{ display: "block" }}>
            別の画像へ切り替わる時間
          </Typography>
          <p>{nextFetchTime}</p>
        </ListItem>
        <ListItem
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <Typography variant="overline" gutterBottom sx={{ display: "block" }}>
            １時間あたりのリクエスト上限回数
          </Typography>
          <Stack direction="row" spacing={1}>
            {limit.requestRemaining > 25 ? (
              <Chip
                label={limit.requestRemaining + " / " + limit.requestLimit}
                color="success"
              />
            ) : limit.requestRemaining <= 25 ? (
              <Chip
                label={limit.requestRemaining + " / " + limit.requestLimit}
                color="warning"
              />
            ) : limit.requestRemaining <= 0 ? (
              <Chip
                label={limit.requestRemaining + " / " + limit.requestLimit}
                color="error"
              />
            ) : null}
          </Stack>
        </ListItem>
      </List>
      <Divider />
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
