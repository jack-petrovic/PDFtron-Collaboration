import React, { useEffect, useState, useTransition } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { Box, Button, Grid, Typography } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import moment from "moment";
import {
  getPlan,
  updatePlan,
  getPrescriptions,
  getDocuments,
  ToastService,
} from "../services";
import TimeLine from "../components/TimeLine/TimeLine";
import { useSelector } from "react-redux";
import { useAuthState } from "../hooks/redux";
import { UserRoles } from "../constants";

const PlanStatus = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [plan, setPlan] = useState();
  const { t } = useTransition();

  const { account } = useAuthState();
  const keyword = useSelector((state) => state.headerReducer.search);
  const getLocaleString = (key) => t(key);

  useEffect(() => {
    getPlan(id)
      .then((res) => {
        setPlan(res);
      })
      .catch((err) => {
        console.log("err=>", err);
      });
  }, [id]);

  const handleReturn = () => {
    navigate("/main-flow");
  };

  const getAllPrescriptions = () => {
    let query = {};
    query.pageSize = 100;
    query.page = 1;
    query.keyword = keyword;
    query.planId = id;
    query.userId = account.id;
    return getPrescriptions(query);
  };

  const getAllLiveDocuments = () => {
    let query = {};
    query.pageSize = 100;
    query.page = 1;
    query.keyword = keyword;
    return getDocuments(query);
  };

  const pushStageToNext = async () => {
    try {
      await updatePlan(plan?.id, {
        ...plan,
        currentStage: Number(plan.currentStage) + 1,
      }).then((res) => {
        ToastService.success(getLocaleString(res.message));
      });

      await getPlan(id).then((res) => {
        setPlan(res);
        ToastService.success(getLocaleString("toast_plan_go_next_step"));
      });
    } catch (err) {
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
  };

  const handleUpdateCurrentStage = async () => {
    let enablePass = false,
      approvalStatus;
    await getAllLiveDocuments()
      .then((res) => {
        const currentDocument = res.rows?.find((item) => {
          let r = false;
          if (Number(item.stage) === Number(plan.currentStage)) {
            if (item.planId === plan.id) {
              r = true;
            }
          }
          return r;
        });
        approvalStatus = JSON.parse(currentDocument?.approvalStatus || "{}");
        if (
          approvalStatus[UserRoles.MASTER] === 1 &&
          approvalStatus[UserRoles.SUBMASTER] === 1
        ) {
          enablePass = true;
        }
      })
      .catch((err) => {
        console.log("err=>", err);
      });
    if (enablePass) {
      pushStageToNext();
    } else {
      ToastService.error(
        getLocaleString("toast_document_approve_status_failed"),
      );
    }
  };

  const handlePrescriptionStage = async () => {
    let prescriptions = [],
      enablePass = false;
    await getAllPrescriptions()
      .then((res) => {
        prescriptions.push(res.rows);
      })
      .catch((err) => {
        console.log("err=>", err);
      });
    prescriptions.map((prescription, _) => {
      prescription.map((item) => {
        const approvalStatus = JSON.parse(item?.approvalStatus || "{}");
        if (
          approvalStatus[UserRoles.MASTER] === 1 &&
          approvalStatus[UserRoles.SUBMASTER] === 1
        ) {
          enablePass = true;
        }
      });
    });
    if (enablePass) {
      pushStageToNext();
    } else {
      ToastService.warning(
        getLocaleString("toast_prescriptions_status_warning"),
      );
    }
  };

  const handleNextStage = () => {
    if (window.confirm("Do you want to move the plan to the next stage!")) {
      if (plan?.currentStage === "0") {
        handlePrescriptionStage().then((res) => {});
      } else {
        handleUpdateCurrentStage().then((res) => {});
      }
    }
  };

  const handleMarkCompleted = () => {
    if (window.confirm("Do you really want to mark this plan as completed?")) {
      updatePlan(plan?.id, {
        ...plan,
        completed: true,
      })
        .then((res) => {
          ToastService.success(getLocaleString("toast_mark_plan_success"));
        })
        .catch((err) => {
          console.log("err=>", err);
          ToastService.error(getLocaleString("common_network_error"));
        });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box marginX="auto" width="80%" paddingY="1rem">
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          my={4}
          px={4}
        >
          <Typography variant="h4" mb={2} color="primary" fontWeight="medium">
            {plan?.title}
          </Typography>
          <KeyboardReturnIcon
            color="primary"
            cursor="pointer"
            onClick={handleReturn}
          />
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <Box pl={4}>
              <Typography fontSize="1.5rem" mb={8}>
                Plan Information
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography fontSize="1.2rem" color="gray" width="150px">
                  Section:
                </Typography>
                <Typography fontSize="1.2rem" fontWeight="medium" pl={2}>
                  {plan?.section.name}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography fontSize="1.2rem" color="gray" width="150px">
                  Sub Section:
                </Typography>
                <Typography fontSize="1.2rem" fontWeight="medium" pl={2}>
                  {plan?.subsection.name}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography fontSize="1.2rem" color="gray" width="150px">
                  Duration:
                </Typography>
                <Typography fontSize="1.2rem" pl={2}>
                  {moment(plan?.startDate).format("YYYY.MM.DD")} ~ " "
                  {moment(plan?.endDate).format("YYYY.MM.DD")}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography fontSize="1.2rem" color="gray" width="150px">
                  Created:
                </Typography>
                <Typography fontSize="1.2rem" pl={2}>
                  {moment(plan?.createdAt).format("YYYY.MM.DD HH:mm")}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography fontSize="1.2rem" color="gray" width="150px">
                  Type:
                </Typography>
                <Typography fontSize="1.2rem" pl={2}>
                  {plan?.plan_type?.name}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography fontSize="1.2rem" color="gray" width="150px">
                  Current Stage:
                </Typography>
                <Typography fontSize="1.2rem" pl={2}>
                  {plan?.currentStage}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={4}>
                <Typography fontSize="1.2rem" color="gray" width="150px">
                  Completed:
                </Typography>
                <Typography fontSize="1.2rem" pl={2}>
                  {plan?.completed ? "Yes" : "No"}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleNextStage}
                  disabled={plan?.completed}
                >
                  {getLocaleString("common_next_stage_button")}
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleMarkCompleted}
                  sx={{ marginLeft: "0.5rem" }}
                  disabled={plan?.completed}
                >
                  Mark completed
                </Button>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={8}>
            <Box width="100%">
              <Box mb={4}>
                <Typography fontSize="1.5rem" textAlign="center">
                  Plan Status
                </Typography>
                <Typography textAlign="center">
                  ({moment(plan?.startDate).format("YYYY-MM-DD")} ~ " "
                  {moment(plan?.endDate).format("YYYY-MM-DD")})
                </Typography>
              </Box>
              <TimeLine planData={plan} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default PlanStatus;
