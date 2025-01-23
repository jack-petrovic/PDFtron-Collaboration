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
import { useTranslation } from "react-i18next";

const FilterPanel = ({ filter, onChangeFilter }) => {
  const [sectionId, setSectionId] = useState(0);
  const [subSection, setSubSection] = useState("");
  const { t } = useTranslation();
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
    <Box className="rounded-lg border-2 border-[#d4d4d4] p-5 m-6">
      <Typography marginBottom={2} variant="subtitle2" className="text-[#3c3c3c]">
        {t("print_request_filter_condition")}
      </Typography>
      <Box className="sm:flex columns-3 gap-2">
        <DatePicker
          format="yyyy-M"
          label="Month"
          className="w-full"
          value={filter.date}
          onChange={(value) => onChangeFilter("date", value)}
        />
        <FormControl variant="filled" className="w-full">
          <InputLabel size="small">{t("common_table_section")}</InputLabel>
          <Select
            value={filter.section}
            onChange={handleChangeSectionId}
            aria-label="Select Section"
            className="w-full"
          >
            <MenuItem value="">{t("print_request_no_select")}</MenuItem>
            {sections.map((option) => (
              <MenuItem key={option.id} value={option.name}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {filter.section && (
          <FormControl variant="filled" className="w-full">
            <InputLabel size="small">Sub Section</InputLabel>
            <Select
              value={subSection}
              onChange={handleChangeSubSectionId}
              aria-label="Select Sub Section"
              className="w-full"
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
