import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
  addPlanType,
  editPlanType,
  removePlanType,
} from "../../../redux/actions";
import { useAuthState } from "../../../hooks/redux";
import { Box, Button, Menu, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import moment from "moment";
import CustomDataGrid from "../../../components/common/DataGrid";
import CreateTypeModal from "../../../components/Modal/CreateTypeModal";
import ConfirmModal from "../../../components/Modal/ConfirmModal";
import { UserRoles } from "../../../constants";
import {
  createType,
  deleteType,
  getTypes,
  updateType,
  ToastService,
} from "../../../services";
import {
  ActionMenuButtonWrapper,
  ActionMenuItem,
  ArchivedChip,
  ArchivedIcon,
  ContentHeader,
  ContentWrapper,
  MenuItemButton,
  MoreActionsIcon,
} from "../../style";
import debounce from "lodash/debounce";

const PlanType = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeType, setActiveType] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const isOpen = Boolean(anchorEl);
  const [rowLength, setRowLength] = useState(0);
  const { account } = useAuthState();
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [removeItem, setRemoveItem] = useState(undefined);

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

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
    setActiveType(null);
  };

  const handleCloseModal = () => {
    setActiveType(null);
    setOpenModal(false);
  };

  const getAllTypes = useCallback(() => {
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
    return getTypes(query);
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
    getAllTypes()
      .then((data) => {
        setRowLength(data.count);
        setTypes(data.rows);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllTypes, filterModel, paginationModel]);

  const handleCreate = async (data) => {
    await createType(data).then((res) => {
      ToastService.success(getLocaleString("toast_create_plan_type_success"));
      dispatch(addPlanType(res));
    });
    await getAllTypes().then((data) => {
      setRowLength(data.count);
      setTypes(data.rows);
    });
    setOpenModal(false);
  };

  const handleUpdate = async (id, data) => {
    await updateType(id, data).then((res) => {
      dispatch(editPlanType(res));
      ToastService.success(getLocaleString("toast_update_plan_type_success"));
    });
    await getAllTypes().then((data) => {
      setRowLength(data.count);
      setTypes(data.rows);
    });
    setOpenModal(false);
  };

  const handleEditType = (row) => {
    setOpenModal(true);
    setActiveType(types.find((type) => type.id === row.id));
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

  const handleRemoveType = async () => {
    await deleteType(removeItem.id).then((res) => {
      dispatch(removePlanType(removeItem.id));
      ToastService.success(getLocaleString(res.message));
    });
    await getAllTypes().then((data) => {
      setRowLength(data.count);
      setTypes(data.rows);
    });
    handleClose();
    setOpenRemoveModal(false);
  };


  const goToSubPlanTypePage = (item) => {
    navigate(`/management/plan-types/${item.id}`);
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

  const typeTableColumns = [
    {
      field: "no",
      headerName: getLocaleString("common_table_number"),
      editable: false,
      filterable: false,
      flex: 1,
      minWidth: 100,
    },
    {
      field: "name",
      headerName: getLocaleString("common_table_name"),
      editable: false,
      flex: 3,
      minWidth: 250,
      renderCell: ({ row }) => (
        <React.Fragment key={row.no}>
          {row.name}
          {row.archived && (
            <ArchivedChip
              label={getLocaleString("common_table_archived")}
              icon={<ArchivedIcon />}
              color="warning"
            />
          )}
        </React.Fragment>
      ),
    },
    {
      field: "archived",
      headerName: getLocaleString("common_table_archived"),
      editable: false,
      type: "boolean",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "createdAt",
      headerName: getLocaleString("common_table_created_at"),
      editable: false,
      type: "date",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) =>
        moment(row.createdAt).utc(false).format("YYYY-MM-DD"),
    },
    {
      field: "updatedAt",
      headerName: getLocaleString("common_table_updated_at"),
      editable: false,
      type: "date",
      flex: 1,
      minWidth: 150,
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

  const rows = types.map((item, index) => ({
    ...item,
    no: paginationModel.page * paginationModel.pageSize + index + 1,
    archived: item.archived,
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
            {getLocaleString("plan_type_page_title")}
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
        columns={typeTableColumns}
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
          <ActionMenuItem onClick={() => handleEditType(activeRow)}>
            <EditIcon className="menu-icon" />
            {getLocaleString("common_edit")}
          </ActionMenuItem>
          {account.role.name === UserRoles.SUPERADMIN && (
            <ActionMenuItem onClick={() => handleOpenRemoveModal(activeRow)}>
              <DeleteIcon className="menu-icon" />
              {getLocaleString("common_delete")}
            </ActionMenuItem>
          )}
          <ActionMenuItem onClick={() => goToSubPlanTypePage(activeRow)}>
            <SubdirectoryArrowRightIcon className="menu-icon" />
            {getLocaleString("type_go_to_sub_type")}
          </ActionMenuItem>
        </Menu>
      )}
      <CreateTypeModal
        data={activeType}
        open={openModal}
        close={handleCloseModal}
        create={handleCreate}
        update={handleUpdate}
      />
      <ConfirmModal
        content="toast_delete_plan_type_confirm_message"
        open={openRemoveModal}
        close={handleCloseRemoveModal}
        handleClick={handleRemoveType}
      />
    </ContentWrapper>
  );
};

export default PlanType;
