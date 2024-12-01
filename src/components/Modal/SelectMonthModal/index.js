import React from "react";
import { Box, Dialog, TextField } from "@mui/material";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useTranslation } from "react-i18next";

const SelectMonthModal = ({ open, close, select }) => {
  const { t } = useTranslation();
  const getLocaleString = (key) => t(key);
  const handleMonth = (date) => {
    date ? select(date) : alert(getLocaleString("modal_select_month_alert"));
  };
  const handleClose = () => {
    close();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={handleClose}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <StaticDatePicker
            orientation="landscape"
            localeText={{ toolbarTitle: "Date Picker" }}
            views={["month", "year"]}
            slots={{
              textField: (params) => <TextField {...params} />,
            }}
            onAccept={(date) => handleMonth(date)}
            onClose={handleClose}
          />
        </Box>
      </Dialog>
    </LocalizationProvider>
  );
};

export default SelectMonthModal;
