import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const MessageArea = ({ messages }) => {
  const { t } = useTranslation();
  const getLocaleString = (key) => t(key);

  const messageItems = useMemo(() => {
    return messages.map((message, index) => <li key={index}>{message}</li>);
  }, [messages]);

  return (
    <div className="message-area" role="alert">
      <h3>{getLocaleString("gantt_chart_bottom_messages")}:</h3>
      <ul>{messageItems}</ul>
    </div>
  );
};
