import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { lastDayOfMonth } from "date-fns";
import styles, { tableCellStyle } from "./styles";
import { getPrintLogs } from "../../../services";
import FilterPanel from "../../../components/FilterPanel";
import { useSelector } from "react-redux";

const PrintLogs = () => {
  const [data, setData] = useState([]);
  const paperSizes = useSelector((state) => state.paperSizeReducer.paperSizes);

  const [filter, setFilter] = useState({
    date: new Date(),
    section: "",
    subSection: "",
  });

  const onChangeFilter = (key, value) => {
    setFilter((prev) => {
      const newFilter = { ...prev, [key]: value };
      if (key === "section") {
        newFilter.subSection = null;
      }
      return newFilter;
    });
  };

  const days = useMemo(
    () => lastDayOfMonth(new Date(filter.date)).getDate(),
    [filter.date],
  );

  const initialData = useMemo(
    () =>
      new Array(days).fill(1).map((_, index) => {
        const row = {};

        paperSizes.forEach((field) => {
          row[field.key] = field.key === "date" ? index + 1 : 0;
        });

        return row;
      }),
    [days],
  );

  useEffect(() => {
    setData(initialData);
  }, [filter.date, initialData]);

  const getPrintRequests = () => {
    getPrintLogs(filter)
      .then((res) => {
        const monthData = res.rows.filter((item) => item.date <= days);
        setData(monthData);
      })
      .catch((e) => {
        console.log("api error", e);
      });
  };

  useEffect(() => {
    getPrintRequests();
    // eslint-disable-next-line
  }, [filter]);

  const sum = useMemo(() => {
    if (data.length > 0) {
      const temp = {};
      let totalValue = 0;

      Object.keys(data[0]).forEach((key) => {
        if (!["date", "total"].includes(key.toLowerCase())) {
          temp[key] = 0;
          data.forEach((item) => {
            temp[key] += item[key];
            totalValue += item[key];
          });
        }
      });
      return { ...temp, totalValue };
    }
    return undefined;
  }, [data]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} sx={{ padding: "50px" }}>
      <FilterPanel filter={filter} onChangeFilter={onChangeFilter} />
      <Box sx={styles.tableContainer}>
        <Table size="small" stickyHeader sx={styles.table}>
          <TableHead>
            <TableRow>
              <TableCell component="th" align="center" sx={styles.tableHeader}>
                {"Date"}
              </TableCell>
              {paperSizes.map((field, index) => (
                <TableCell
                  key={index}
                  component="th"
                  align="center"
                  sx={styles.tableHeader}
                >
                  {field.name}
                </TableCell>
              ))}
              <TableCell align="center" sx={styles.tableHeader}>
                Total
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index} sx={{ background: index % 2 && "#f7f7f7" }}>
                <TableCell align="center" sx={{ ...tableCellStyle }}>
                  {item.date}
                </TableCell>
                {paperSizes.map((field, i) => (
                  <TableCell
                    key={i}
                    align="center"
                    sx={{ ...tableCellStyle, background: i === 0 && "#ececec" }}
                  >
                    {item[field.name]}
                  </TableCell>
                ))}
                <TableCell align="center">{item.total}</TableCell>
              </TableRow>
            ))}
            {sum?.totalValue > 0 &&
              Object.keys(sum).map((key, index) => (
                <TableRow key={index}>
                  {index === 0 && (
                    <TableCell
                      rowSpan={paperSizes.length + 1}
                      colSpan={paperSizes.length - 1}
                      sx={tableCellStyle}
                    />
                  )}
                  <TableCell align="center" sx={styles.sumLabel}>
                    {key === "totalValue" ? "Total" : key}
                  </TableCell>
                  <TableCell align="center" sx={styles.sumValue}>
                    {sum[key]}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Box>
    </LocalizationProvider>
  );
};

export default PrintLogs;
