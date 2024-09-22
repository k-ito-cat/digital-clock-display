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
import {
  STORAGE_KEY_FETCH_TIMESTAMP,
  STORAGE_KEY_INTERVAL_TIME,
} from "~/constants/keyName";
import Typography from "@mui/material/Typography";
import { DEFAULT_FETCH_INTERVAL } from "~/constants/intervalTime";

interface SettingDrawerProps {
  intervalTime: number;
  setIntervalTime: (interval: number) => void;
  limit: { requestLimit: number; requestRemaining: number };
}

export const SettingDrawer = memo(
  ({ intervalTime, setIntervalTime, limit }: SettingDrawerProps) => {
    const [drawerState, setDrawerState] = useState<boolean>(false);
    const [nextFetchTime, setNextFetchTime] = useState<string | null>(null);

    const formattedDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      // フォーマット
      return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    };

    useEffect(() => {
      const nextFetchTime =
        Number(localStorage.getItem(STORAGE_KEY_FETCH_TIMESTAMP)) +
        intervalTime;

      setNextFetchTime(formattedDate(new Date(nextFetchTime)));
    }, [intervalTime, limit]);

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
        setDrawerState(open);

        const settingButton = document.getElementById("setting-button");
        const classes = ["rotate-45", "scale-150"];
        if (settingButton)
          classes.forEach((className) => {
            settingButton.classList.toggle(className);
          });
      };

    /**
     * インターバル時間の変更
     * インターバル時間が変更された時、ローカルストレージにインターバル時間を保持する
     * また、インターバル時間を変更した際は画像の切り替わりのタイミングを現在時刻からカウントするためにタイムスタンプを初期化する
     */
    const handleIntervalTimeChange = (
      event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
      localStorage.setItem(STORAGE_KEY_INTERVAL_TIME, event.target.value);
      localStorage.setItem(STORAGE_KEY_FETCH_TIMESTAMP, String(Date.now()));
      setIntervalTime(Number(event.target.value));
    };

    const list = () => (
      <Box
        role="presentation"
        onKeyDown={toggleDrawer(false)}
        sx={{ width: 300 }}
      >
        <List>
          <ListItem>
            <FormControl fullWidth>
              <InputLabel variant="standard" htmlFor="uncontrolled-native">
                背景画像が切り替わる間隔
              </InputLabel>
              <NativeSelect
                defaultValue={intervalTime || DEFAULT_FETCH_INTERVAL}
                inputProps={{
                  name: "interval time",
                  id: "uncontrolled-native",
                }}
                onChange={handleIntervalTimeChange}
              >
                <option value={15 * 60 * 1000}>15分</option>
                <option value={30 * 60 * 1000}>30分</option>
                <option value={60 * 60 * 1000}>1時間</option>
                <option value={6 * 60 * 60 * 1000}>6時間</option>
                <option value={12 * 60 * 60 * 1000}>12時間</option>
                <option value={24 * 60 * 60 * 1000}>1日</option>
              </NativeSelect>
            </FormControl>
          </ListItem>
          <ListItem
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Typography
              variant="overline"
              gutterBottom
              sx={{ display: "block" }}
            >
              次の画像切り替わり時間
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
            <Typography
              variant="overline"
              gutterBottom
              sx={{ display: "block" }}
            >
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
        <Button
          id="setting-button"
          onClick={toggleDrawer()}
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
  },
);
