import React from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from "@mui/material";

const ConfirmModal = ({
  open,
  close,
  handleClick,
  handleClickCancel,
  content,
}) => {
  const { t } = useTranslation();
  const getLocaleString = (key) => t(key);

  return (
    <Dialog
      open={open}
      onClose={close}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogContent>
        <Typography id="confirm-dialog-description" variant="body1">
          {getLocaleString(content)}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClickCancel || close}>
          {getLocaleString("modal_status_refuse")}
        </Button>
        <Button onClick={handleClick} autoFocus>
          {getLocaleString("modal_status_accept")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmModal;
