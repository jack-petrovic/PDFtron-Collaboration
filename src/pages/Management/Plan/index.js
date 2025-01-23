import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthState } from "../../../hooks/redux";
import { Box, Button, Menu, Typography } from "@mui/material";
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
  MenuItemButton,
  MoreActionsIcon,
} from "../../style";
import debounce from "lodash/debounce";

const Plan = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [plans, setPlans] = useState({ rows: [], count: 0 });
  const [openModal, setOpenModal] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [rowLength, setRowLength] = useState(0);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);
  const account = useAuthState();
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [removeItem, setRemoveItem] = useState(undefined);

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

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

  const handleDebounceChangeSearch = debounce(handleChangedSearch, 500);

  const getAllPlans = useCallback(() => {
    let query = {
      pageSize: paginationModel.pageSize,
      page: paginationModel.page,
      filters: filterModel.items.map((item) => ({
      field: item.field,
      operator: item.operator,
      value: item.value,
    })),
      filtersOperator: filterModel.logicOperator,
    };
    return getPlans(query);
  }, [filterModel, paginationModel]);

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
        setRowLength(data.count);
        setPlans(data);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllPlans, filterModel, paginationModel]);

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
    await deletePlan(removeItem.id).then((res) => {
      ToastService.success(getLocaleString(res.message));
    });
    await getAllPlans().then((data) => {
      setRowLength(data.count);
      setPlans(data);
    });
    handleClose();
    setOpenRemoveModal(false);
  };

  const handleCreatePlan = async (data) => {
    await createPlan({
      ...data,
      owner: account?.account.id,
    }).then((res) => {
      ToastService.success(getLocaleString(res.message));
    });
    await getAllPlans().then((data) => {
      setRowLength(data.count);
      setPlans(data);
    });
    handleCloseModal();
  };

  const handleUpdatePlan = async (id, data, form) => {
    await updatePlan(id, {
      ...data,
      ...form,
    }).then((res) => {
      ToastService.success(getLocaleString(res.message));
    });
    await getAllPlans().then((data) => {
      setRowLength(data.count);
      setPlans(data);
    });
    handleCloseModal();
  };

  const handleGenerate = async () => {
    setMonthPickerOpen(true);
  };

  const generatePlansWithMonth = async (value) => {
    await generatePlans({ month: value }).then((res) => {
      ToastService.success(getLocaleString(res.message));
    });
    await getAllPlans().then((res) => {
      setPlans(res);
      setRowLength(res.count);
    });
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
          <MoreActionsIcon />
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
      width: 100,
    },
    {
      field: "title",
      headerName: getLocaleString("common_table_title"),
      editable: false,
      flex: 2,
      minWidth: 200,
    },
    {
      field: "section",
      headerName: getLocaleString("common_table_section"),
      editable: false,
      flex: 1,
      minWidth: 150,
    },
    {
      field: "subsection",
      headerName: getLocaleString("common_table_subsection"),
      editable: false,
      flex: 1,
      minWidth: 150,
    },
    {
      field: "planType",
      headerName: getLocaleString("common_table_type"),
      editable: false,
      flex: 1,
      minWidth: 150,
    },
    {
      field: "subPlanType",
      headerName: getLocaleString("common_table_subplan_type"),
      editable: false,
      flex: 1,
      minWidth: 150,
    },
    {
      field: "startDate",
      headerName: getLocaleString("common_table_start_date"),
      editable: false,
      type: "date",
      flex: 1,
      minWidth: 100,
      renderCell: ({ row }) =>
        moment(row.startDate).utc(false).format("YYYY-MM-DD"),
    },
    {
      field: "endDate",
      headerName: getLocaleString("common_table_end_date"),
      editable: false,
      type: "date",
      flex: 1,
      minWidth: 100,
      renderCell: ({ row }) =>
        moment(row.endDate).utc(false).format("YYYY-MM-DD"),
    },
    {
      field: "publishDate",
      headerName: getLocaleString("common_table_publish_date"),
      editable: false,
      type: "date",
      flex: 1,
      minWidth: 100,
      renderCell: ({ row }) =>
        moment(row.publishDate).utc(false).format("YYYY-MM-DD"),
    },
    {
      field: "completed",
      headerName: getLocaleString("common_table_completed"),
      editable: false,
      type: "boolean",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "paperSize",
      headerName: getLocaleString("common_table_paper_size"),
      editable: false,
      type: "string",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "action",
      headerName: getLocaleString("common_table_action"),
      editable: false,
      width: 100,
      filterable: false,
      sortable: false,
      renderCell,
    },
  ];

  const rows = plans.rows.map((row, index) => ({
    ...row,
    no: paginationModel.page * paginationModel.pageSize + index + 1,
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


  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <ContentWrapper>
      <ContentHeader>
        <Box className="mr-2">
          <Typography variant="h5">
            {getLocaleString("plan_page_title")}
          </Typography>
        </Box>
        <Box className="sm:flex justify-between gap-1">
          <MenuItemButton
            variant="outlined"
            startIcon={<ArrowBackIosIcon />}
            color="secondary"
            onClick={handleGoToLog}
            className="w-full sm:w-auto"
          >
            {getLocaleString("common_go_to_log")}
          </MenuItemButton>
          <MenuItemButton
            variant="outlined"
            startIcon={<CallMissedOutgoingIcon />}
            onClick={handleGenerate}
            className="w-full sm:w-auto"
          >
            {getLocaleString("common_generate")}
          </MenuItemButton>
          <MenuItemButton
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            className="w-full sm:w-auto"
          >
            {getLocaleString("common_create")}
          </MenuItemButton>
          <MenuItemButton
            variant="outlined"
            startIcon={<ArrowBackIosIcon />}
            color="secondary"
            onClick={handleGoBack}
            className="w-full sm:w-auto"
          >
            {getLocaleString("common_go_back")}
          </MenuItemButton>
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
        rowLength={rowLength}
        onPaginationModelChange={setPaginationModel}
        paginationModel={paginationModel}
        filterModel={filterModel}
        onFilterChanged={handleDebounceChangeSearch}
        />
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
            <EditIcon className="menu-icon" />
            {getLocaleString("common_edit")}
          </ActionMenuItem>
          <ActionMenuItem onClick={() => handleOpenRemoveModal(activeRow)}>
            <DeleteIcon className="menu-icon" />
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
