import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthState } from "../../../hooks/redux";
import { Box, Button, Grid, Typography } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import moment from "moment";
import ConfirmModal from "../../../components/Modal/ConfirmModal";
import StageTimeLine from "../../../components/TimeLine/TimeLine";
import { sendNotification } from "../../../utils/helper";
import {
  getPlan,
  updatePlan,
  getStages,
  ToastService,
  getUsers,
} from "../../../services";
import { URL_WEB_SOCKET, UserRoles } from "../../../constants";

const PlanStatus = () => {
  let connection = new WebSocket(URL_WEB_SOCKET);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { account } = useAuthState();
  const [plan, setPlan] = useState();
  const [stages, setStages] = useState([]);
  const [totalStage, setTotalStage] = useState(0);
  const [openNextStageModal, setOpenNextStageModal] = useState(false);
  const [openMarkCompleteModal, setOpenMarkCompleteModal] = useState(false);
  const [users, setUsers] = useState([]);
  const getLocaleString = (key) => t(key);

  useEffect(() => {
    getPlan(id)
      .then((res) => {
        setPlan(res);
        setTotalStage(
          JSON.parse(res.stages).filter((stage) => stage.enabled).length,
        );
      })
      .catch((err) => {
        console.log("err=>", err);
      });
  }, [id]);

  const handleReturn = () => {
    navigate("/main-flow");
  };

  const fetchDocuments = async () => {
    let query = {};
    getUsers(query).then((res) => {
      setUsers(res.rows);
    });
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    let query = {};
    query.pageSize = 10;
    query.page = 1;
    getStages(query)
      .then((res) => setStages(res.rows))
      .catch((err) =>
        ToastService.error(
          getLocaleString(
            err.response?.data?.message || "common_network_error",
          ),
        ),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        sendNotification(
          connection,
          account.id,
          "notification",
          {
            key: "toast_notification_next_stage",
            data: {
              user: account.name,
              currentStage: plan.currentStage,
              movedStage: Number(plan.currentStage) + 1,
            },
          },
          "next",
        );
      });
    } catch (err) {
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
  };

  const handlePrescriptionStage = async () => {
    const enablePass = plan.prescriptions.some((prescription) => {
      const approvalStatus = JSON.parse(prescription?.approvalStatus || "{}");
      return (
        approvalStatus[UserRoles.MASTER] === 1 &&
        approvalStatus[UserRoles.SUBMASTER] === 1
      );
    });

    if (enablePass) {
      pushStageToNext();
    } else {
      ToastService.warning(
        getLocaleString("toast_prescriptions_status_warning"),
      );
    }
  };

  const handleUpdateCurrentStage = async () => {
    await fetchDocuments();
    let approvalStatus;
    const currentDocument = await plan.live_documents?.find((item) => {
      let r = false;
      if (Number(item.stage) === Number(plan?.currentStage)) {
        if (item.planId === plan.id) {
          r = true;
        }
      }
      return r;
    });
    approvalStatus = JSON.parse(currentDocument?.approvalStatus || "{}");
    const planStages = JSON.parse(plan.stages || "[]");
    const currentPlanStage = planStages?.find(
      (item) => Number(item.id) === Number(plan?.currentStage),
    );
    let approveUsers = [];
    approveUsers = users.filter((user) => {
      if (user?.role?.name === UserRoles.SUBMASTER) {
        if (plan.subsectionId) {
          return (
            user.sectionId === plan.sectionId &&
            user.subsectionId === plan.subsectionId &&
            currentPlanStage?.approvers?.includes(user?.role?.name)
          );
        } else {
          return currentPlanStage?.approvers?.includes(user?.role?.name);
        }
      } else if (user?.role?.name === UserRoles.MASTER) {
        return (
          user.sectionId === plan.sectionId &&
          currentPlanStage?.approvers?.includes(user?.role?.name)
        );
      } else {
        return currentPlanStage?.approvers?.includes(user?.role?.name);
      }
    });

    const enablePass = approveUsers.every(
      (item) => approvalStatus[item?.userId] === 1,
    );

    if (enablePass) {
      pushStageToNext();
    } else {
      ToastService.error(
        getLocaleString("toast_document_approve_status_failed"),
      );
    }
  };

  const handleNextStage = async () => {
    const stageCount = JSON.parse(plan.stages || "[]")?.filter(
      (item) => item.enabled,
    )?.length;
    await fetchDocuments();
    if (plan?.currentStage === 0) {
      handlePrescriptionStage().then((res) => {});
    } else if (plan?.currentStage === stageCount - 1) {
      ToastService.warning(getLocaleString("toast_next_stage_warning"));
    } else {
      await handleUpdateCurrentStage();
    }
    handleCloseNextStageModal();
  };

  const handleOpenNextStageModal = () => {
    if (
      account.role.name === UserRoles.MASTER ||
      account.role.name === UserRoles.SUPERMASTER
    )
      setOpenNextStageModal(true);
  };

  const handleCloseNextStageModal = () => {
    setOpenNextStageModal(false);
  };

  const handleMarkCompleted = async () => {
    if (totalStage === plan.currentStage + 1) {
      try {
        await updatePlan(plan?.id, {
          ...plan,
          completed: true,
        }).then((res) => {
          ToastService.success(getLocaleString(res.message));
        });
        await getPlan(id).then((res) => {
          setPlan(res);
        });
      } catch (err) {
        console.log("err=>", err);
        ToastService.error(
          getLocaleString(
            err.response?.data?.message || "common_network_error",
          ),
        );
      }
    } else {
      ToastService.error(getLocaleString("toast_mark_plan_error"));
    }
    handleCloseMarkCompleteModal();
  };

  const handleOpenMarkCompleteModal = () => {
    if (
      account.role.name === UserRoles.MASTER ||
      account.role.name === UserRoles.SUPERMASTER
    )
      setOpenMarkCompleteModal(true);
  };

  const handleCloseMarkCompleteModal = () => {
    setOpenMarkCompleteModal(false);
  };

  const isCompleted = plan?.completed;
  const isOverFirstStage = plan?.currentStage > 1;
  const isEmptyPrescription = !plan?.prescriptions?.length;
  const isMaster =
    account.role.name === UserRoles.MASTER ||
    account.role.name === UserRoles.SUPERMASTER;
  const isPlanCompleted =
    plan?.completed ||
    !plan?.prescriptions?.length ||
    plan?.currentStage === 0 ||
    plan?.currentStage !==
      JSON.parse(plan.stages || "[]")?.filter((item) => item.enabled)?.length -
        1;

  const isStageCompleted = () => {
    const document = plan.live_documents?.find(
      (item) => item?.stage === plan?.currentStage,
    );
    return document ? document.completed === true && plan?.currentStage : false;
  };

  const isFileUploaded = () => {
    const document = plan.live_documents?.find(
      (item) => item?.stage === plan?.currentStage || "",
    );
    const uploadedStated = document ? true : false;
    const currentStage = plan?.currentStage;
    return (uploadedStated && currentStage) || !currentStage;
  };

  return (
    <Box
      marginX="auto"
      width="80%"
      height="100%"
      paddingY="1rem"
      display="flex"
      flexDirection="column"
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mt={2}
      >
        <Typography
          variant="h4"
          fontSize="1.25rem"
          color="primary"
          fontWeight="medium"
        >
          {plan?.title}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIosIcon />}
          color="secondary"
          onClick={handleReturn}
        >
          {getLocaleString("common_go_back")}
        </Button>
      </Box>
      <Box mt={2} mb={4}>
        <Typography fontSize="1.125rem" mb={2}>
          {getLocaleString("plan_status_page_title")}
        </Typography>
        <Grid container mb={2}>
          <Grid item xs={4.5}>
            <Grid container mb={2}>
              <Grid item xs={4}>
                <Typography color="gray">
                  {getLocaleString("common_table_title")}:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography fontWeight="medium" pl={2}>
                  {plan?.title}
                </Typography>
              </Grid>
            </Grid>
            <Grid container mb={2}>
              <Grid item xs={4}>
                <Typography color="gray">
                  {getLocaleString("common_table_section")}:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography fontWeight="medium" pl={2}>
                  {plan?.section?.name}
                </Typography>
              </Grid>
            </Grid>
            <Grid container mb={2}>
              <Grid item xs={4}>
                <Typography color="gray">
                  {getLocaleString("common_table_subsection")}:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography fontWeight="medium" pl={2}>
                  {plan?.subsection?.name}
                </Typography>
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={4}>
                <Typography color="gray">
                  {getLocaleString("common_current_stage")}:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography pl={2}>
                  {stages[plan?.currentStage]?.stageMode}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={4.5}>
            <Grid container mb={2}>
              <Grid item xs={4}>
                <Typography color="gray">
                  {getLocaleString("common_table_type")}:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography pl={2}>{plan?.plan_type?.name}</Typography>
              </Grid>
            </Grid>
            <Grid container mb={2}>
              <Grid item xs={4}>
                <Typography color="gray">
                  {getLocaleString("common_table_subplan_type")}:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography pl={2}>{plan?.subPlan_type?.name}</Typography>
              </Grid>
            </Grid>

            <Grid container mb={2}>
              <Grid item xs={4}>
                <Typography color="gray">
                  {getLocaleString("common_table_publish_date")}:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography pl={2}>
                  {moment(plan?.publishDate).format("YYYY-MM-DD")}
                </Typography>
              </Grid>
            </Grid>
            <Grid container mb={2}>
              <Grid item xs={4}>
                <Typography color="gray">
                  {getLocaleString("common_duration")}:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography pl={2}>
                  {moment(plan?.startDate).format("YYYY-MM-DD")} ~ " "
                  {moment(plan?.endDate).format("YYYY-MM-DD")}
                </Typography>
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={4}>
                <Typography color="gray">
                  {getLocaleString("common_table_completed")}:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography pl={2}>{plan?.completed ? "Yes" : "No"}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={3}>
            <Box
              width="100%"
              height="100%"
              display="flex"
              alignItems="end"
              flexDirection="column"
              justifyContent="center"
            >
              <Button
                variant="contained"
                color="secondary"
                onClick={handleOpenNextStageModal}
                disabled={
                  !isMaster ||
                  isCompleted ||
                  isEmptyPrescription ||
                  (!isStageCompleted() && isOverFirstStage) ||
                  !isFileUploaded()
                }
                sx={{ width: "80%", marginBottom: "1rem" }}
              >
                {getLocaleString("common_next_stage_button")}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleOpenMarkCompleteModal}
                sx={{ width: "80%", marginTop: "1rem" }}
                disabled={!isMaster || isPlanCompleted}
              >
                {getLocaleString("common_mark_complete_button")}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box width="100%">
        <Box mb={4}>
          <Typography fontSize="1.5rem" textAlign="center">
            {getLocaleString("common_plan_status")}
          </Typography>
          <Typography textAlign="center">
            ({moment(plan?.startDate).format("YYYY-MM-DD")} ~ " "
            {moment(plan?.endDate).format("YYYY-MM-DD")})
          </Typography>
        </Box>
        <StageTimeLine plan={plan} setPlan={setPlan} />
      </Box>
      <ConfirmModal
        content={getLocaleString("toast_go_next_step_confirm_message")}
        open={openNextStageModal}
        close={handleCloseNextStageModal}
        handleClick={handleNextStage}
      />
      <ConfirmModal
        content={getLocaleString("toast_mark_plan_confirm_message")}
        open={openMarkCompleteModal}
        close={handleCloseMarkCompleteModal}
        handleClick={handleMarkCompleted}
      />
    </Box>
  );
};

export default PlanStatus;
