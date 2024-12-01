import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import moment from "moment";
import { StageMode } from "../../../constants";
import { getRoles, ToastService } from "../../../services";
import { useSelector } from "react-redux";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const StageTable = ({ data, onChange, disable, planStart, showRanges }) => {
  const { t } = useTranslation();
  const [stages, setStages] = useState([]);
  const [signedRoles, setSignedRoles] = useState([]);
  const allStages = useSelector((state) => state.stageReducer.stages);
  const getLocaleString = (key) => t(key);

  useEffect(() => {
    let query = {};
    query.filters = [
      {
        field: "signature",
        operator: "equals",
        value: true,
      },
    ];
    query.pageSize = 10;
    query.page = 1;
    getRoles(query).then((res) => {
      setSignedRoles(res.rows);
    });
    if (data) {
      const dataStages = JSON.parse(data || "[]");
      const orderedStages = dataStages.sort(
        (a, b) => parseInt(a.order) - parseInt(b.order),
      );
      setStages([
        orderedStages.find(
          (item) => item.stageMode === StageMode.PRESCRIPTIONMODE,
        ),
        ...orderedStages.filter(
          (item) => item.stageMode !== StageMode.PRESCRIPTIONMODE,
        ),
      ]);
    } else {
      const orderedStages = allStages
        .sort((a, b) => parseInt(a.order) - parseInt(b.order))
        .filter((stage) => stage.enabled);
      setStages([
        orderedStages.find(
          (item) => item.stageMode === StageMode.PRESCRIPTIONMODE,
        ),
        ...orderedStages.filter(
          (item) => item.stageMode !== StageMode.PRESCRIPTIONMODE,
        ),
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleChangeStages = () => {
    if (stages.length > 0) {
      let planEnd = planStart;
      for (let i = 0; i < stages.length; i++) {
        if (!stages[i]?.enabled) continue;
        planEnd = moment(planEnd).add(stages[i].days, "days").toString();
      }
      onChange(JSON.stringify(stages), planEnd);
    }
  };

  useEffect(() => {
    handleChangeStages();
    onChange(JSON.stringify(stages));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stages]);

  const handleEnableChange = (ind) => {
    if (!stages[ind].enabled) {
      setStages(
        stages.map((item, index) =>
          ind === index ? { ...item, enabled: true, days: 2 } : { ...item },
        ),
      );
    } else {
      setStages(
        stages.map((item, index) =>
          ind === index ? { ...item, enabled: false, days: 0 } : { ...item },
        ),
      );
    }
  };

  const handlePrintPermissionChange = (stageId) => {
    setStages(
      stages?.map((item) => {
        if (item.id === stageId) {
          let printPermission = item?.printPermission || false;
          printPermission = !printPermission;
          return {
            ...item,
            printPermission,
          };
        } else return item;
      }),
    );
  };

  const handleDaysChange = (ind, value) => {
    if (value >= 0) {
      setStages((prevStages) => {
        const newStages = [];
        //let difference = 0;
        for (let i = 0; i < prevStages.length; i++) {
          if (i < ind) {
            newStages.push(prevStages[i]);
          } else if (i === ind) {
            //difference = value - prevStages[i].days;
            newStages.push({
              ...prevStages[i],
              days: value,
            });
          } else {
            newStages.push({
              ...prevStages[i],
            });
          }
        }
        return newStages;
      });
    } else {
      ToastService.error(getLocaleString("toast_stage_table_value_error"));
    }
  };

  const handlePrintAmountChange = (ind, value) => {
    if (value >= 0) {
      setStages((prevStages) => {
        const newStages = [];
        for (let i = 0; i < prevStages.length; i++) {
          if (i === ind) {
            newStages.push({
              ...prevStages[i],
              printVolume: value,
            });
          } else {
            newStages.push({
              ...prevStages[i],
            });
          }
        }
        return newStages;
      });
    } else {
      ToastService.error(getLocaleString("toast_stage_table_value_error"));
    }
  };

  const handleApproverChange = (stageId, role) => {
    setStages(
      stages?.map((item) => {
        if (item.id === stageId) {
          let approvers = item?.approvers || [];
          if (approvers.includes(role)) {
            approvers = approvers.filter((item) => item !== role);
          } else {
            approvers.push(role);
          }
          return {
            ...item,
            approvers,
          };
        } else return item;
      }),
    );
  };

  const getRange = (ind) => {
    let start = moment(planStart).toString();
    for (let i = 0; i < ind; i++) {
      start = moment(start).add(stages[i].days, "days").toString();
    }
    return {
      start: moment(start).format("YYYY-MM-DD"),
      end: moment(start)
        .add(stages[ind].days - 1, "days")
        .format("YYYY-MM-DD"),
    };
  };

  const checkItemDisabled = (item) => {
    return !allStages.find((stage) => stage.stageMode === item?.stageMode)
      ?.enabled;
  };

  return (
    <TableContainer component={Paper} sx={{ width: "100%", padding: "8px" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="center">
              {getLocaleString("stage_table_column_stage")}
            </TableCell>
            <TableCell align="center">
              {getLocaleString("common_table_enable")}
            </TableCell>
            <TableCell align="center">
              {getLocaleString("common_table_print_enable")}
            </TableCell>
            <TableCell align="center">
              {getLocaleString("common_table_print_volume")}
            </TableCell>
            <TableCell align="center">
              {getLocaleString("stage_table_column_day")}
            </TableCell>
            {signedRoles.map((item, index) => (
              <TableCell
                key={index}
                align="center"
                sx={{ paddingX: "0 !important" }}
              >
                {item.name}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {stages.map((row, index) => (
            <TableRow
              key={index}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell align="center">
                {row.stageMode}
                {checkItemDisabled(row) && (
                  <Chip
                    label="Disabled"
                    icon={<WarningAmberIcon sx={{ fontSize: "16px" }} />}
                    color="warning"
                    sx={{ marginLeft: "0.5rem" }}
                  />
                )}
              </TableCell>
              <TableCell align="center">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={row.enabled}
                      onChange={() => handleEnableChange(index)}
                    />
                  }
                  label={""}
                  disabled={disable}
                />
              </TableCell>
              <TableCell align="center">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={row.printPermission}
                      onChange={() => handlePrintPermissionChange(row?.id)}
                    />
                  }
                  label={""}
                  disabled={
                    !row.enabled ||
                    row?.stageMode === StageMode.PRESCRIPTIONMODE
                  }
                />
              </TableCell>
              <TableCell align="center">
                <TextField
                  value={row.printVolume}
                  type="number"
                  onChange={(e) =>
                    handlePrintAmountChange(index, e.target.value)
                  }
                  disabled={!row.printPermission}
                />
              </TableCell>
              <TableCell align="center">
                <TextField
                  sx={{
                    "& .MuiInputBase-root": {
                      height: "2rem",
                      width: "10rem",
                      marginX: "auto",
                    },
                  }}
                  type="number"
                  disabled={!row.enabled || disable}
                  value={row.days}
                  onChange={(e) => handleDaysChange(index, e.target.value)}
                />
                {row.enabled && showRanges && (
                  <Box>
                    {getRange(index).start}~{getRange(index).end}
                  </Box>
                )}
              </TableCell>
              {signedRoles.map((item, index) => (
                <TableCell
                  key={index}
                  align="center"
                  sx={{ paddingX: "0 !important" }}
                >
                  {row.stageMode !== StageMode.PRESCRIPTIONMODE && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!row?.approvers?.includes(item.name)}
                          onChange={() =>
                            handleApproverChange(row?.id, item.name)
                          }
                        />
                      }
                      label={""}
                      sx={{ margin: "0 !important" }}
                    />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StageTable;
