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
import { useSelector } from "react-redux";

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
  const [filterValue, setFilterValue] = useState("All");
  const [currentMessages, setCurrentMessages] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [plans, setPlans] = useState([]);
  const sections = useSelector((state) => state.sectionReducer.sections);

  const getLocaleString = (key) => t(key);

  useEffect(() => {
    getAllPlans()
      .then((res) => {
        setPlans(res.rows);
      })
      .catch((error) => {
        console.log("error=>", error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initChartData = () => {
    const newChartData = {
      data: [],
      links: [],
    };

    plans.forEach((plan) => {
      const sectionName = sections.find(
        (section) => section.id === plan?.sectionId,
      )?.name;

      if (filterValue === "All" || filterValue === sectionName) {
        newChartData.data.push({
          id: plan?.id,
          text: plan?.title,
          start_date: moment(plan?.startDate).format("YYYY-MM-DD"),
          end_date: moment(plan?.endDate).format("YYYY-MM-DD"),
          stages: plan?.stages,
          progress: 1,
        });
      }
    });
    setChartData(newChartData);
  };

  useEffect(() => {
    initChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans, filterValue]);

  const handleZoomChange = (zoom) => {
    setCurrentZoom(zoom);
  };

  const handleFilterChange = (filter) => {
    setFilterValue(filter);
  };

  const addMessage = (message) => {
    setCurrentMessages((prev) => [...prev, message]);
  };

  const handleUpdatePlan = async (id, data, form) => {
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
  };

  const handleCreatePlan = async (data) => {
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
      });
  };

  const handleCreateTask = () => {
    handleOpenPlanModal();
    setCurrentPlan(null);
  };

  return (
    <Box>
      <Box className="zoom-bar">
        <Toolbar
          zoom={currentZoom}
          onZoomChange={handleZoomChange}
          onFilterChange={handleFilterChange}
        />
      </Box>

      <Box className="gantt-container">
        <GanttChart
          dataSource={chartData}
          onDataUpdated={logDataUpdate}
          zoom={currentZoom}
          onTaskClick={handleTaskClick}
          onCreateTask={handleCreateTask}
        />
      </Box>

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
