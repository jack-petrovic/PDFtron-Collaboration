import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { InputLabel, MenuItem, Select } from "@mui/material";
import { useSelector } from "react-redux";

export const Toolbar = ({ onZoomChange, zoom, onFilterChange }) => {
  const { t } = useTranslation();
  const getLocaleString = (key) => t(key);
  const sections = useSelector((state) => state.sectionReducer.sections);

  const handleChangeFilter = (e) => {
    onFilterChange(e.target.value);
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, zoomOptions]);

  return (
    <div className="sm:flex justify-between items-end h-full">
      <div className="flex justify-between items-center w-44 pt-2">
        <InputLabel id="section-label" className="filter_label">
          <b>{getLocaleString("menu_filter")}: </b>
        </InputLabel>
        <Select
          labelId="section-label"
          id="filter-select"
          defaultValue="All"
          onChange={handleChangeFilter}
          className="h-7 w-28"
        >
          <MenuItem key="all-section" value="All" className="h-8">
            {getLocaleString("common_table_all_sections")}
          </MenuItem>
          {sections.map((section) => (
            <MenuItem key={section.id} value={section.name}>
              {section.name}
            </MenuItem>
          ))}
        </Select>
      </div>
      <div className="pt-2">
        <b>{getLocaleString("gantt_chart_toolbar_title")}: </b>
        {zoomRadios}
      </div>
    </div>
  );
};
