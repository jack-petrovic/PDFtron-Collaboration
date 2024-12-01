import * as React from "react";
import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import { Alert } from "@mui/material";
import { Box } from "@mui/system";

export default function CustomSnackbar() {
  const [snackPack, setSnackPack] = useState([]);
  const [open, setOpen] = useState(false);
  const [messageInfo, setMessageInfo] = useState(undefined);

  useEffect(() => {
    if (snackPack.length && !messageInfo) {
      // Set a new snack when we don't have an active one
      setMessageInfo({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setOpen(true);
    } else if (snackPack.length && messageInfo && open) {
      // Close an active snack when a new one is added
      setOpen(false);
    }
  }, [snackPack, messageInfo, open]);

  const handleClick = (message, type) => () => {
    setSnackPack((prev) => [
      ...prev,
      { message, key: new Date().getTime(), type },
    ]);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const handleExited = () => setMessageInfo(undefined);

  return (
    <Box display="flex" flexWrap="wrap" gap={2}>
      <Button
        color="success"
        variant="contained"
        onClick={handleClick("This is a success message!", "success")}
      >
        Show success message
      </Button>
      <Button
        variant="outlined"
        color="error"
        onClick={handleClick("This is an error message!", "error")}
      >
        Show error message
      </Button>
      <Snackbar
        key={messageInfo ? messageInfo.key : undefined}
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        TransitionProps={{ onExited: handleExited }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleClose}
          severity={messageInfo?.type}
          sx={{ width: "100%" }}
        >
          {messageInfo?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
