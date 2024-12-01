import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const Toolbar = ({ onZoomChange, zoom }) => {
  const { t } = useTranslation();
  const getLocaleString = (key) => t(key);

  const handleZoomChange = (e) => {
    if (onZoomChange) {
      onZoomChange(e.target.value);
    }
  };

  const zoomOptions = [
    { value: "hour", label: getLocaleString("gantt_chart_toolbar_hour") },
    { value: "day", label: getLocaleString("gantt_chart_toolbar_day") },
    { value: "month", label: getLocaleString("gantt_chart_toolbar_month") },
  ];

  const zoomRadios = useMemo(() => {
    return zoomOptions.map(({ value, label }) => {
      const isActive = zoom === value;
      return (
        <label
          key={value}
          className={`radio-label ${isActive ? "radio-label-active" : ""}`}
          htmlFor={value}
        >
          <input
            type="radio"
            id={value}
            checked={isActive}
            onChange={handleZoomChange}
            value={value}
          />
          {label}
        </label>
      );
    });
  }, [zoom, zoomOptions]);

  return (
    <div className="tool-bar">
      <b>{getLocaleString("gantt_chart_toolbar_title")}: </b>
      {zoomRadios}
    </div>
  );
};
