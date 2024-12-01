import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthState } from "../../../hooks/redux";
import { Box, Button, Menu, Pagination, Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CallMissedOutgoingIcon from "@mui/icons-material/CallMissedOutgoing";
import moment from "moment";
import CustomDataGrid from "../../../components/common/DataGrid";
import CreatePlanModal from "../../../components/Modal/CreatePlanModal";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ConfirmModal from "../../../components/Modal/ConfirmModal";
import SelectMonthModal from "../../../components/Modal/SelectMonthModal";
import {
  createPlan,
  deletePlan,
  getPlans,
  updatePlan,
  generatePlans,
  ToastService,
} from "../../../services";
import {
  ActionMenuButtonWrapper,
  ActionMenuItem,
  ContentHeader,
  ContentWrapper,
} from "../../style";

const Plan = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [plans, setPlans] = useState({ rows: [], count: 0 });
  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const pageSize = 10;
  const [totalPage, setTotalPage] = useState(0);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);
  const account = useAuthState();
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [removeItem, setRemoveItem] = useState(undefined);
  const getLocaleString = (key) => t(key);
  const handleClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setActiveRow(row);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
    setActivePlan(null);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleGoToLog = () => {
    navigate("../management/generation-logs");
  };
  const handleChangedSearch = (filter) => {
    setFilterModel(filter);
  };

  const getAllPlans = useCallback(() => {
    let query = {};
    query.pageSize = pageSize;
    query.page = page;
    query.filters = filterModel.items.map((item) => ({
      field: item.field,
      operator: item.operator,
      value: item.value,
    }));
    query.filtersOperator = filterModel.logicOperator;
    return getPlans(query);
  }, [filterModel, pageSize, page]);

  useEffect(() => {
    if (
      filterModel.items.find(
        (item) =>
          item.operator !== "isEmpty" &&
          item.operator !== "isNotEmpty" &&
          (item.value === undefined ||
            item.value === null ||
            item.value === ""),
      )
    ) {
      return;
    }
    getAllPlans()
      .then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setPlans(data);
      })
      .catch((err) => {
        ToastService.showHttpError(
          err,
          getLocaleString("toast_load_plans_failed"),
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllPlans, filterModel]);

  const handleEditPlan = (selectedRow) => {
    setOpenModal(true);
    setActivePlan(plans.rows?.find((plan) => plan?.id === selectedRow?.id));
    handleClose();
  };

  const handleOpenRemoveModal = (item) => {
    setRemoveItem(item);
    setOpenRemoveModal(true);
  };

  const handleCloseRemoveModal = () => {
    handleClose();
    setOpenRemoveModal(false);
  };

  const handleRemovePlan = async () => {
    try {
      await deletePlan(removeItem.id).then((res) => {
        ToastService.success(getLocaleString(res.message));
      });
      await getAllPlans().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setPlans(data);
      });
      handleClose();
      setOpenRemoveModal(false);
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
      await getAllPlans().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setPlans(data);
      });
      handleCloseModal();
    } catch (err) {
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
      console.log("err=>", err);
    }
  };

  const handleUpdatePlan = async (id, data, form) => {
    try {
      await updatePlan(id, {
        ...data,
        ...form,
      }).then((res) => {
        ToastService.success(getLocaleString(res.message));
      });
      await getAllPlans().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setPlans(data);
      });
      handleCloseModal();
    } catch (err) {
      console.log("err=>", err);
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
  };

  const handleGenerate = async () => {
    setMonthPickerOpen(true);
  };

  const generatePlansWithMonth = async (value) => {
    try {
      await generatePlans({ month: value }).then((res) => {
        ToastService.success(getLocaleString(res.message));
      });
      await getAllPlans().then((res) => {
        setPlans(res);
        setTotalPage(Math.ceil(res.count / pageSize));
      });
    } catch (err) {
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
  };

  const renderCell = ({ row }) => {
    return (
      <ActionMenuButtonWrapper>
        <Button
          id="basic-button"
          aria-controls="basic-menu"
          aria-haspopup="true"
          aria-expanded={isOpen ? "true" : undefined}
          onClick={(event) => handleClick(event, row)}
        >
          <MoreVertIcon sx={{ color: "gray" }} />
        </Button>
      </ActionMenuButtonWrapper>
    );
  };

  const planTableColumns = [
    {
      field: "no",
      headerName: getLocaleString("common_table_number"),
      editable: false,
      filterable: false,
      flex: 1,
    },
    {
      field: "title",
      headerName: getLocaleString("common_table_title"),
      editable: false,
      flex: 3,
    },
    {
      field: "section",
      headerName: getLocaleString("common_table_section"),
      editable: false,
      flex: 1,
    },
    {
      field: "subsection",
      headerName: getLocaleString("common_table_subsection"),
      editable: false,
      flex: 1,
    },
    {
      field: "planType",
      headerName: getLocaleString("common_table_type"),
      editable: false,
      flex: 1,
    },
    {
      field: "subPlanType",
      headerName: getLocaleString("common_table_subplan_type"),
      editable: false,
      flex: 1,
    },
    {
      field: "startDate",
      headerName: getLocaleString("common_table_start_date"),
      editable: false,
      type: "date",
      flex: 1,
      renderCell: ({ row }) =>
        moment(row.startDate).utc(false).format("YYYY-MM-DD"),
    },
    {
      field: "endDate",
      headerName: getLocaleString("common_table_end_date"),
      editable: false,
      type: "date",
      flex: 1,
      renderCell: ({ row }) =>
        moment(row.endDate).utc(false).format("YYYY-MM-DD"),
    },
    {
      field: "publishDate",
      headerName: getLocaleString("common_table_publish_date"),
      editable: false,
      type: "date",
      flex: 1,
      renderCell: ({ row }) =>
        moment(row.publishDate).utc(false).format("YYYY-MM-DD"),
    },
    {
      field: "completed",
      headerName: getLocaleString("common_table_completed"),
      editable: false,
      type: "boolean",
      flex: 1,
    },
    {
      field: "paperSize",
      headerName: t("common_table_paper_size"),
      editable: false,
      type: "string",
      flex: 1,
    },
    {
      field: "action",
      headerName: "",
      editable: false,
      flex: 1,
      filterable: false,
      renderCell,
    },
  ];

  const rows = plans.rows.map((row, index) => ({
    ...row,
    no: (page - 1) * pageSize + index + 1,
    section: row.section?.name || "None",
    subsection: row.subsection?.name || "None",
    planType: row.plan_type?.name || "None",
    subPlanType: row.subPlan_type?.name || "None",
    startDate: moment(row.startDate).toDate(),
    endDate: moment(row.endDate).toDate(),
    publishDate: moment(row.publishDate).toDate(),
    paperSize: row.paper_size?.name || "None",
    paperSizeId: row.paper_size?.id,
  }));

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <ContentWrapper>
      <ContentHeader>
        <Box>
          <Typography variant="h5">
            {getLocaleString("plan_page_title")}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="between" gap="4px">
          <Button
            variant="outlined"
            startIcon={<ArrowBackIosIcon />}
            color="secondary"
            onClick={handleGoToLog}
          >
            {getLocaleString("common_go_to_log")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<CallMissedOutgoingIcon />}
            onClick={handleGenerate}
          >
            {getLocaleString("common_generate")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
          >
            {getLocaleString("common_create")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIosIcon />}
            color="secondary"
            onClick={handleGoBack}
          >
            {getLocaleString("common_go_back")}
          </Button>
          <SelectMonthModal
            open={monthPickerOpen}
            close={() => setMonthPickerOpen(false)}
            select={(e) => generatePlansWithMonth(e)}
          />
        </Box>
      </ContentHeader>
      <CustomDataGrid
        rows={rows}
        columns={planTableColumns}
        filterMode="server"
        filterModel={filterModel}
        onFilterChanged={(filter) => handleChangedSearch(filter)}
      />
      <Box display="flex" alignItems="center" justifyContent="center" pt={4}>
        <Pagination
          color="primary"
          shape="rounded"
          count={totalPage}
          page={page}
          onChange={handleChangePage}
        />
      </Box>
      {isOpen && (
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={isOpen}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <ActionMenuItem onClick={() => handleEditPlan(activeRow)}>
            <EditIcon sx={{ marginRight: "1rem", color: "gray" }} />
            {getLocaleString("common_edit")}
          </ActionMenuItem>
          <ActionMenuItem onClick={() => handleOpenRemoveModal(activeRow)}>
            <DeleteIcon sx={{ marginRight: "1rem", color: "gray" }} />
            {getLocaleString("common_delete")}
          </ActionMenuItem>
        </Menu>
      )}
      {openModal && (
        <CreatePlanModal
          open={openModal}
          close={handleCloseModal}
          create={handleCreatePlan}
          update={handleUpdatePlan}
          data={activePlan}
        />
      )}
      <ConfirmModal
        content="toast_delete_plan_confirm_message"
        open={openRemoveModal}
        close={handleCloseRemoveModal}
        handleClick={handleRemovePlan}
      />
    </ContentWrapper>
  );
};

export default Plan;
