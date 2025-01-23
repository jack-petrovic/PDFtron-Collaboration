import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, Button, Menu, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import DifferenceIcon from "@mui/icons-material/Difference";
import ReviewsIcon from "@mui/icons-material/Reviews";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import moment from "moment";
import { useAuthState } from "../../../hooks/redux";
import {
  createPrescription,
  getPrescriptions,
  updatePrescription,
  deletePrescription,
  ToastService,
  getPlan,
} from "../../../services";
import CustomDataGrid from "../../../components/common/DataGrid";
import CreatePrescriptionModal from "../../../components/Modal/CreatePrescriptionModal";
import ConfirmModal from "../../../components/Modal/ConfirmModal";
import { UserRoles } from "../../../constants";
import {
  ActionMenuButtonWrapper,
  ActionMenuItem,
  ContentHeader,
  ContentWrapper,
  MoreActionsIcon,
} from "../../style";
import ViewPrescriptionModal from "../../../components/Modal/ViewPrescriptionModal";
import VisibilityIcon from "@mui/icons-material/Visibility";
import debounce from "lodash/debounce";

const Prescription = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { account } = useAuthState();
  const { id } = useParams();
  const [prescriptions, setPrescriptions] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activePrescription, setActivePrescription] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const isOpen = Boolean(anchorEl);
  const [rowLength, setRowLength] = useState(0);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [removeItem, setRemoveItem] = useState(undefined);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
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
    setActivePrescription(null);
  };

  const handleChangedSearch = (filter) => {
    setFilterModel(filter);
  };

  const handleDebounceChangeSearch = debounce(handleChangedSearch, 500);

  const getAllPrescriptions = useCallback(() => {
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
    if (id) {
      query.filters.push({
        field: "plan",
        operator: "equals",
        value: id,
      });
    }
    return getPrescriptions(query);
  }, [id, paginationModel, filterModel]);

  useEffect(() => {
    getPlan(id).then(() => {
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
      getAllPrescriptions()
        .then((data) => {
          setRowLength(data.count);
          setPrescriptions(data.rows);
        })
        .catch((err) => {
          console.log("err=>", err);
        });
    })
      .catch((err) => {
        console.log("err=>", err);
        navigate("/main-flow");
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllPrescriptions, filterModel, paginationModel]);

  const handleCreate = async (data) => {
    const createData = {
      ...data,
      userId: account.id,
      planId: id,
      user: account.role.name,
    };
    await createPrescription(createData).then((res) => {
      ToastService.success(getLocaleString(res.message));
    });
    await getAllPrescriptions().then((data) => {
      setRowLength(data.count);
      setPrescriptions(data.rows);
    });
    setOpenModal(false);
  };

  const handleUpdate = async (id, data) => {
    const updateData = {
      ...data,
      planId: id,
      user: account.role.name,
    };
    await updatePrescription(id, updateData).then((res) => {
      ToastService.success(getLocaleString(res.message));
    });
    await getAllPrescriptions().then((data) => {
      setRowLength(data.count);
      setPrescriptions(data.rows);
    });
    setOpenModal(false);
  };

  const handleEditPrescription = (row) => {
    const approvalStatus = JSON.parse(row?.approvalStatus || "{}");
    if (account.role.name === UserRoles.MASTER) {
      if (approvalStatus[UserRoles.SUBMASTER] === 1) {
        setOpenModal(true);
        setActivePrescription(prescriptions[row.no - 1]);
        handleClose();
      } else {
        ToastService.error(getLocaleString("sub_master_approve_error"));
      }
    } else {
      setOpenModal(true);
      setActivePrescription(prescriptions[row.no - 1]);
      handleClose();
    }
  };

  const handleOpenRemoveModal = (item) => {
    setRemoveItem(item);
    setOpenRemoveModal(true);
  };

  const handleOpenViewModal = (row) => {
    setOpenViewModal(true);
    setActivePrescription(prescriptions[row.no - 1]);
  };

  const handleCloseViewModal = () => {
    handleClose();
    setOpenViewModal(false);
  };

  const handleCloseRemoveModal = () => {
    handleClose();
    setOpenRemoveModal(false);
  };

  const handleRemovePrescription = async () => {
    await deletePrescription(removeItem.id)
      .then((res) => {
        ToastService.success(getLocaleString(res.message));
      });
      await getAllPrescriptions().then((data) => {
        setRowLength(data.count);
        setPrescriptions(data.rows);
      });
    handleClose();
    setOpenRemoveModal(false);
  };

  const handleGoBack = () => {
    navigate(`/main-flow/plan/${id}`);
  };

  const handleCompare = (row) => {
    navigate(`/main-flow/plan/${id}/prescriptions/${row.id}/compare`);
  };

  const getDisabledStatus = (row) => {
    if (row) {
      const approvalStatus = JSON.parse(row?.approvalStatus);
      if (
        approvalStatus[UserRoles.SUBMASTER] === undefined &&
        approvalStatus[UserRoles.MASTER] === undefined
      ) {
        return true;
      } else if (
        approvalStatus[UserRoles.SUBMASTER] === -1 &&
        approvalStatus[UserRoles.MASTER] === -1
      ) {
        return true;
      }
    } else {
      return true;
    }
  };

  const downloadPrescription = (row) => {
    const element = document.createElement("a");
    const file = new Blob([JSON.parse(row.content).updated.text], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = `${row.title}.txt`;
    document.body.appendChild(element);
    element.click();
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
      field: "title",
      headerName: getLocaleString("common_table_title"),
      editable: false,
      flex: 2,
      minWidth: 200,
    },
    {
      field: "owner",
      headerName: getLocaleString("common_table_owner"),
      editable: false,
      flex: 1,
      minWidth: 150,
    },
    {
      field: "plan",
      headerName: getLocaleString("common_table_plan"),
      editable: false,
      flex: 1,
      minWidth: 300,
    },
    {
      field: "approvalStatus",
      headerName: getLocaleString("common_table_status"),
      editable: false,
      filterable: false,
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        const approvalStatus = JSON.parse(row?.approvalStatus || "{}");
        const masterStatus = approvalStatus[UserRoles.MASTER];
        const subMasterStatus = approvalStatus[UserRoles.SUBMASTER];
        return (
          <Box>
            <Box display="flex" height={26} alignItems="center">
              <Box mr={1}>{getLocaleString("Master")}:</Box>
              {masterStatus === 1 ? (
                <CheckIcon sx={{ fontSize: 16 }} />
              ) : (
                <CloseIcon sx={{ fontSize: 16 }} />
              )}
            </Box>
            <Box display="flex" height={26} alignItems="center">
              <Box mr={1}>{getLocaleString("Sub Master")}:</Box>
              {subMasterStatus === 1 ? (
                <CheckIcon sx={{ fontSize: 16 }} />
              ) : (
                <CloseIcon sx={{ fontSize: 16 }} />
              )}
            </Box>
          </Box>
        );
      },
    },
    {
      field: "comment",
      headerName: getLocaleString("modal_comment_label"),
      editable: false,
      flex: 1,
      minWidth: 250,
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
      field: "download",
      headerName: getLocaleString("common_table_download"),
      editable: false,
      filterable: false,
      flex: 1,
      minWidth: 100,
      renderCell: ({ row }) => {
        const approvalStatus = JSON.parse(row?.approvalStatus || "{}");
        const masterStatus = approvalStatus[UserRoles.MASTER];
        const subMasterStatus = approvalStatus[UserRoles.SUBMASTER];
        return (
          <Box sx={{ paddingLeft: "1rem" }}>
            {masterStatus === 1 && subMasterStatus === 1 && (
              <DownloadIcon
                sx={{ cursor: "pointer" }}
                onClick={() => downloadPrescription(row)}
              />
            )}
          </Box>
        );
      },
    },
    {
      field: "action",
      headerName: getLocaleString("common_table_action"),
      filterable: false,
      editable: false,
      sortable: false,
      renderCell,
      width: 100,
    },
  ];

  const rows = prescriptions?.map((item, index) => ({
    ...item,
    no: paginationModel.page * paginationModel.pageSize + index + 1,
    owner: item?.user.name,
    plan: item?.plan.title,
    approvalStatus: item?.approvalStatus,
    comment: Object.values(JSON.parse(item?.comment || "{}")).toString(),
    createdAt: moment(item.createdAt).toDate(),
    updatedAt: moment(item.updatedAt).toDate(),
  }));

  return (
    <ContentWrapper>
      <ContentHeader>
        <Box>
          <Typography variant="h5">
            {getLocaleString("prescriptions_page_title")}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="between" gap="4px">
          <Button
            variant="outlined"
            startIcon={<ArrowBackIosIcon />}
            color="secondary"
            onClick={handleGoBack}
          >
            {getLocaleString("common_go_back")}
          </Button>
          {(account.role.name === UserRoles.EDITOR ||
            account.role.name === UserRoles.SUBMASTER) && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleOpenModal}
            >
              {getLocaleString("common_create")}
            </Button>
          )}
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
          {(account.role.name === UserRoles.MASTER ||
            account.role.name === UserRoles.SUBMASTER) && (
            <ActionMenuItem onClick={() => handleEditPrescription(activeRow)}>
              <ReviewsIcon className="menu-icon" />
              {getLocaleString("common_review")}
            </ActionMenuItem>
          )}
          <ActionMenuItem
            disabled={getDisabledStatus(activeRow)}
            onClick={() => handleCompare(activeRow)}
          >
            <DifferenceIcon sx={{ marginRight: "1rem", color: "grey" }} />
            {getLocaleString("common_compare")}
          </ActionMenuItem>
          {account.role.name === UserRoles.EDITOR && (
            <ActionMenuItem onClick={() => handleOpenViewModal(activeRow)}>
              <VisibilityIcon className="menu-icon" />
              {getLocaleString("common_view")}
            </ActionMenuItem>
          )}
          {account.role.name === UserRoles.EDITOR && (
            <ActionMenuItem onClick={() => handleOpenRemoveModal(activeRow)}>
              <DeleteIcon className="menu-icon" />
              {getLocaleString("common_delete")}
            </ActionMenuItem>
          )}
        </Menu>
      )}
      <CreatePrescriptionModal
        data={activePrescription}
        open={openModal}
        close={() => setOpenModal(false)}
        create={handleCreate}
        update={handleUpdate}
      />
      <ViewPrescriptionModal
        open={openViewModal}
        data={activePrescription}
        close={handleCloseViewModal}
      />
      <ConfirmModal
        content="toast_delete_prescription_confirm_message"
        open={openRemoveModal}
        close={handleCloseRemoveModal}
        handleClick={handleRemovePrescription}
      />
    </ContentWrapper>
  );
};

export default Prescription;
