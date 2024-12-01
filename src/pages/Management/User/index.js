import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthState } from "../../../hooks/redux";
import { Button, Typography, Menu, Pagination, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PasswordIcon from "@mui/icons-material/Password";
import MoreVertIcon from "@mui/icons-material/MoreVert";
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
} from "../../style";

const UserPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [users, setUsers] = useState({ rows: [], count: 0 });
  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [activeRow, setActiveRow] = useState(false);
  const pageSize = 10;
  const [totalPage, setTotalPage] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);
  const { account } = useAuthState();
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [removeItem, setRemoveItem] = useState(undefined);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [openResetPasswordModal, setOpenResetPasswordModal] = useState(false); // New state for reset password confirmation
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

  const getAllUsers = useCallback(() => {
    let query = {};
    query.pageSize = pageSize;
    query.page = page;
    query.filters = filterModel.items.map((item) => ({
      field: item.field,
      operator: item.operator,
      value: item.value,
    }));
    query.filtersOperator = filterModel.logicOperator;
    return getUsers(query);
  }, [filterModel, pageSize, page]);

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
        setTotalPage(Math.ceil(data.count / pageSize));
        setUsers(data);
      })
      .catch((err) => {
        ToastService.showHttpError(
          err,
          getLocaleString("toast_load_users_failed"),
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllUsers, filterModel]);

  const handleOpenRemoveModal = (item) => {
    setRemoveItem(item);
    setOpenRemoveModal(true);
  };

  const handleCloseRemoveModal = () => {
    handleClose();
    setOpenRemoveModal(false);
  };

  const handleRemoveUser = async () => {
    try {
      await deleteUser(removeItem.id).then((res) => {
        ToastService.success(getLocaleString(res.message));
      });
      await getAllUsers().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setUsers(data);
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

  const handleCreateUser = async (data) => {
    try {
      const { confirmPassword, ...value } = data;
      await createUser(value).then((res) => {
        ToastService.success(getLocaleString(res.message));
      });
      await getAllUsers().then((data) => {
        setUsers(data);
        setTotalPage(Math.ceil(data.count / pageSize));
      });
      handleCloseModal();
    } catch (err) {
      console.log("err=>", err);
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
  };

  const handleUpdateUser = async (id, data) => {
    const { password, confirmPassword, ...updateData } = data;
    try {
      await updateUser(id, updateData).then((res) => {
        ToastService.success(getLocaleString(res.message));
      });
      await getAllUsers().then((data) => {
        setUsers(data);
        setTotalPage(Math.ceil(data.count / pageSize));
      });
      handleCloseModal();
    } catch (err) {
      console.log("err=>", err);
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
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
        ToastService.error(
          getLocaleString(
            err.response?.data?.message || "common_network_error",
          ),
        );
      });
    handleClose(); // Close the confirmation modal
    setOpenResetPasswordModal(false); // Close the reset password modal
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
          <MoreVertIcon sx={{ color: "grey" }} />
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
      flex: 0.5,
    },
    {
      field: "userId",
      headerName: getLocaleString("common_table_userId"),
      editable: false,
      flex: 1,
    },
    {
      field: "name",
      headerName: getLocaleString("common_table_name"),
      editable: false,
      flex: 1,
    },
    {
      field: "email",
      headerName: getLocaleString("common_table_email"),
      editable: false,
      flex: 1,
    },
    {
      field: "role",
      headerName: getLocaleString("common_table_role"),
      editable: false,
      flex: 1,
    },
    {
      field: "section",
      headerName: getLocaleString("common_table_section"),
      editable: false,
      flex: 1,
    },
    {
      field: "subsection",
      headerName: getLocaleString("common_table_subsection"),
      editable: false,
      flex: 1,
    },
    {
      field: "activated",
      headerName: getLocaleString("common_table_active"),
      type: "boolean",
      editable: false,
      flex: 1,
    },
    {
      field: "action",
      headerName: "",
      filterable: false,
      editable: false,
      flex: 1,
      renderCell,
    },
  ];

  const rows = users.rows.map((row, index) => ({
    ...row,
    no: (page - 1) * pageSize + index + 1,
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
        <Typography variant="h5">
          {getLocaleString("user_page_title")}
        </Typography>
        <Box>
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
            sx={{ marginLeft: "0.25rem" }}
          >
            {getLocaleString("common_go_back")}
          </Button>
        </Box>
      </ContentHeader>
      <CustomDataGrid
        rows={rows}
        columns={userTableColumns}
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
            <EditIcon sx={{ marginRight: "1rem", color: "gray" }} />
            {getLocaleString("common_edit")}
          </ActionMenuItem>
          <ActionMenuItem onClick={() => handleResetPassword(activeRow)}>
            <PasswordIcon sx={{ marginRight: "1rem", color: "gray" }} />
            {getLocaleString("common_reset_password")}
          </ActionMenuItem>
          {account.role.name === UserRoles.SUPERADMIN && (
            <ActionMenuItem onClick={() => handleOpenRemoveModal(activeRow)}>
              <DeleteIcon sx={{ marginRight: "1rem", color: "gray" }} />
              {getLocaleString("common_delete")}
            </ActionMenuItem>
          )}
        </Menu>
      )}
      <ConfirmModal
        content={getLocaleString("toast_delete_user_confirm_message")}
        open={openRemoveModal}
        close={handleCloseRemoveModal}
        handleClick={handleRemoveUser}
      />
      <ConfirmModal
        content={getLocaleString("toast_reset_password_confirm_message")} // Add content for reset password confirmation
        open={openResetPasswordModal}
        close={() => setOpenResetPasswordModal(false)} // Close the confirmation modal
        handleClick={confirmResetPassword} // Confirm password reset
      />
    </ContentWrapper>
  );
};

export default UserPage;
