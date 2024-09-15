import * as React from "react";
import { useState, memo } from "react";
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
import {
  STORAGE_KEY_FETCH_TIMESTAMP,
  STORAGE_KEY_INTERVAL_TIME,
} from "~/constants/keyName";

interface SettingDrawerProps {
  intervalTime: number;
  setIntervalTime: (interval: number) => void;
}

export const SettingDrawer = memo(
  ({ intervalTime, setIntervalTime }: SettingDrawerProps) => {
    const [state, setState] = useState<boolean>(false);

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
        setState(open);

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
                defaultValue={intervalTime || 30 * 60 * 1000}
                inputProps={{
                  name: "interval time",
                  id: "uncontrolled-native",
                }}
                onChange={handleIntervalTimeChange}
              >
                <option value={15 * 60 * 1000}>15分</option>
                <option value={30 * 60 * 1000}>30分</option>
                <option value={60 * 60 * 1000}>1時間</option>
              </NativeSelect>
            </FormControl>
          </ListItem>
        </List>
        <Divider />
      </Box>
    );

    return (
      <>
        <Button onClick={toggleDrawer()}>
          <BrightnessHighIcon sx={{ color: "white" }} />
        </Button>
        <SwipeableDrawer
          anchor={"left"}
          open={state}
          onClose={toggleDrawer(false)}
          onOpen={toggleDrawer()}
        >
          {list()}
        </SwipeableDrawer>
      </>
    );
  },
);
