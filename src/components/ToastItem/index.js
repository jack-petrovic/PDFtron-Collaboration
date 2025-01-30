import React, { useEffect, useState } from "react";
import { Alert, Fade } from "@mui/material";
import { useDispatch } from "react-redux";
import { closeToast } from "../../redux/actions";
import { StyledSnackbar } from "./style";

export const ToastItem = ({ index, item }) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState({
    open: false,
    message: "",
    severity: undefined,
    Transition: Fade,
  });

  useEffect(() => {
    if (item) {
      setOpen({
        ...open,
        severity: item?.severity,
        message: item?.message,
        open: true,
      });
      const timer = setTimeout(() => {
        dispatch(closeToast());
      }, item.autoHideDuration || 3000);
      return () => clearTimeout(timer);
    } else {
      setOpen({
        ...open,
        open: false,
      });
      setTimeout(() => {
        setOpen((originOpen) => ({
          ...originOpen,
          message: "",
          severity: undefined,
        }));
      }, 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  const handleClose = () => setOpen(false);

  return (
    <StyledSnackbar
      open={open.open}
      sx={{ transform: `translateY(${(index + 1) * 50}px)` }}
      anchorOrigin={{
        horizontal: item.xPosition || "right",
        vertical: item?.yPosition || "top",
      }}
      onClose={handleClose}
      autoHideDuration={10000}
      TransitionComponent={open.Transition}
    >
      <Alert variant="filled" severity={open.severity} onClose={handleClose}>
        {open.message}
      </Alert>
    </StyledSnackbar>
  );
};
