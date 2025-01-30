import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";

export const MessageArea = ({ messages }) => {
  const { t } = useTranslation();
  const getLocaleString = (key) => t(key);

  const messageItems = useMemo(() => {
    return messages.map((message, index) => <li key={index}>{message}</li>);
  }, [messages]);

  return (
    <Box className="message-area" role="alert">
      <Typography variant="h6">{getLocaleString("gantt_chart_bottom_messages")}:</Typography>
      <ul>{messageItems}</ul>
    </Box>
  );
};
