import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useAuthState } from "../../../hooks/redux";
import { addStage, editStage, removeStage } from "../../../redux/actions";
import { Box, Button, Menu, Pagination, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SortIcon from "@mui/icons-material/Sort";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import moment from "moment";
import CustomDataGrid from "../../../components/common/DataGrid";
import CreateStageModal from "../../../components/Modal/CreateStageModal";
import ArrangeOrderModal from "../../../components/Modal/ArrangeOrderModal";
import ConfirmModal from "../../../components/Modal/ConfirmModal";
import { UserRoles } from "../../../constants";
import {
  createStage,
  deleteStage,
  getStages,
  updateStage,
  updateAllStages,
  ToastService,
} from "../../../services";
import {
  ActionMenuButtonWrapper,
  ActionMenuItem,
  ContentHeader,
  ContentWrapper,
} from "../../style";

const Stage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeStage, setActiveStage] = useState(null);
  const [openArrangeModal, setOpenArrangeModal] = useState(false);
  const [activeRow, setActiveRow] = useState(null);
  const isOpen = Boolean(anchorEl);
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState();
  const { account } = useAuthState();
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [removeItem, setRemoveItem] = useState(undefined);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [allStages, setAllStages] = useState([]);
  const [stages, setStages] = useState([]);
  const getLocaleString = (key) => t(key);

  const handleClick = (event, row) => {
    setActiveRow(row);
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleOpenModal = () => {
    setOpenModal(true);
    setActiveStage(null);
  };

  const handleOpenArrangeModal = async () => {
    await getStages({ pageSize: 0 })
      .then((res) => {
        setAllStages(res.rows);
      })
      .catch((err) => {
        console.log("err=>", err);
        ToastService.error(
          getLocaleString(
            err.response?.data?.message || "common_network_error",
          ),
        );
      });
    setOpenArrangeModal(true);
  };

  const getAllStages = useCallback(() => {
    let query = {};
    query.pageSize = pageSize;
    query.page = page;
    query.filters = filterModel.items.map((item) => ({
      field: item.field,
      operator: item.operator,
      value: item.value,
    }));
    query.filtersOperator = filterModel.logicOperator;
    return getStages(query);
  }, [filterModel, pageSize, page]);

  const handleChangedSearch = (filter) => {
    setFilterModel(filter);
  };

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
    getAllStages()
      .then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setStages(data.rows);
      })
      .catch((err) => {
        console.log("err=>", err);
        ToastService.error(getLocaleString("toast_load_stages_failed"));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllStages, filterModel]);

  const handleCreate = async (data) => {
    try {
      await createStage(data).then((res) => {
        ToastService.success(getLocaleString("toast_create_stage_success"));
        dispatch(addStage(res));
        handleOpenArrangeModal();
      });
      await getAllStages().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setStages(data.rows);
      });
    } catch (err) {
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
    setOpenModal(false);
  };

  const handleUpdate = async (id, data) => {
    try {
      await updateStage(id, data).then((res) => {
        dispatch(editStage(res));
        ToastService.success(getLocaleString("toast_update_stage_success"));
      });
      await getAllStages().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setStages(data.rows);
      });
    } catch (err) {
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
    setOpenModal(false);
  };

  const handleEditStage = (row) => {
    setOpenModal(true);
    setActiveStage(stages.find((stage) => stage.id === row.id));
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

  const handleRemoveStage = async () => {
    try {
      await deleteStage(removeItem.id).then((res) => {
        dispatch(removeStage(removeItem.id));
        ToastService.success(getLocaleString(res.message));
      });
      await getAllStages().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setStages(data.rows);
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

  const handleCloseArrangeModal = () => {
    setOpenArrangeModal(false);
  };

  const handleRearrangeOrders = async (e) => {
    const orderedStages = e.map((stage, index) => ({
      ...stage,
      order: index + 1,
    }));
    try {
      await updateAllStages(orderedStages).then((res) => {
        ToastService.success(getLocaleString(res.message));
      });
      await getAllStages().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setStages(data.rows);
      });
    } catch (err) {
      console.log("err=>", err);
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
  };

  const handleChangePage = (event, value) => {
    setPage(value);
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

  const stageTableColumns = [
    {
      field: "no",
      headerName: getLocaleString("common_table_number"),
      editable: false,
      filterable: false,
      flex: 0.5,
    },
    {
      field: "stageMode",
      headerName: getLocaleString("common_table_mode"),
      editable: false,
      flex: 1,
    },
    {
      field: "enabled",
      headerName: getLocaleString("common_table_enable"),
      editable: false,
      filterable: false,
      type: "boolean",
      flex: 0.5,
    },
    {
      field: "order",
      headerName: getLocaleString("common_table_order"),
      editable: false,
      flex: 0.5,
    },
    {
      field: "printPermission",
      headerName: getLocaleString("common_table_print_enable"),
      editable: false,
      type: "boolean",
      flex: 1,
    },
    {
      field: "createdAt",
      headerName: getLocaleString("common_table_created_at"),
      editable: false,
      type: "date",
      flex: 1,
      renderCell: ({ row }) =>
        moment(row.createdAt).utc(false).format("YYYY-MM-DD"),
    },
    {
      field: "updatedAt",
      headerName: getLocaleString("common_table_updated_at"),
      editable: false,
      type: "date",
      flex: 1,
      renderCell: ({ row }) =>
        moment(row.updatedAt).utc(false).format("YYYY-MM-DD"),
    },
    {
      field: "action",
      headerName: "",
      editable: false,
      filterable: false,
      flex: 1,
      renderCell,
    },
  ];

  const rows = stages.map((item, index) => ({
    ...item,
    no: (page - 1) * pageSize + index + 1,
    createdAt: moment(item.createdAt).toDate(),
    updatedAt: moment(item.updatedAt).toDate(),
  }));

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <ContentWrapper>
      <ContentHeader>
        <Box>
          <Typography variant="h5">
            {getLocaleString("stage_page_title")}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="between" gap="4px">
          <Button
            variant="outlined"
            startIcon={<SortIcon />}
            onClick={handleOpenArrangeModal}
          >
            {getLocaleString("common_table_arrange_order")}
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
        </Box>
      </ContentHeader>
      <CustomDataGrid
        rows={rows}
        columns={stageTableColumns}
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
          <ActionMenuItem onClick={() => handleEditStage(activeRow)}>
            <EditIcon sx={{ marginRight: "1rem", color: "gray" }} />
            {getLocaleString("common_edit")}
          </ActionMenuItem>
          {account.role.name === UserRoles.SUPERADMIN && (
            <ActionMenuItem onClick={() => handleOpenRemoveModal(activeRow)}>
              <DeleteIcon sx={{ marginRight: "1rem", color: "gray" }} />
              {getLocaleString("common_delete")}
            </ActionMenuItem>
          )}
        </Menu>
      )}
      <CreateStageModal
        data={activeStage}
        open={openModal}
        close={() => setOpenModal(false)}
        create={handleCreate}
        update={handleUpdate}
      />
      <ArrangeOrderModal
        open={openArrangeModal}
        close={handleCloseArrangeModal}
        onChange={(e) => handleRearrangeOrders(e)}
        data={allStages}
      />
      <ConfirmModal
        content="toast_delete_stage_confirm_message"
        open={openRemoveModal}
        close={handleCloseRemoveModal}
        handleClick={handleRemoveStage}
      />
    </ContentWrapper>
  );
};
export default Stage;
