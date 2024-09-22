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
import {
  DEFAULT_FETCH_INTERVAL,
  INTERVAL_TIME,
} from "~/constants/intervalTime";
import { formattedDate } from "~/utils/dateFormat";
import { useSettingHandler } from "~/hooks/useSettingHandler";
import { getNextFetchTime } from "~/utils/nextFetchTime";
import { AddToHomeScreenButton } from "./AddToHomeScreenButton";

// TODO: type model
interface SettingDrawerProps {
  limit: { requestLimit: number; requestRemaining: number };
}

export const SettingDrawer = memo(({ limit }: SettingDrawerProps) => {
  const [drawerState, setDrawerState] = useState<boolean>(false);
  const [nextFetchTime, setNextFetchTime] = useState<string | null>(null);

  const { intervalTime } = useSettingHandler();

  useEffect(() => {
    const nextFetchTime = getNextFetchTime(intervalTime.state);

    setNextFetchTime(formattedDate(new Date(nextFetchTime)));
  }, [intervalTime.state, limit]);

  const addSettingIconAnimation = () => {
    const settingButton = document.getElementById("setting-button");
    const classes = ["rotate-45", "scale-150"];
    if (settingButton) {
      classes.forEach((className) => {
        settingButton.classList.toggle(className);
      });
    }
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
      setDrawerState(open);
      addSettingIconAnimation();
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
        <ListItem>
          <AddToHomeScreenButton />
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
});
