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
import { Box, Button, Menu, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
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
  ArchivedChip,
  ArchivedIcon,
  ContentHeader,
  ContentWrapper,
  MenuItemButton,
  MoreActionsIcon,
} from "../../style";
import debounce from "lodash/debounce";

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
  const [rowLength, setRowLength] = useState(0);
  const isOpen = Boolean(anchorEl);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [removeItem, setRemoveItem] = useState(undefined);
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
    setActiveRole(null);
  };

  const handleChangedSearch = (filter) => {
    setFilterModel(filter);
  };

  const handleDebounceChangeSearch = debounce(handleChangedSearch, 500);

  const getAllRoles = useCallback(() => {
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
    return getRoles(query);
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
    getAllRoles()
      .then((data) => {
        setRowLength(data.count);
        setRoles(data.rows);
      })
      .catch((err) => {
        console.log("err=>", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllRoles, filterModel, paginationModel]);

  const handleCreate = async (data) => {
    await createRole(data).then((res) => {
      ToastService.success(getLocaleString("toast_create_user_role_success"));
      dispatch(addRole(res));
    });
    await getAllRoles().then((data) => {
      setRowLength(data.count);
      setRoles(data.rows);
    });
    setOpenModal(false);
  };

  const handleUpdate = async (id, data) => {
    await updateRole(id, data).then((res) => {
      dispatch(editRole(res));
      ToastService.success(getLocaleString("toast_update_user_role_success"));
    });
    await getAllRoles().then((data) => {
      setRowLength(data.count);
      setRoles(data.rows);
    });
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
    await deleteRole(removeItem.id).then((res) => {
      dispatch(removeRole(removeItem.id));
      ToastService.success(getLocaleString(res.message));
    });
    await getAllRoles().then((data) => {
      setRowLength(data.count);
      setRoles(data.rows);
    });
    handleClose();
    setOpenRemoveModal(false);
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

  const roleTableColumns = [
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
      flex: 2,
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
      field: "color",
      headerName: getLocaleString("common_table_color"),
      editable: false,
      filterable: false,
      flex: 1,
      minWidth: 150,
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
      minWidth: 100,
    },
    {
      field: "signature",
      headerName: getLocaleString("common_table_signature"),
      editable: false,
      type: "boolean",
      flex: 1,
      minWidth: 100,
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

  const rows = roles.map((item, index) => ({
    ...item,
    no: paginationModel.page * paginationModel.pageSize + index + 1,
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
        <Box className="mr-2">
          <Typography variant="h5">
            {getLocaleString("sidebar_user_roles")}
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
        columns={roleTableColumns}
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
          <ActionMenuItem onClick={() => handleEditRole(activeRow)}>
            <EditIcon className="menu-icon" />
            {getLocaleString("common_edit")}
          </ActionMenuItem>
          {account.role.name === UserRoles.SUPERADMIN && (
            <ActionMenuItem onClick={() => handleOpenRemoveModal(activeRow)}>
              <DeleteIcon className="menu-icon" />
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
