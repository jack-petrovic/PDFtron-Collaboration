import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
  addSubPlanType,
  editSubPlanType,
  removeSubPlanType,
} from "../../../redux/actions";
import { Box, Button, Chip, Menu, Pagination, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import moment from "moment";
import CustomDataGrid from "../../../components/common/DataGrid";
import CreateSubPlanTypeModal from "../../../components/Modal/CreateSubPlanTypeModal";
import {
  createSubType,
  getSubPlanTypes,
  updateSubType,
  ToastService,
  deleteSubType,
} from "../../../services";
import {
  ActionMenuButtonWrapper,
  ActionMenuItem,
  ContentHeader,
  ContentWrapper,
} from "../../style";
import ConfirmModal from "../../../components/Modal/ConfirmModal";
import { UserRoles } from "../../../constants";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuthState } from "../../../hooks/redux";

const SubPlanType = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [subTypes, setSubTypes] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeSubType, setActiveSubType] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const isOpen = Boolean(anchorEl);
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState();
  const { account } = useAuthState();
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [removeItem, setRemoveItem] = useState(undefined);
  const [filterModel, setFilterModel] = useState({ items: [] });
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
    setActiveSubType(null);
  };

  const getAllSubTypes = useCallback(() => {
    let query = {};
    query.id = id;
    query.pageSize = pageSize;
    query.page = page;
    query.filters = filterModel.items.map((item) => ({
      field: item.field,
      operator: item.operator,
      value: item.value,
    }));
    query.filtersOperator = filterModel.logicOperator;
    return getSubPlanTypes(query);
  }, [pageSize, page, filterModel, id]);

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
    getAllSubTypes()
      .then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setSubTypes(data.rows);
      })
      .catch((err) => {
        console.log("err=>", err);
        ToastService.error(getLocaleString("toast_load_sub_plan_types_failed"));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllSubTypes, filterModel, id]);

  const handleCreateSubPlanType = async (data, id) => {
    try {
      await createSubType({
        ...data,
        planTypeId: id,
      }).then((res) => {
        ToastService.success(
          getLocaleString("toast_create_sub_plan_type_success"),
        );
        dispatch(addSubPlanType(res));
      });

      await getAllSubTypes().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setSubTypes(data.rows);
      });
      setOpenModal(false);
    } catch (err) {
      console.log("err=>", err);
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
  };

  const handleUpdateSubPlanType = async (sub_id, data) => {
    try {
      await updateSubType(sub_id, data).then((res) => {
        dispatch(editSubPlanType(res));
        ToastService.success(
          getLocaleString("toast_update_sub_plan_type_success"),
        );
      });
      await getAllSubTypes().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setSubTypes(data.rows);
      });
    } catch (err) {
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
    setOpenModal(false);
  };

  const handleEditSubPlanType = (row) => {
    setOpenModal(true);
    setActiveSubType(subTypes.find((type) => type.id === row.id));
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

  const handleRemoveSubType = async () => {
    try {
      await deleteSubType(removeItem.id).then((res) => {
        dispatch(removeSubPlanType(removeItem.id));
        ToastService.success(getLocaleString(res.message));
      });
      await getAllSubTypes().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setSubTypes(data.rows);
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
      flex: 0.5,
    },
    {
      field: "name",
      headerName: getLocaleString("common_table_name"),
      editable: false,
      flex: 1,
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
      field: "planTypeId",
      headerName: getLocaleString("common_table_plan_type"),
      editable: false,
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

  const rows = subTypes.map((item, index) => ({
    ...item,
    no: (page - 1) * pageSize + index + 1,
    archived: item.archived,
    planTypeId: item.planTypeId,
    createdAt: moment(item.createdAt).toDate(),
    updatedAt: moment(item.updatedAt).toDate(),
  }));

  const handleGoBack = () => {
    const pathArr = location.pathname.split("/");
    navigate(`${pathArr.slice(0, pathArr.length - 1).join("/")}`);
  };

  return (
    <ContentWrapper>
      <ContentHeader>
        <Box>
          <Typography variant="h5">
            {getLocaleString("sub_plan_type_page_title")}
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
          <ActionMenuItem onClick={() => handleEditSubPlanType(activeRow)}>
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
      <CreateSubPlanTypeModal
        data={activeSubType}
        open={openModal}
        close={() => setOpenModal(false)}
        create={handleCreateSubPlanType}
        update={handleUpdateSubPlanType}
      />
      <ConfirmModal
        content="toast_delete_sub_plan_type_confirm_message"
        open={openRemoveModal}
        close={handleCloseRemoveModal}
        handleClick={handleRemoveSubType}
      />
    </ContentWrapper>
  );
};
export default SubPlanType;
