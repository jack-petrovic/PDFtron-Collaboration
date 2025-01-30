import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Checkbox,
  FormControlLabel,
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
import { getRoles } from "../../../services";
import { useSelector } from "react-redux";
import { ArchivedChip, ArchivedIcon } from "../../../pages/style";
import { addDays } from "date-fns";

const StageTable = ({ data, onChange, planStart }) => {
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
    query.pageSize = 100;
    query.page = 0;
    getRoles(query)
      .then((res) => {
        setSignedRoles(res.rows);
      })
      .catch((error) => {
        console.log("error=>", error);
      });
    if (data) {
      const dataStages = JSON.parse(data || "[]");
      const orderedStages = dataStages.sort(
        (a, b) => parseInt(a.order) - parseInt(b.order),
      );
      setStages(orderedStages);
    } else {
      const orderedStages = allStages
        .sort((a, b) => parseInt(a.order) - parseInt(b.order))
        .filter((stage) => stage.enabled);
      setStages(orderedStages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleChangeStages = () => {
    if (stages.length > 0) {
      let planEnd = planStart;
      for (let i = 0; i < stages.length; i++) {
        if (!stages[i]?.enabled) continue;
        planEnd = addDays(new Date(planEnd), stages[i].days);
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
    setStages(
      stages.map((item, index) => {
        if (ind === index) {
          return {
            ...item,
            enabled: !item.enabled,
            printPermission: item.enabled ? false : item.printPermission,
            printVolume: item.enabled ? 0 : item.printVolume,
            days: !item.enabled ? 2 : 0
          };
        }
        return item;
      })
    );
  };

  const handlePrintPermissionChange = (stageId) => {
    setStages(
      stages?.map((item) => {
        if (item.id === stageId) {
          let printPermission = item?.printPermission || false;
          printPermission = !printPermission;
          if (printPermission) {
            return {
              ...item,
              printPermission,
            };
          } else {
            return {
              ...item,
              printPermission,
              printVolume: 0,
            };
          }
        } else return item;
      }),
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === '-') {
      e.preventDefault();
    }
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
        .add(stages[ind].days, "days")
        .format("YYYY-MM-DD"),
    };
  };

  const checkItemDisabled = (item) => {
    return !allStages.find((stage) => stage.stageMode === item?.stageMode)
      ?.enabled;
  };

  return (
    <TableContainer sx={{ width: "100%", padding: "8px" }}>
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
            <TableRow key={index}>
              <TableCell align="center">
                {row?.stageMode}
                {checkItemDisabled(row) && (
                  <ArchivedChip
                    label="Disabled"
                    icon={<ArchivedIcon />}
                    color="warning"
                  />
                )}
              </TableCell>
              <TableCell align="center">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={row?.enabled || false}
                      onChange={() => handleEnableChange(index)}
                    />
                  }
                  label={""}
                />
              </TableCell>
              <TableCell align="center">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={row?.printPermission || false}
                      onChange={() => handlePrintPermissionChange(row?.id)}
                    />
                  }
                  label={""}
                  disabled={
                    !row?.enabled ||
                    row?.stageMode === StageMode.PRESCRIPTIONMODE
                  }
                />
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  sx={{
                    "& .MuiInputBase-root": {
                      height: "2rem",
                      width: "6rem",
                      marginX: "auto",
                    },
                  }}
                  value={(row?.enabled && row?.printPermission) ? row?.printVolume : ''}
                  onKeyDown={handleKeyDown}
                  onChange={(e) =>
                    handlePrintAmountChange(index, e.target.value)
                  }
                  inputProps={{ min: "0" }}
                  disabled={!row?.enabled || !row?.printPermission}
                />
              </TableCell>
              <TableCell align="center">
                <TextField
                  sx={{
                    "& .MuiInputBase-root": {
                      height: "2rem",
                      width: "5rem",
                      marginX: "auto",
                    },
                  }}
                  type="number"
                  disabled={!row?.enabled}
                  value={row?.days}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => handleDaysChange(index, e.target.value)}
                />
                {row?.enabled && (
                  <Box>
                    {getRange(index).start} ~ {getRange(index).end}
                  </Box>
                )}
              </TableCell>
              {signedRoles.map((item, index) => (
                <TableCell
                  key={index}
                  align="center"
                  sx={{ paddingX: "0 !important" }}
                >
                  {row?.stageMode !== StageMode.PRESCRIPTIONMODE && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            !!row?.approvers?.includes(item.name) || false
                          }
                          onChange={() =>
                            handleApproverChange(row?.id, item.name)
                          }
                          disabled={!row?.enabled}
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
