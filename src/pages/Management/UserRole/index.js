import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
  addRole,
  editRole,
  removeRole,
  setRoles as setRolesAction,
} from "../../../redux/actions";
import { Box, Button, Chip, Menu, Pagination, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import moment from "moment";
import CustomDataGrid from "../../../components/common/DataGrid";
import CreateUserRoleModal from "../../../components/Modal/CreateUserRoleModal";
import ConfirmModal from "../../../components/Modal/ConfirmModal";
import { useAuthState } from "../../../hooks/redux";
import { UserRoles } from "../../../constants";
import {
  createRole,
  deleteRole,
  getRoles,
  updateRole,
  ToastService,
} from "../../../services";
import {
  ActionMenuButtonWrapper,
  ActionMenuItem,
  ContentHeader,
  ContentWrapper,
} from "../../style";

const UserRole = () => {
  const { account } = useAuthState();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const isOpen = Boolean(anchorEl);
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState();
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
    setActiveRole(null);
  };

  const handleChangedSearch = (filter) => {
    setFilterModel(filter);
  };

  const getAllRoles = useCallback(() => {
    let query = {};
    query.pageSize = pageSize;
    query.page = page;
    query.filters = filterModel.items.map((item) => ({
      field: item.field,
      operator: item.operator,
      value: item.value,
    }));
    query.filtersOperator = filterModel.logicOperator;
    return getRoles(query);
  }, [pageSize, page, filterModel]);

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
    getAllRoles()
      .then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setRoles(data.rows);
      })
      .catch((err) => {
        console.log("err=>", err);
        ToastService.error(getLocaleString("toast_load_user_roles_failed"));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllRoles, filterModel]);

  const handleCreate = async (data) => {
    try {
      await createRole(data).then((res) => {
        ToastService.success(getLocaleString("toast_create_user_role_success"));
        dispatch(addRole(res));
      });
      await getAllRoles().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setRoles(data.rows);
      });
    } catch (err) {
      console.log("err=> ", err);
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
    setOpenModal(false);
  };

  const handleUpdate = async (id, data) => {
    try {
      await updateRole(id, data).then((res) => {
        dispatch(editRole(res));
        ToastService.success(getLocaleString("toast_update_user_role_success"));
      });
      await getAllRoles().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setRoles(data.rows);
      });
    } catch (err) {
      console.log("err=>", err);
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
    setOpenModal(false);
  };

  const handleEditRole = (row) => {
    setOpenModal(true);
    setActiveRole(roles.find((role) => role.id === row.id));
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

  const handleRemoveRole = async () => {
    try {
      await deleteRole(removeItem.id).then((res) => {
        dispatch(removeRole(removeItem.id));
        ToastService.success(getLocaleString(res.message));
      });
      await getAllRoles().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setRoles(data.rows);
      });
    } catch (err) {
      console.log("err=>", err);
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

  const roleTableColumns = [
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
      flex: 2,
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
      field: "color",
      headerName: getLocaleString("common_table_color"),
      editable: false,
      filterable: false,
      flex: 1,
      renderCell: ({ row }) => {
        return (
          <div className="flex items-center justify-start w-full h-full">
            <div className="w-20 h-4" style={{ backgroundColor: row?.color }} />
          </div>
        );
      },
    },
    {
      field: "archived",
      headerName: getLocaleString("common_table_archived"),
      editable: false,
      type: "boolean",
      flex: 1,
    },
    {
      field: "signature",
      headerName: getLocaleString("common_table_signature"),
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

  const rows = roles.map((item, index) => ({
    ...item,
    no: (page - 1) * pageSize + index + 1,
    archived: item.archived,
    signature: item.signature,
    createdAt: moment(item.createdAt).toDate(),
    updatedAt: moment(item.updatedAt).toDate(),
  }));

  const handleGoBack = () => {
    navigate("/");
  };

  useEffect(() => {
    return () => {
      getRoles()
        .then((res) => {
          dispatch(setRolesAction(res.rows));
        })
        .catch((err) => {
          console.log("err=>", err);
        });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ContentWrapper>
      <ContentHeader>
        <Box>
          <Typography variant="h5">User Roles</Typography>
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
        columns={roleTableColumns}
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
          <ActionMenuItem onClick={() => handleEditRole(activeRow)}>
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
      <CreateUserRoleModal
        data={activeRole}
        open={openModal}
        close={() => setOpenModal(false)}
        create={handleCreate}
        update={handleUpdate}
      />
      <ConfirmModal
        content="toast_delete_user_role_confirm_message"
        open={openRemoveModal}
        close={handleCloseRemoveModal}
        handleClick={handleRemoveRole}
      />
    </ContentWrapper>
  );
};

export default UserRole;
