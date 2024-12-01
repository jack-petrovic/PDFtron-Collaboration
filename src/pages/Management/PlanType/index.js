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
import { Box, Button, Chip, Menu, Pagination, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
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
  ContentHeader,
  ContentWrapper,
} from "../../style";

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
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState();
  const { account } = useAuthState();
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [removeItem, setRemoveItem] = useState(undefined);
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
    let query = {};
    query.pageSize = pageSize;
    query.page = page;
    query.filters = filterModel.items.map((item) => ({
      field: item.field,
      operator: item.operator,
      value: item.value,
    }));
    query.filtersOperator = filterModel.logicOperator;
    return getTypes(query);
  }, [pageSize, page, filterModel]);

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
    getAllTypes()
      .then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setTypes(data.rows);
      })
      .catch((err) => {
        console.log("err=>", err);
        ToastService.error(getLocaleString("toast_load_plan_types_failed"));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllTypes, filterModel]);

  const handleCreate = async (data) => {
    try {
      await createType(data).then((res) => {
        ToastService.success(getLocaleString("toast_create_plan_type_success"));
        dispatch(addPlanType(res));
      });
      await getAllTypes().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setTypes(data.rows);
      });
    } catch (err) {
      console.log("err=>", err);
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
    setOpenModal(false);
  };

  const handleUpdate = async (id, data) => {
    try {
      await updateType(id, data).then((res) => {
        dispatch(editPlanType(res));
        ToastService.success(getLocaleString("toast_update_plan_type_success"));
      });
      await getAllTypes().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setTypes(data.rows);
      });
    } catch (err) {
      console.log("err=>", err);
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
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
    try {
      await deleteType(removeItem.id).then((res) => {
        dispatch(removePlanType(removeItem.id));
        ToastService.success(getLocaleString(res.message));
      });
      await getAllTypes().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setTypes(data.rows);
      });
    } catch (err) {
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
    handleClose();
    setOpenRemoveModal(false);
  };

  const handleChangePage = (event, value) => {
    setPage(value);
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
          <MoreVertIcon sx={{ color: "gray" }} />
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
    },
    {
      field: "name",
      headerName: getLocaleString("common_table_name"),
      editable: false,
      flex: 3,
      renderCell: ({ row }) => (
        <React.Fragment key={row.no}>
          {row.name}
          {row.archived && (
            <Chip
              label={getLocaleString("common_table_archived")}
              icon={<WarningAmberIcon sx={{ fontSize: "16px" }} />}
              color="warning"
              sx={{ marginLeft: "0.5rem" }}
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

  const rows = types.map((item, index) => ({
    ...item,
    no: (page - 1) * pageSize + index + 1,
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
        <Box>
          <Typography variant="h5">
            {getLocaleString("plan_type_page_title")}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="between" gap="4px">
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
        columns={typeTableColumns}
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
          <ActionMenuItem onClick={() => handleEditType(activeRow)}>
            <EditIcon sx={{ marginRight: "1rem", color: "gray" }} />
            {getLocaleString("common_edit")}
          </ActionMenuItem>
          {account.role.name === UserRoles.SUPERADMIN && (
            <ActionMenuItem onClick={() => handleOpenRemoveModal(activeRow)}>
              <DeleteIcon sx={{ marginRight: "1rem", color: "gray" }} />
              {getLocaleString("common_delete")}
            </ActionMenuItem>
          )}
          <ActionMenuItem onClick={() => goToSubPlanTypePage(activeRow)}>
            <SubdirectoryArrowRightIcon
              sx={{ marginRight: "1rem", color: "gray" }}
            />
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
