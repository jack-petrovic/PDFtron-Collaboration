import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthState } from "../../../hooks/redux";
import { Box, Button, Menu, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import moment from "moment";
import CustomDataGrid from "../../../components/common/DataGrid";
import CreateFixedPlanModal from "../../../components/Modal/CreateFixedPlanModal";
import ConfirmModal from "../../../components/Modal/ConfirmModal";
import {
  createFixedPlan,
  deleteFixedPlan,
  getFixedPlans,
  updateFixedPlan,
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

const FixedPlanPage = () => {
  const { t } = useTranslation();
  const { account } = useAuthState();
  const navigate = useNavigate();
  const [plans, setPlans] = useState({ rows: [], count: 0 });
  const [openModal, setOpenModal] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [rowLength, setRowLength] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);
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

  const handleChangedSearch = (filter) => {
    setFilterModel(filter);
  };

  const handleDebounceChangeSearch = debounce(handleChangedSearch, 500);

  const getAllFixedPlans = useCallback(() => {
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
    return getFixedPlans(query);
  }, [paginationModel, filterModel]);

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
    getAllFixedPlans()
      .then((data) => {
        setRowLength(data.count);
        setPlans(data);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterModel, getAllFixedPlans, paginationModel]);

  const handleEditPlan = (section) => {
    setOpenModal(true);
    setActivePlan(plans.rows[section.no - 1]);
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

  const handleRemoveFixedPlan = async () => {
    await deleteFixedPlan(removeItem.id).then((res) => {
      ToastService.success(getLocaleString(res.message));
    });
    await getAllFixedPlans().then((data) => {
      setRowLength(data.count);
      setPlans(data);
    });
    handleClose();
    setOpenRemoveModal(false);
  };

  const handleCreatePlan = async (data) => {
    try {
      await createFixedPlan({
        ...data,
        owner: account?.id,
      }).then((res) => {
        ToastService.success(getLocaleString(res.message));
      });
      await getAllFixedPlans().then((data) => {
        setRowLength(data.count);
        setPlans(data);
      });
      handleCloseModal();
    } catch (err) {
      console.log("err=>", err);
    }
  };

  const handleUpdatePlan = async (id, data) => {
    await updateFixedPlan(id, {
      ...data,
    }).then((res) => {
      ToastService.success(getLocaleString(res.message));
    });
    await getAllFixedPlans().then((data) => {
      setRowLength(data.count);
      setPlans(data);
    });
    handleCloseModal();
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
      flex: 1,
      minWidth: 100,
    },
    {
      field: "title",
      headerName: getLocaleString("common_table_title"),
      editable: false,
      flex: 3,
      minWidth: 250,
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
      field: "updatedAt",
      headerName: getLocaleString("common_table_updated_at"),
      editable: false,
      type: "date",
      flex: 1,
      minWidth: 100,
      renderCell: ({ row }) =>
        moment(row.updatedAt).utc(false).format("YYYY-MM-DD"),
    },
    {
      field: "publishCycle",
      headerName: getLocaleString("common_table_publish_cycle"),
      editable: false,
      filterable: false,
      flex: 1.5,
      minWidth: 150,
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
      filterable: false,
      sortable: false,
      width: 100,
      renderCell,
    },
  ];

  const rows = plans.rows.map((row, index) => ({
    ...row,
    no: paginationModel.page * paginationModel.pageSize + index + 1,
    section: row.section?.name || "None",
    subsection: row.subsection?.name || "None",
    sectionId: row.section?.id,
    subsectionId: row.subsection?.id,
    planType: row.plan_type?.name || "None",
    subPlanType: row.subPlan_type?.name || "None",
    planTypeId: row.planTypeId,
    subPlanTypeId: row.subPlanTypeId,
    updatedAt: moment(row.updatedAt).toDate(),
    publishCycle: `${JSON.parse(row.isRepeatable).cycle} (${JSON.parse(row.isRepeatable).value})`,
    paperSize: row.paper_size?.name || "None",
    paperSizeId: row.paperSizeId,
  }));

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <ContentWrapper>
      <ContentHeader>
        <Box className="mr-2">
          <Typography variant="h5">
            {getLocaleString("fixed_plan_page_title")}
          </Typography>
        </Box>
        <Box className="sm:flex justify-between gap-1">
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
        <CreateFixedPlanModal
          open={openModal}
          close={handleCloseModal}
          create={handleCreatePlan}
          update={handleUpdatePlan}
          data={activePlan}
        />
      )}
      <ConfirmModal
        content="toast_delete_fixed_plan_confirm_message"
        open={openRemoveModal}
        close={handleCloseRemoveModal}
        handleClick={handleRemoveFixedPlan}
      />
    </ContentWrapper>
  );
};

export default FixedPlanPage;
