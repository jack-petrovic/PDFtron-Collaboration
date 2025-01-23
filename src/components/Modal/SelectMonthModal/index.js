import React from "react";
import { Box, Dialog, TextField } from "@mui/material";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useTranslation } from "react-i18next";

const SelectMonthModal = ({ open, close, select }) => {
  const { t } = useTranslation();
  const getLocaleString = (key) => t(key);
  const handleMonthSelect = (date) => {
    date ? select(date) : alert(getLocaleString("modal_select_month_alert"));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={close}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
          padding={2}
        >
          <StaticDatePicker
            orientation="landscape"
            views={["month", "year"]}
            onAccept={handleMonthSelect}
            onClose={close}
            renderInput={(params) => <TextField {...params} />}
          />
        </Box>
      </Dialog>
    </LocalizationProvider>
  );
};

export default SelectMonthModal;
