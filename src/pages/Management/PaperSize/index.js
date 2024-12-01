import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
  addPaperSize,
  editPaperSize,
  removePaperSize,
} from "../../../redux/actions";
import { useAuthState } from "../../../hooks/redux";
import { Box, Button, Chip, Menu, Pagination, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CustomDataGrid from "../../../components/common/DataGrid";
import ConfirmModal from "../../../components/Modal/ConfirmModal";
import { UserRoles } from "../../../constants";
import { ToastService } from "../../../services";
import {
  ActionMenuButtonWrapper,
  ActionMenuItem,
  ContentHeader,
  ContentWrapper,
} from "../../style";
import {
  createPaperSize,
  deletePaperSize,
  getPaperSizes,
  updatePaperSize,
} from "../../../services/management/paperSize.service";
import CreatePaperSizeModal from "../../../components/Modal/CreatePaperSizeModal";

const PaperSize = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [paperSizes, setPaperSizes] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activePaperSize, setActivePaperSize] = useState(null);
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
    setActivePaperSize(null);
  };

  const getAllPaperSizes = useCallback(() => {
    let query = {};
    query.pageSize = pageSize;
    query.page = page;
    query.filters = filterModel.items.map((item) => ({
      field: item.field,
      operator: item.operator,
      value: item.value,
    }));
    query.filtersOperator = filterModel.logicOperator;
    return getPaperSizes(query);
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
    getAllPaperSizes()
      .then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setPaperSizes(data.rows);
      })
      .catch((err) => {
        console.log("err=>", err);
        ToastService.error(getLocaleString("toast_load_paper_sizes_failed"));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllPaperSizes, filterModel]);

  const handleCreate = async (data) => {
    try {
      await createPaperSize(data).then((res) => {
        ToastService.success(
          getLocaleString("toast_create_paper_size_success"),
        );
        dispatch(addPaperSize(res));
      });
      await getAllPaperSizes().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setPaperSizes(data.rows);
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
      await updatePaperSize(id, data).then((res) => {
        dispatch(editPaperSize(res));
        ToastService.success(
          getLocaleString("toast_update_paper_size_success"),
        );
      });
      await getAllPaperSizes().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setPaperSizes(data.rows);
      });
    } catch (err) {
      console.log("err=>", err);
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
    setOpenModal(false);
  };

  const handleEditPaperSize = (row) => {
    setOpenModal(true);
    setActivePaperSize(paperSizes.find((paperSize) => paperSize.id === row.id));
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
      await deletePaperSize(removeItem.id).then((res) => {
        dispatch(removePaperSize(removeItem.id));
        ToastService.success(getLocaleString(res.message));
      });
      await getAllPaperSizes().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setPaperSizes(data.rows);
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
      field: "height",
      headerName: getLocaleString("common_table_height"),
      editable: false,
      flex: 1,
    },
    {
      field: "width",
      headerName: getLocaleString("common_table_width"),
      editable: false,
      flex: 1,
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

  const rows = paperSizes.map((item, index) => ({
    ...item,
    no: (page - 1) * pageSize + index + 1,
    width: item.width,
    height: item.height,
  }));

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <ContentWrapper>
      <ContentHeader>
        <Box>
          <Typography variant="h5">
            {getLocaleString("paper_size_page_title")}
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
          <ActionMenuItem onClick={() => handleEditPaperSize(activeRow)}>
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
      <CreatePaperSizeModal
        data={activePaperSize}
        open={openModal}
        close={() => setOpenModal(false)}
        create={handleCreate}
        update={handleUpdate}
      />
      <ConfirmModal
        content={getLocaleString("toast_delete_plan_type_confirm_message")}
        open={openRemoveModal}
        close={handleCloseRemoveModal}
        handleClick={handleRemoveType}
      />
    </ContentWrapper>
  );
};
export default PaperSize;
