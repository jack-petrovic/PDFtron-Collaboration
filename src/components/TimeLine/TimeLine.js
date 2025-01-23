import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PDFDocument } from "pdf-lib";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import moment from "moment";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import CompareIcon from "@mui/icons-material/Compare";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import PrintIcon from "@mui/icons-material/Print";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import FileDropzone from "../FileDropzone";
import { useAuthState } from "../../hooks/redux";
import ComparisonModal from "../ComparisonModal";
import ConfirmModal from "../Modal/ConfirmModal";
import {
  PrintRequestStatus,
  StageMode,
  URL_WEB_SOCKET,
  UserRoles,
} from "../../constants";
import {
  createDocument,
  createPrintRequest,
  getDocument,
  getDocumentDownload,
  getPlan,
  getPrintRequests,
  getUsers,
  ToastService,
  updateDocument,
} from "../../services";
import { sendNotification } from "../../utils/helper";

const StageTimeLine = ({ plan, setPlan, timelineProps = {} }) => {
  let connection = new WebSocket(URL_WEB_SOCKET);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { account } = useAuthState();
  const [data, setData] = useState([]);
  const [printRequests, setPrintRequests] = useState([]);
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState({});
  const [index, setIndex] = useState("");
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [users, setUsers] = useState([]);
  const getLocaleString = (key) => t(key);

  const stages = JSON.parse(plan?.stages || "[]").filter(
    (stage) => stage.enabled,
  );

  const fetchPrintRequests = () => {
    const userQuery = {};
    getUsers(userQuery)
      .then((res) => {
        setUsers(res.rows);
      })
      .catch((err) => {
        console.log("err=>", err);
      });
    if (!plan) return;
    let query = {};
    query.filters = [
      {
        field: "planId",
        operator: "equals",
        value: plan.id,
      },
    ];
    getPrintRequests(query)
      .then((res) => {
        setPrintRequests(res?.rows);
      })
      .catch((err) => {
        console.log("err=>", err);
      });
  };

  useEffect(() => {
    fetchPrintRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan]);

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleReadPlan = () => {
    getPlan(plan?.id)
      .then((res) => {
        setPlan(res);
      })
      .catch((err) => {
        console.log("err=>", err);
        ToastService.showHttpError(
          err,
          getLocaleString("toast_load_plans_failed"),
        );
      });
  };

  const handleUploadDocument = async (stage, file) => {
    try {
      if (!file || file.type !== "application/pdf") {
        throw new Error(getLocaleString("toast_upload_invalid_live_document"));
      }

      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
      fileReader.onload = async () => {
        const existingPdfBytes = fileReader.result;
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const pageCount = pdfDoc.getPageCount();

        await createDocument({
          planId: plan?.id,
          stage: stage,
          owner: account?.email,
          paperSize: plan?.paper_size.name,
          file: file,
          fileName: file.name,
          pagesCount: pageCount,
          approvalStatus: "{}",
        });

        handleReadPlan();
      };

      fileReader.onerror = () => {
        ToastService.error(
          getLocaleString("toast_upload_live_document_failed"),
        );
      };
    } catch (err) {
      ToastService.error(getLocaleString("common_network_error"));
    }
  };

  const getStartDate = (index) => {
    let diffDays = 0;
    for (let i = 0; i < index; i++) {
      diffDays += Number(stages[i]?.days);
    }
    return moment(plan?.startDate).add(diffDays, "days").format("YYYY-MM-DD");
  };

  const getColor = (index) => {
    let color = "gray";
    if (plan?.currentStage > index) color = "#62bd19";
    else if (plan?.currentStage === index) color = "red";
    return color;
  };

  useEffect(() => {
    if (!plan) return;
    setData(
      JSON.parse(plan?.stages || "[]")
        .filter((stage) => stage.enabled)
        .map((stage, index) => {
          return {
            stageId: stage?.id,
            time: getStartDate(index),
            content: stage?.stageMode,
            color: getColor(index),
            enable: stage?.enabled,
          };
        }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan]);

  const getFileName = (stage) => {
    return (
      plan.live_documents?.find((item) => item?.stage === stage)?.fileName || ""
    );
  };

  const handleCompareDocument = async (datum, stage) => {
    let doc = null;
    let prevDoc = null;
    const document = plan.live_documents?.find((item) => item?.stage === stage);
    await getDocument(document?.documentId)
      .then((res) => {
        doc = res.doc;
        prevDoc = res.prevDoc;
      })
      .catch((err) => {
        console.log("err=>", err);
      });

    const stageApprovers =
      JSON.parse(plan.stages || "[]").find((item) => item?.id === datum.stageId)
        ?.approvers || [];

    if (stageApprovers.length === 0) {
      updateDocument(document?.documentId, {
        ...document,
        completed: true,
      })
        .then(handleReadPlan)
        .catch((err) => {
          console.log("err=>", err);
        });
    }

    if (!doc) {
      ToastService.warning(getLocaleString("toast_timeline_stage_warning"));
    } else if (!prevDoc) {
      ToastService.warning(
        getLocaleString("toast_timeline_previous_stage_warning"),
      );
    } else {
      navigate(
        `/result/${plan.live_documents?.find((item) => item?.stage === stage)?.documentId}`,
      );
    }
  };

  const getStatus = (index) => {
    const document = plan.live_documents?.find((item) => item?.stage === index);
    if (document) {
      const status = JSON.parse(document?.approvalStatus || "{}");
      return status[account.userId] === 1;
    } else {
      return false;
    }
  };

  const checkReviewedAll = (datum, index, newStatus) => {
    const stageApprovers =
      JSON.parse(plan.stages || "[]").find((item) => item?.id === datum.stageId)
        ?.approvers || [];

    return stageApprovers.every((approver) => {
      const approverId = users.find((user) => user?.name === approver)?.userId;
      return newStatus[approverId] === 1;
    });
  };

  const isAbleToSeePrescriptions =
    account.role.name === UserRoles.SUPERADMIN ||
    account.role.name === UserRoles.ADMIN ||
    account.role.name === UserRoles.SUPERMASTER ||
    account.role.name === UserRoles.MASTER ||
    account.role.name === UserRoles.SUBMASTER ||
    account.role.name === UserRoles.EDITOR;

  const isCompared = (index) => {
    return plan.comparisons.find((value) => value.stage === index);
  };

  const handleApproveOrReject = (datum, index) => {
    const document = plan.live_documents?.find((item) => item?.stage === index);
    if (document) {
      const status = JSON.parse(document?.approvalStatus || "{}");
      const newStatus = { ...status };
      if (status[account.userId] !== 1) {
        newStatus[account.userId] = 1;
      } else {
        newStatus[account.userId] = -1;
      }

      const checkedStatus = checkReviewedAll(datum, index, newStatus);
      updateDocument(document?.documentId, {
        ...document,
        approvalStatus: JSON.stringify(newStatus),
        completed: checkedStatus,
      })
        .then(() => {
          handleReadPlan();
          ToastService.success(
            t("toast_timeline_approve_status", {
              index,
              status:
                newStatus[account.userId] === 1
                  ? getLocaleString("approved")
                  : getLocaleString("rejected"),
            }),
          );
          if (newStatus[account.id] === 1) {
            sendNotification(
              connection,
              account.id,
              "notification",
              {
                key: "toast_notification_approve",
                data: {
                  changer: account.name,
                  index,
                  plan: plan?.title,
                },
              },
              "stage",
            );
          } else {
            sendNotification(
              connection,
              account.id,
              "notification",
              {
                key: "toast_notification_reject",
                data: {
                  changer: account.name,
                  index,
                  plan: plan?.title,
                },
              },
              "stage",
            );
          }
        })
        .catch((err) => {
          console.log("err=>", err);
        });
    } else {
      ToastService.warning(getLocaleString("toast_timeline_stage_no_document"));
    }
  };

  const handleOpenConfirmModal = (index) => {
    setOpenConfirmModal(true);
    setIndex(index);
  };

  const handleCloseConfirmModal = () => {
    setOpenConfirmModal(false);
  };

  const handlePrintRequest = (index) => {
    const document = plan.live_documents?.find((item) => item?.stage === index);
    createPrintRequest({
      planId: plan?.id,
      stage: index,
      status: PrintRequestStatus.PENDING,
      title: `${plan?.title} - step${index}`,
      documentId: document?.documentId,
      section: plan?.section.name,
      fileType: "pdf",
      subSection: plan?.subsection.name,
      paperSize: plan?.paper_size.name,
      printVolume: stages[index].printVolume,
      pagesCount: document?.pagesCount,
      note: "This is an auto print request for the plan.",
    })
      .then((res) => {
        ToastService.success(getLocaleString(res.message));
        handleReadPlan();
        sendNotification(
          connection,
          account.id,
          "notification",
          {
            key: "toast_notification_print_request",
            data: {
              user: account.name,
              currentStage: plan.currentStage,
              printVolume: stages[index].printVolume,
            },
          },
          "print",
        );
        fetchPrintRequests();
      })
      .catch((err) => {
        console.log("err=>", err);
      });
    handleCloseConfirmModal();
  };

  const getPrintStatus = (stage) => {
    const stageRow = printRequests.find(
      (value) => value.stage === stage && value.planId === plan?.id,
    );
    if (stageRow?.status) {
      return `(${stageRow?.status})`;
    } else {
      return "";
    }
  };

  const getComparison = (index) => {
    const stageCompareResults = plan.comparisons.findLast(
      (value) => value.stage === index,
    );
    if (stageCompareResults)
      setResult(JSON.parse(stageCompareResults?.metaData || null));
    handleOpenModal();
  };

  const goToCollaboration = (index) => {
    navigate(
      `/collaborate/${plan.live_documents?.find((item) => item?.stage === index)?.documentId}`,
    );
  };

  const downloadFile = (stage) => {
    const doc = plan.live_documents?.find((item) => item?.stage === stage);
    if (doc) {
      getDocumentDownload(doc.documentId)
        .then((res) => {
          const blob = new Blob([res]);
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = doc.fileName;
          link.click();

          // Cleanup
          URL.revokeObjectURL(url);
        })
        .catch((err) => {
          console.log("err=>", err);
        });
    }
  };

  const handleViewPrescriptions = () => {
    navigate(`/main-flow/plan/${plan?.id}/prescriptions`);
  };

  const isPlanCompleted = plan?.completed === 1;
  const isEditor = account.role.name === UserRoles.EDITOR;
  const isPrintAllowed = stages[plan?.currentStage]?.printPermission;

  const isNotUploaded = (index) => {
    return getFileName(index)?.length === 0;
  };

  const isFirstMode = (index) => {
    return index === 1;
  };

  const isCurrentStage = (index) => {
    return plan?.currentStage !== index;
  };

  const isPrintRequested = (index) => {
    return getPrintStatus(index)?.length !== 0;
  };

  const isPrinted = (index) => {
    return (
      plan?.currentStage === index &&
      (getPrintStatus(index).includes(PrintRequestStatus.DONE) ||
        !isPrintAllowed)
    );
  };

  return (
    <Box sx={{ marginX: "10%" }}>
      <Timeline {...timelineProps} sx={{ padding: 0, margin: "auto" }}>
        {data?.map((datum, index) => {
          return (
            <TimelineItem key={index}>
              <TimelineContent sx={{ flex: "0 0 10rem" }}>
                {datum.content}
              </TimelineContent>
              <TimelineSeparator
                sx={{ width: "40px" }}
                style={{ width: "40px" }}
                className="w-20"
              >
                <div className="ring-container justify-center">
                  {plan?.currentStage === index ? (
                    <>
                      <div className="ringing" />
                      <div className="circle" />
                    </>
                  ) : (
                    <TimelineDot
                      sx={{
                        backgroundColor: datum.color,
                        width: "10px",
                        height: "10px",
                        mx: "auto",
                      }}
                    />
                  )}
                </div>
                <TimelineConnector
                  sx={{ display: index + 1 === data?.length ? "none" : "" }}
                />
              </TimelineSeparator>
              <TimelineOppositeContent sx={{ paddingTop: 0, paddingBottom: 0 }}>
                <Box display="flex" gap="8px" alignItems="center">
                  <Box sx={{ whiteSpace: "nowrap" }}>{datum.time}</Box>
                  {datum.content !== StageMode.PRESCRIPTIONMODE ? (
                    <Box
                      display="flex"
                      gap="0.5rem"
                      alignItems="center"
                      sx={{ flexGrow: 1, width: 0 }}
                    >
                      <IconButton
                        variant="contained"
                        color="primary"
                        disabled={Boolean(
                          isPlanCompleted ||
                            isCurrentStage(index) ||
                            !isNotUploaded(index) ||
                            !isEditor,
                        )}
                        sx={{
                          paddingTop: 0,
                          paddingBottom: 0,
                          paddingRight: "8px",
                          paddingLeft: "8px",
                        }}
                      >
                        <FileDropzone
                          onChange={(file) => handleUploadDocument(index, file)}
                        >
                          <Tooltip
                            title={getLocaleString(
                              "timeline_upload_icon_title",
                            )}
                            placement="top-start"
                          >
                            <FileUploadIcon />
                          </Tooltip>
                        </FileDropzone>
                      </IconButton>
                      <Tooltip
                        title={getLocaleString("timeline_print_icon_title")}
                        placement="top-start"
                      >
                        <Box display="flex" alignItems="center" gap={2}>
                          <IconButton
                            variant="contained"
                            color="success"
                            onClick={() => handleOpenConfirmModal(index)}
                            disabled={Boolean(
                              isNotUploaded(index) ||
                                isCurrentStage(index) ||
                                isPrintRequested(index) ||
                                !isPrintAllowed,
                            )}
                            sx={{
                              paddingTop: 0,
                              paddingBottom: 0,
                              paddingRight: "4px",
                              paddingLeft: "4px",
                            }}
                          >
                            <PrintIcon />
                          </IconButton>
                        </Box>
                      </Tooltip>
                      <Typography sx={{ width: "6rem" }}>
                        {getPrintStatus(index)}
                      </Typography>
                      <Tooltip
                        title={getLocaleString("timeline_compare_icon_title")}
                        placement="top-start"
                      >
                        <Box>
                          <IconButton
                            variant="contained"
                            color="secondary"
                            onClick={() => handleCompareDocument(datum, index)}
                            disabled={Boolean(
                              isNotUploaded(index) ||
                                isCompared(index) ||
                                isFirstMode(index),
                            )}
                            sx={{
                              paddingTop: 0,
                              paddingBottom: 0,
                              paddingRight: "8px",
                              paddingLeft: "8px",
                            }}
                          >
                            <CompareIcon />
                          </IconButton>
                        </Box>
                      </Tooltip>
                      <Tooltip
                        title={getLocaleString("timeline_result_icon_title")}
                      >
                        <Box>
                          <IconButton
                            variant="contained"
                            color="info"
                            onClick={() => getComparison(index)}
                            disabled={Boolean(!isCompared(index))}
                            sx={{
                              paddingTop: 0,
                              paddingBottom: 0,
                              paddingRight: "8px",
                              paddingLeft: "8px",
                            }}
                          >
                            <RemoveRedEyeIcon />
                          </IconButton>
                        </Box>
                      </Tooltip>
                      <Tooltip
                        title={getLocaleString(
                          "timeline_collaboration_icon_title",
                        )}
                      >
                        <Box>
                          <IconButton
                            variant="contained"
                            color="info"
                            onClick={() => goToCollaboration(index)}
                            disabled={Boolean(isNotUploaded(index))}
                            sx={{
                              paddingTop: 0,
                              paddingBottom: 0,
                              paddingRight: "8px",
                              paddingLeft: "8px",
                            }}
                          >
                            <GroupWorkIcon />
                          </IconButton>
                        </Box>
                      </Tooltip>
                      {JSON.parse(plan.stages || "[]")
                        .find((item) => item?.id === datum.stageId)
                        ?.approvers?.includes(account.role.name) &&
                        getFileName(index) && (
                          <Typography sx={{ width: "6rem" }} className="flex">
                            <Tooltip
                              title={getLocaleString(
                                "timeline_status_icon_title",
                              )}
                              placement="top-start"
                            >
                              <Box className="flex">
                                <IconButton
                                  variant="contained"
                                  color={
                                    getStatus(index) ? "warning" : "success"
                                  }
                                  onClick={() =>
                                    handleApproveOrReject(datum, index)
                                  }
                                  disabled={Boolean(
                                    isNotUploaded(index) ||
                                      isPlanCompleted ||
                                      !isCompared(index) ||
                                      !isPrinted(index),
                                  )}
                                  sx={{
                                    alignSelf: "center",
                                    paddingTop: 0,
                                    paddingBottom: 0,
                                    paddingRight: "8px",
                                    paddingLeft: "8px",
                                  }}
                                >
                                  {getStatus(index) ? (
                                    <ThumbDownIcon />
                                  ) : (
                                    <ThumbUpIcon />
                                  )}
                                </IconButton>
                              </Box>
                            </Tooltip>
                          </Typography>
                        )}
                      <Tooltip
                        title={getFileName(index)}
                        onClick={() => downloadFile(index)}
                      >
                        <Typography
                          sx={{
                            width: "12rem",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            cursor: "pointer",
                            "&:hover": { color: "blue" },
                          }}
                        >
                          {getFileName(index)}
                        </Typography>
                      </Tooltip>
                    </Box>
                  ) : (
                    <Box
                      display="flex"
                      gap="0.5rem"
                      alignItems="center"
                      sx={{ paddingLeft: "204px" }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleViewPrescriptions}
                        disabled={!isAbleToSeePrescriptions}
                      >
                        <Tooltip
                          title="View prescriptions"
                          placement="top-start"
                        >
                          <Box display="flex" gap={1}>
                            <VisibilityIcon />
                            {getLocaleString(
                              "timeline_view_prescription_button",
                            )}
                          </Box>
                        </Tooltip>
                      </Button>
                    </Box>
                  )}
                </Box>
              </TimelineOppositeContent>
            </TimelineItem>
          );
        })}
      </Timeline>
      {open && (
        <ComparisonModal
          open={open}
          openModal={handleOpenModal}
          closeModal={handleCloseModal}
          data={result}
        />
      )}
      <ConfirmModal
        content={t("toast_timeline_print_confirm_message", {
          index,
        })}
        open={openConfirmModal}
        close={handleCloseConfirmModal}
        handleClick={() => handlePrintRequest(index)}
      />
    </Box>
  );
};

export default StageTimeLine;
