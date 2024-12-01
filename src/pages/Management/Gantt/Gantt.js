import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import moment from "moment";
import {
  GanttChart,
  Toolbar,
  MessageArea,
} from "../../../components/GanttChart";
import {
  getAllPlans,
  updatePlan,
  ToastService,
  getPlan,
  createPlan,
} from "../../../services";
import CreatePlanModal from "../../../components/Modal/CreatePlanModal";
import { useAuthState } from "../../../hooks/redux";

const sampleData = {
  data: [],
  links: [],
};

const Gantt = () => {
  const { t } = useTranslation();
  const account = useAuthState();
  const [chartData, setChartData] = useState(sampleData);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [currentZoom, setCurrentZoom] = useState("Days");
  const [currentMessages, setCurrentMessages] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [plans, setPlans] = useState([]);
  const getLocaleString = (key) => t(key);

  useEffect(() => {
    getAllPlans().then((res) => {
      setPlans(res.rows);
    });
  }, []);

  const initChartData = async () => {
    await getAllPlans()
      .then((res) => {
        let newChartData = chartData;
        res.rows.forEach((plan) => {
          newChartData = {
            ...newChartData,
            data: [
              ...newChartData.data,
              {
                id: plan?.id,
                text: plan?.title,
                start_date: moment(plan?.startDate)
                  .format("YYYY-MM-DD")
                  .toString(),
                end_date: moment(plan?.endDate).format("YYYY-MM-DD").toString(),
                stages: plan?.stages,
                progress: 1,
              },
            ],
          };
          JSON.parse(plan?.stages).forEach((stage, index) => {
            if (stage?.enabled) {
              newChartData = {
                ...newChartData,
                data: [
                  ...newChartData.data,
                  {
                    id: `${plan?.id}-${index}`,
                    text: stage?.stageMode,
                    parent: plan?.id,
                    start_date: moment(stage?.start)
                      .format("YYYY-MM-DD")
                      .toString(),
                    end_date: moment(stage?.end)
                      .format("YYYY-MM-DD")
                      .toString(),
                    progress: 1,
                  },
                ],
              };
            }
          });
          setChartData(newChartData);
        });
      })
      .catch((err) => {
        console.log("err=>", err);
      });
  };

  useEffect(() => {
    initChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans]);

  const handleZoomChange = (zoom) => {
    setCurrentZoom(zoom);
  };

  const addMessage = (message) => {
    setCurrentMessages((prev) => [...prev, message]);
  };

  const handleUpdatePlan = async (id, data, form) => {
    try {
      await updatePlan(id, {
        ...data,
        ...form,
      }).then((res) => {
        ToastService.success(getLocaleString(res.message));
      });
      await getAllPlans().then((res) => {
        setPlans(res.rows);
      });
      handleClosePlanModal();
    } catch (err) {
      console.log("err=>", err);
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
  };

  const handleCreatePlan = async (data) => {
    try {
      await createPlan({
        ...data,
        owner: account?.account.id,
      }).then((res) => {
        ToastService.success(getLocaleString(res.message));
      });
      await getAllPlans().then((res) => {
        setPlans(res.rows);
      });
      handleClosePlanModal();
    } catch (err) {
      console.log("err=>", err);
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
  };

  const logDataUpdate = (type, action, item, id) => {
    let text = item && item.text ? ` (${item.text})` : "";
    let message = `${type} ${action}: ${id} ${text}`;
    if (type === "link" && action !== "delete") {
      message += ` ( source: ${item.source}, target: ${item.target} )`;
    }
    addMessage(message);
    if (action === "update") {
      const selectedPlan = plans?.find((plan) => plan.id === item.id);
      const newPlan = {
        ...selectedPlan,
        startDate: new Date(item?.start_date).toString(),
        endDate: new Date(item?.end_date).toString(),
        publishDate: moment(item?.end_date).add(1, "days").toString(),
      };
      const startDuration =
        new Date(selectedPlan.startDate) - new Date(newPlan.startDate);
      const endDuration =
        new Date(selectedPlan.endDate) - new Date(newPlan.endDate);
      if (startDuration !== 3600000 || endDuration !== 3600000) {
        handleUpdatePlan(id, newPlan);
      }
    } else if (action === "create") {
      handleCreatePlan(item);
    }
  };

  const handleOpenPlanModal = () => {
    setOpenModal(true);
  };

  const handleClosePlanModal = () => {
    setOpenModal(false);
  };

  const handleTaskClick = async (taskId) => {
    handleOpenPlanModal();
    await getPlan(taskId)
      .then((res) => {
        setCurrentPlan(res);
      })
      .catch((err) => {
        console.log("err=>", err);
        ToastService.error(getLocaleString("common_network_error"));
      });
  };

  const handleCreateTask = () => {
    handleOpenPlanModal();
    setCurrentPlan(null);
  };

  return (
    <Box>
      <div className="zoom-bar">
        <Toolbar zoom={currentZoom} onZoomChange={handleZoomChange} />
      </div>

      <div className="gantt-container">
        <GanttChart
          dataSource={chartData}
          onDataUpdated={logDataUpdate}
          zoom={currentZoom}
          onTaskClick={handleTaskClick}
          onCreateTask={handleCreateTask}
        />
      </div>

      <MessageArea messages={currentMessages} />
      <CreatePlanModal
        open={openModal}
        close={handleClosePlanModal}
        create={handleCreatePlan}
        update={handleUpdatePlan}
        data={currentPlan}
      />
    </Box>
  );
};

export default Gantt;
