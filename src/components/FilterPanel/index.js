import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import styles from "./styles";

const FilterPanel = ({ filter, onChangeFilter }) => {
  const [sectionId, setSectionId] = useState(0);
  const [subSection, setSubSection] = useState("");
  const sections = useSelector((state) => state.sectionReducer.sections);
  const subSections = useSelector(
    (state) => state.subSectionReducer.subSections,
  );

  useEffect(() => {
    setSubSection("");
  }, [sectionId]);

  const handleChangeSectionId = (e) => {
    const selectedSection = sections.find(
      (item) => item.name === e.target.value,
    );
    setSectionId(selectedSection ? selectedSection.id : 0);
    onChangeFilter("section", e.target.value);
  };

  const handleChangeSubSectionId = (e) => {
    setSubSection(e.target.value);
    onChangeFilter("subSection", e.target.value);
  };

  const availableSubSections = useMemo(() => {
    return sectionId
      ? subSections.filter((item) => item.sectionId === sectionId)
      : [];
  }, [sectionId, subSections]);

  return (
    <Box sx={styles.root}>
      <Typography marginBottom={2} variant="subtitle2" sx={styles.label}>
        Please select filter conditions:
      </Typography>
      <Box display="flex" gap={2}>
        <DatePicker
          format="yyyy-M"
          label="Month"
          value={filter.date}
          onChange={(value) => onChangeFilter("date", value)}
        />
        <FormControl variant="filled" sx={styles.select}>
          <InputLabel size="small">Section</InputLabel>
          <Select
            value={filter.section}
            onChange={handleChangeSectionId}
            aria-label="Select Section"
          >
            <MenuItem value="">No select ...</MenuItem>
            {sections.map((option) => (
              <MenuItem key={option.id} value={option.name}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {filter.section && (
          <FormControl variant="filled" sx={styles.select}>
            <InputLabel size="small">Sub Section</InputLabel>
            <Select
              value={subSection}
              onChange={handleChangeSubSectionId}
              aria-label="Select Sub Section"
            >
              <MenuItem value="">No select ...</MenuItem>
              {availableSubSections.map((option) => (
                <MenuItem key={option.id} value={option.name}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>
    </Box>
  );
};

export default FilterPanel;
