import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useAuthState } from "../../../hooks/redux";
import { addStage, editStage, removeStage } from "../../../redux/actions";
import { Box, Button, Menu, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SortIcon from "@mui/icons-material/Sort";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import moment from "moment";
import CustomDataGrid from "../../../components/common/DataGrid";
import CreateStageModal from "../../../components/Modal/CreateStageModal";
import ArrangeOrderModal from "../../../components/Modal/ArrangeOrderModal";
import ConfirmModal from "../../../components/Modal/ConfirmModal";
import { StageMode, UserRoles } from "../../../constants";
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
  MenuItemButton,
  MoreActionsIcon,
} from "../../style";
import debounce from "lodash/debounce";

const Stage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeStage, setActiveStage] = useState(null);
  const [openArrangeModal, setOpenArrangeModal] = useState(false);
  const [activeRow, setActiveRow] = useState(null);
  const [rowLength, setRowLength] = useState(0);
  const isOpen = Boolean(anchorEl);
  const { account } = useAuthState();
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [removeItem, setRemoveItem] = useState(undefined);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [allStages, setAllStages] = useState([]);
  const [stages, setStages] = useState([]);
  const getLocaleString = (key) => t(key);

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

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
      });
    setOpenArrangeModal(true);
  };

  const getAllStages = useCallback(() => {
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
    return getStages(query);
  }, [filterModel, paginationModel]);

  const handleChangedSearch = (filter) => {
    setFilterModel(filter);
  };

  const handleDebounceChangeSearch = debounce(handleChangedSearch, 500);

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
        setRowLength(data.count);
        setStages(data.rows);
      })
      .catch((err) => {
        console.log("err=>", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllStages, filterModel, paginationModel]);

  const handleCreate = async (data) => {
    await createStage(data)
      .then((res) => {
        ToastService.success(getLocaleString("toast_create_stage_success"));
        dispatch(addStage(res));
        handleOpenArrangeModal();
      });
      await getAllStages().then((data) => {
        setRowLength(data.count);
        setStages(data.rows);
      });
    setOpenModal(false);
  };

  const handleUpdate = async (id, data) => {
    await updateStage(id, data)
      .then((res) => {
        dispatch(editStage(res));
        ToastService.success(getLocaleString("toast_update_stage_success"));
      });
      await getAllStages().then((data) => {
        setRowLength(data.count);
        setStages(data.rows);
      });
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
    await deleteStage(removeItem.id)
      .then((res) => {
        dispatch(removeStage(removeItem.id));
        ToastService.success(getLocaleString(res.message));
      });
      await getAllStages().then((data) => {
        setRowLength(data.count);
        setStages(data.rows);
      });
    handleClose();
    setOpenRemoveModal(false);
  };

  const handleCloseArrangeModal = () => {
    setOpenArrangeModal(false);
  };

  const handleRearrangeOrders = async (e) => {
    const orderedStages = e.map((stage, index) => ({
      ...stage,
      order: index + 1,
    }));
    await updateAllStages(orderedStages)
      .then((res) => {
        ToastService.success(getLocaleString(res.message));
      });
      await getAllStages().then((data) => {
        setRowLength(data.count);
        setStages(data.rows);
        data.rows.forEach((item) => {
          dispatch(editStage(item));
        })
      });
  };

  const renderCell = ({ row }) => {
    return (
      row.stageMode !== StageMode.PRESCRIPTIONMODE && (
        <ActionMenuButtonWrapper>
          <Button
            id="basic-button"
            aria-controls="basic-menu"
            aria-haspopup="true"
            aria-expanded={isOpen}
            onClick={(event) => handleClick(event, row)}
          >
            <MoreActionsIcon />
          </Button>
        </ActionMenuButtonWrapper>
      )
    );
  };

  const stageTableColumns = [
    {
      field: "no",
      headerName: getLocaleString("common_table_number"),
      editable: false,
      filterable: false,
      flex: 1,
      minWidth: 100,
    },
    {
      field: "stageMode",
      headerName: getLocaleString("common_table_mode"),
      editable: false,
      flex: 3,
      minWidth: 250,
    },
    {
      field: "enabled",
      headerName: getLocaleString("common_table_enable"),
      editable: false,
      filterable: false,
      type: "boolean",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "order",
      headerName: getLocaleString("common_table_order"),
      editable: false,
      flex: 1,
      minWidth: 100,
    },
    {
      field: "createdAt",
      headerName: getLocaleString("common_table_created_at"),
      editable: false,
      type: "date",
      flex: 1,
      minWidth: 100,
      renderCell: ({ row }) =>
        moment(row.createdAt).utc(false).format("YYYY-MM-DD"),
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
      field: "action",
      headerName: getLocaleString("common_table_action"),
      editable: false,
      filterable: false,
      sortable: false,
      width: 100,
      renderCell,
    },
  ];

  const rows = stages.map((item, index) => ({
    ...item,
    no: paginationModel.page * paginationModel.pageSize + index + 1,
    createdAt: moment(item.createdAt).toDate(),
    updatedAt: moment(item.updatedAt).toDate(),
  }));

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <ContentWrapper>
      <ContentHeader>
        <Box className="mr-2">
          <Typography variant="h5">
            {getLocaleString("stage_page_title")}
          </Typography>
        </Box>
        <Box className="sm:flex justify-between gap-1">
          <MenuItemButton
            variant="outlined"
            startIcon={<SortIcon />}
            onClick={handleOpenArrangeModal}
            className="w-full sm:w-auto"
          >
            {getLocaleString("common_table_arrange_order")}
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
        </Box>
      </ContentHeader>
      <CustomDataGrid
        rows={rows}
        columns={stageTableColumns}
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
          {activeRow.stageMode !== StageMode.PRESCRIPTIONMODE && (
            <ActionMenuItem onClick={() => handleEditStage(activeRow)}>
              <EditIcon className="menu-icon" />
              {getLocaleString("common_edit")}
            </ActionMenuItem>
          )}
          {account.role.name === UserRoles.SUPERADMIN && (
            <ActionMenuItem onClick={() => handleOpenRemoveModal(activeRow)}>
              <DeleteIcon className="menu-icon" />
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
