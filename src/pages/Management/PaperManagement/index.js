import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getPrintLogs, ToastService } from "../../../services";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import styles, { tableCellStyle } from "./styles";
import { useTranslation } from "react-i18next";

const PaperManagement = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState({
    date: new Date(),
    section: "",
    subSection: "",
  });
  const [consumptionData, setConsumptionData] = useState({});
  const sections = useSelector((state) => state.sectionReducer.sections);
  const subSections = useSelector(
    (state) => state.subSectionReducer.subSections,
  );
  const getLocaleString = (key) => t(key);
  const onChangeFilter = (key, value) => {
    setFilter({
      ...filter,
      [key]: value,
    });
  };

  const handleCalConsumption = async (filter) => {
    try {
      const res = await getPrintLogs(filter);
      return res.totalForMonth;
    } catch (err) {
      ToastService.error(getLocaleString("common_network_error"));
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const newData = {};
      for (const item of subSections) {
        for (const field of sections) {
          const key = `${field.name}-${item.name}`;
          newData[key] = await handleCalConsumption({
            ...filter,
            section: field.name,
            subSection: item.name,
            totalMode: 1,
          });
        }
      }
      setConsumptionData(newData);
    };
    fetchData();
    // eslint-disable-next-line
  }, [filter]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        format="yyyy-M"
        label={getLocaleString("common_table_month")}
        value={filter.date}
        onChange={(value) => onChangeFilter("date", value)}
        sx={{ margin: "20px" }}
      />
      <Box sx={styles.tableContainer}>
        <Table size="small" stickyHeader sx={styles.table}>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={styles.tableHeader} />
              {sections.map((field, index) => (
                <TableCell
                  key={index}
                  component="th"
                  align="center"
                  sx={styles.tableHeader}
                >
                  {field.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {subSections.map((item, index) => (
              <TableRow key={index} sx={{ background: index % 2 && "#f7f7f7" }}>
                <TableCell>{item.name}</TableCell>
                {sections.map((field, i) => {
                  const key = `${field.name}-${item.name}`;
                  return (
                    <TableCell
                      key={i}
                      align="center"
                      sx={{
                        ...tableCellStyle,
                        background: i === 0 && "#ececec",
                      }}
                    >
                      {consumptionData[key] !== undefined
                        ? consumptionData[key]
                        : getLocaleString("current_loading")}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </LocalizationProvider>
  );
};

export default PaperManagement;
