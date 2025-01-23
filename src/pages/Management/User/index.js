import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthState } from "../../../hooks/redux";
import { Button, Typography, Menu, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PasswordIcon from "@mui/icons-material/Password";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import moment from "moment";
import CustomDataGrid from "../../../components/common/DataGrid";
import CreateUserModal from "../../../components/Modal/CreateUserModal";
import ConfirmModal from "../../../components/Modal/ConfirmModal";
import { UserRoles } from "../../../constants";
import {
  getUsers,
  updateUser,
  resetPassword,
  deleteUser,
  ToastService,
  createUser,
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

const UserPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [users, setUsers] = useState({ rows: [], count: 0 });
  const [openModal, setOpenModal] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [activeRow, setActiveRow] = useState(false);
  const [rowLength, setRowLength] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);
  const { account } = useAuthState();
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [removeItem, setRemoveItem] = useState(undefined);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [openResetPasswordModal, setOpenResetPasswordModal] = useState(false); // New state for reset password confirmation

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
    setActiveUser(null);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setActiveUser(null);
  };

  const handleChangedSearch = (filter) => {
    setFilterModel(filter);
  };

  const handleDebounceChangeSearch = debounce(handleChangedSearch, 500);

  const getAllUsers = useCallback(() => {
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
    return getUsers(query);
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
    getAllUsers()
      .then((data) => {
        setRowLength(data.count);
        setUsers(data);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllUsers, filterModel, paginationModel]);

  const handleOpenRemoveModal = (item) => {
    setRemoveItem(item);
    setOpenRemoveModal(true);
  };

  const handleCloseRemoveModal = () => {
    handleClose();
    setOpenRemoveModal(false);
  };

  const handleRemoveUser = async () => {
    await deleteUser(removeItem.id).then((res) => {
      ToastService.success(getLocaleString(res.message));
    });
    await getAllUsers().then((data) => {
      setRowLength(data.count);
      setUsers(data);
    });
    handleClose();
    setOpenRemoveModal(false);
  };

  const handleCreateUser = async (data) => {
    const { confirmPassword, ...value } = data;
    await createUser(value).then((res) => {
      ToastService.success(getLocaleString(res.message));
    });
    await getAllUsers().then((data) => {
      setUsers(data);
      setRowLength(data.count);
    });
    handleCloseModal();
  };

  const handleUpdateUser = async (id, data) => {
    const { password, confirmPassword, ...updateData } = data;
    await updateUser(id, updateData).then((res) => {
      ToastService.success(getLocaleString(res.message));
    });
    await getAllUsers().then((data) => {
      setUsers(data);
      setRowLength(data.count);
    });
    handleCloseModal();
  };

  const handleEditUser = (user) => {
    setActiveUser(user);
    setOpenModal(true);
    handleClose();
  };

  const handleResetPassword = (user) => {
    setActiveUser(user); // Set the active user for confirmation
    setOpenResetPasswordModal(true); // Open confirmation modal
  };

  const confirmResetPassword = async () => {
    await resetPassword(activeUser.id)
      .then((res) => {
        ToastService.success(getLocaleString(res.message));
      })
      .catch((err) => {
        console.log("err=>", err);
      });
    handleClose(); // Close the confirmation modal
    setOpenResetPasswordModal(false); // Close the reset password modal
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

  const userTableColumns = [
    {
      field: "no",
      headerName: getLocaleString("common_table_number"),
      editable: false,
      filterable: false,
      flex: 1,
      minWidth: 100,
    },
    {
      field: "userId",
      headerName: getLocaleString("common_table_userId"),
      editable: false,
      flex: 2,
      minWidth: 150,
    },
    {
      field: "name",
      headerName: getLocaleString("common_table_name"),
      editable: false,
      flex: 2,
      minWidth: 150,
    },
    {
      field: "email",
      headerName: getLocaleString("common_table_email"),
      editable: false,
      flex: 2,
      minWidth: 150,
    },
    {
      field: "role",
      headerName: getLocaleString("common_table_role"),
      editable: false,
      flex: 2,
      minWidth: 150,
    },
    {
      field: "section",
      headerName: getLocaleString("common_table_section"),
      editable: false,
      flex: 2,
      minWidth: 150,
    },
    {
      field: "subsection",
      headerName: getLocaleString("common_table_subsection"),
      editable: false,
      flex: 2,
      minWidth: 150,
    },
    {
      field: "activated",
      headerName: getLocaleString("common_table_active"),
      type: "boolean",
      editable: false,
      flex: 1,
      minWidth: 100,
    },
    {
      field: "action",
      headerName: getLocaleString("common_table_action"),
      filterable: false,
      editable: false,
      sortable: false,
      width: 100,
      renderCell,
    },
  ];

  const rows = users.rows.map((row, index) => ({
    ...row,
    no: paginationModel.page * paginationModel.pageSize + index + 1,
    email: row.email || "",
    section: row.section?.name || "None",
    subsection: row.subsection?.name || "None",
    role: row.role?.name || "None",
    createdAt: moment(row.createdAt).toDate(),
    updatedAt: moment(row.updatedAt).toDate(),
    active: row.activated || false,
  }));

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <ContentWrapper>
      <ContentHeader>
        <Box className="mr-2">
          <Typography variant="h5">
            {getLocaleString("user_page_title")}
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
        columns={userTableColumns}
        filterMode="server"
        rowLength={rowLength}
        onPaginationModelChange={setPaginationModel}
        paginationModel={paginationModel}
        filterModel={filterModel}
        onFilterChanged={handleDebounceChangeSearch}
      />
      {openModal && (
        <CreateUserModal
          open={openModal}
          close={handleCloseModal}
          create={handleCreateUser}
          update={handleUpdateUser}
          data={activeUser}
        />
      )}
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
          <ActionMenuItem onClick={() => handleEditUser(activeRow)}>
            <EditIcon className="menu-icon" />
            {getLocaleString("common_edit")}
          </ActionMenuItem>
          <ActionMenuItem onClick={() => handleResetPassword(activeRow)}>
            <PasswordIcon className="menu-icon" />
            {getLocaleString("common_reset_password")}
          </ActionMenuItem>
          {account.role.name === UserRoles.SUPERADMIN && (
            <ActionMenuItem onClick={() => handleOpenRemoveModal(activeRow)}>
              <DeleteIcon className="menu-icon" />
              {getLocaleString("common_delete")}
            </ActionMenuItem>
          )}
        </Menu>
      )}
      <ConfirmModal
        content="toast_delete_user_confirm_message"
        open={openRemoveModal}
        close={handleCloseRemoveModal}
        handleClick={handleRemoveUser}
      />
      <ConfirmModal
        content="toast_reset_password_confirm_message"
        open={openResetPasswordModal}
        close={() => setOpenResetPasswordModal(false)} // Close the confirmation modal
        handleClick={confirmResetPassword} // Confirm password reset
      />
    </ContentWrapper>
  );
};

export default UserPage;
