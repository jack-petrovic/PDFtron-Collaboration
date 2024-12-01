import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import CompareText from "../../components/CompareText";
import "react-quill/dist/quill.snow.css";
import { getAllPlans, getPrescription, ToastService } from "../../services";
import { UserRoles } from "../../constants";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { CompareTextWrapper } from "./style";

const compareItems = [
  {
    label: "Editor vs Submaster",
    value: 0,
    labels: ["Editor", "Sub Master"],
  },
  {
    label: "Submaster vs Master",
    value: 1,
    labels: ["Sub Master", "Master"],
  },
  {
    label: "Editor vs Master",
    value: 2,
    labels: ["Editor", "Master"],
  },
];

const TextComparePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { prescriptionId } = useParams();

  const [plans, setPlans] = useState([]);
  const [plan, setPlan] = useState();
  const [prescription, setPrescription] = useState();
  const [compareItem, setCompareItem] = useState(0);
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [firstRole, setFirstRole] = useState("");
  const [secondRole, setSecondRole] = useState("");
  const [status, setStatus] = useState("");
  const [subMasterStatus, setSubMasterStatus] = useState(0);
  const [masterStatus, setMasterStatus] = useState(0);
  const [canCompare, setCanCompare] = useState(false);

  const getLocaleString = (key) => t(key);

  useEffect(() => {
    getAllPlans()
      .then((data) => {
        setPlans(data.rows);
      })
      .catch((err) => {
        ToastService.showHttpError(
          err,
          getLocaleString("toast_load_plans_failed"),
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getPrescription(prescriptionId)
      .then((res) => {
        setPrescription(res);
      })
      .catch((err) => {
        console.log("err=>", err);
        ToastService.error(
          getLocaleString(
            err.response?.data?.message || "common_network_error",
          ),
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const labels = compareItems.find(
      (item) => item.value === compareItem,
    )?.labels;
    setFirstRole(labels[0]);
    setSecondRole(labels[1]);
  }, [compareItem]);

  useEffect(() => {
    if (prescription) {
      const planData = plans?.find((plan) => plan?.id === prescription?.planId);
      setPlan(planData);

      const status = JSON.parse(prescription?.approvalStatus);
      setMasterStatus(status[UserRoles.MASTER]);
      setSubMasterStatus(status[UserRoles.SUBMASTER]);

      const compareText = JSON.parse(prescription?.content);
      setText1(compareText[firstRole]?.text);
      setText2(compareText[secondRole]?.text);
    }
  }, [prescription, plans, firstRole, secondRole]);

  useEffect(() => {
    if (firstRole === UserRoles.EDITOR && secondRole === UserRoles.SUBMASTER) {
      if (subMasterStatus !== 1) {
        setCanCompare(false);
        setStatus("sub_master_approve_error");
      } else {
        setCanCompare(true);
      }
    } else if (
      (firstRole === UserRoles.EDITOR && secondRole === UserRoles.MASTER) ||
      (firstRole === UserRoles.SUBMASTER && secondRole === UserRoles.MASTER)
    ) {
      if (subMasterStatus !== 1) {
        setCanCompare(false);
        setStatus("sub_master_approve_error");
      } else if (subMasterStatus === 1 && masterStatus !== 1) {
        setCanCompare(false);
        setStatus("master_approve_error");
      } else if (subMasterStatus === 1 && masterStatus === 1) {
        setCanCompare(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text1, text2, firstRole, secondRole]);

  const handleChangeCompareItem = (e) => {
    setCompareItem(e.target.value);
  };

  const handleReturn = () => {
    navigate(`/main-flow/plan/${plan.id}/prescriptions`);
  };

  return (
    <CompareTextWrapper width="100%">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        pr={2}
        mb={2.5}
      >
        <Typography variant="h4">
          {plan?.title} - {prescription?.title}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIosIcon />}
          color="secondary"
          onClick={handleReturn}
        >
          {getLocaleString("common_go_back")} {/* Ensure consistent naming */}
        </Button>
      </Box>
      <Box
        sx={{
          minWidth: 200,
          maxWidth: 300,
          mt: 2,
          mb: 2,
        }}
      >
        <FormControl fullWidth>
          <InputLabel id="compare-label">
            {getLocaleString("select_compare_label")}
          </InputLabel>
          <Select
            labelId="compare-label"
            id="compare-select"
            value={compareItem}
            label={getLocaleString("select_compare_label")}
            onChange={(e) => handleChangeCompareItem(e)}
          >
            {compareItems.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {!canCompare && (
        <Box sx={{ fontSize: "1.25rem", color: "red" }}>
          {getLocaleString(status)}
        </Box>
      )}
      {text1 && text2 && canCompare && (
        <React.Fragment>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <Typography variant="h5">
                {getLocaleString(`${firstRole}`)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h5">
                {getLocaleString(`${secondRole}`)}
              </Typography>
            </Grid>
          </Grid>
          <CompareText text1={text1} text2={text2} />
        </React.Fragment>
      )}
    </CompareTextWrapper>
  );
};

export default TextComparePage;
