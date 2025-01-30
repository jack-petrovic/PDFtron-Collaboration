import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
} from "@mui/material";
import { dayLabels, monthLabels, weekLabels } from "../../constants";

const Repeat = ({ onChange, data }) => {
  const { t } = useTranslation();
  const [cycle, setCycle] = useState("Weekly");
  const [repeatValue, setRepeatValue] = useState([]);
  const getLocaleString = (key) => t(key);

  useEffect(() => {
    if (data) {
      setCycle(JSON.parse(data || "{}")?.cycle);
      setRepeatValue(JSON.parse(data || "{}")?.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDaySelect = (day) => {
    !repeatValue.includes(day)
      ? setRepeatValue([...repeatValue, day])
      : setRepeatValue(repeatValue.filter((item) => item !== day));
  };

  const handleWeekChange = (item) => {
    repeatValue.includes(item)
      ? setRepeatValue(repeatValue.filter((day) => day !== item))
      : setRepeatValue([...repeatValue, item]);
  };

  const handleYearChange = (item) => {
    repeatValue.includes(item)
      ? setRepeatValue(repeatValue.filter((month) => month !== item))
      : setRepeatValue([...repeatValue, item]);
  };

  const handleRadioChange = (e) => {
    setCycle(e.target.value);
  };

  useEffect(() => {
    let repeats = [];
    switch (cycle) {
      case "Weekly":
        repeats = repeatValue.filter((value) => weekLabels?.includes(value));
        break;
      case "Monthly":
        repeats = repeatValue.filter((value) => dayLabels?.includes(value));
        break;
      case "Yearly":
        repeats = repeatValue.filter((value) => monthLabels?.includes(value));
        break;
      default:
        break;
    }
    onChange(JSON.stringify({ cycle, value: repeats }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycle, repeatValue]);

  return (
    <Box>
      <FormControl fullWidth component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend">
          {getLocaleString("common_table_repeatable")}
        </FormLabel>
        <RadioGroup
          row
          aria-label="gender"
          name="row-radio-buttons-group"
          onChange={handleRadioChange}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <FormControlLabel
            value="Weekly"
            control={<Radio checked={cycle === "Weekly"} />}
            label={getLocaleString("repeat_week_label")}
          />
          <FormControlLabel
            value="Monthly"
            control={<Radio checked={cycle === "Monthly"} />}
            label={getLocaleString("repeat_month_label")}
          />
          <FormControlLabel
            value="Yearly"
            control={<Radio checked={cycle === "Yearly"} />}
            label={getLocaleString("repeat_year_label")}
          />
        </RadioGroup>
        <Box>
          {cycle === "Weekly" &&
            weekLabels.map((item, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={repeatValue.includes(item)}
                    onChange={() => handleWeekChange(item)}
                  />
                }
                label={item}
              />
            ))}
          {cycle === "Monthly" && (
            <Select
              rows={5}
              multiple={true}
              value={repeatValue}
              sx={{ height: "2rem" }}
            >
              {dayLabels.map((item, index) => (
                <MenuItem
                  key={index}
                  value={item}
                  onClick={() => handleDaySelect(item)}
                >
                  {item}
                </MenuItem>
              ))}
            </Select>
          )}
          {cycle === "Yearly" &&
            monthLabels.map((item, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={repeatValue.includes(item)}
                    onChange={() => handleYearChange(item)}
                    size="small"
                  />
                }
                label={item}
              />
            ))}
        </Box>
      </FormControl>
    </Box>
  );
};

export default Repeat;
