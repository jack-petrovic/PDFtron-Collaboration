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
import { Box, Button, Menu, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import CustomDataGrid from "../../../components/common/DataGrid";
import ConfirmModal from "../../../components/Modal/ConfirmModal";
import { UserRoles } from "../../../constants";
import { ToastService } from "../../../services";
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
import {
  createPaperSize,
  deletePaperSize,
  getPaperSizes,
  updatePaperSize,
} from "../../../services/management/paperSize.service";
import CreatePaperSizeModal from "../../../components/Modal/CreatePaperSizeModal";
import debounce from "lodash/debounce";

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
    setActivePaperSize(null);
  };

  const getAllPaperSizes = useCallback(() => {
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
    return getPaperSizes(query);
  }, [paginationModel, filterModel]);

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
    getAllPaperSizes()
      .then((data) => {
        setRowLength(data.count);
        setPaperSizes(data.rows);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllPaperSizes, filterModel, paginationModel]);

  const handleCreate = async (data) => {
    await createPaperSize(data).then((res) => {
      ToastService.success(
        getLocaleString("toast_create_paper_size_success"),
      );
      dispatch(addPaperSize(res));
    });
    await getAllPaperSizes().then((data) => {
      setRowLength(data.count);
      setPaperSizes(data.rows);
    });
    setOpenModal(false);
  };

  const handleUpdate = async (id, data) => {
    await updatePaperSize(id, data).then((res) => {
      dispatch(editPaperSize(res));
      ToastService.success(
        getLocaleString("toast_update_paper_size_success"),
      );
    });
    await getAllPaperSizes().then((data) => {
      setRowLength(data.count);
      setPaperSizes(data.rows);
    });
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
    await deletePaperSize(removeItem.id).then((res) => {
      dispatch(removePaperSize(removeItem.id));
      ToastService.success(getLocaleString(res.message));
    });
    await getAllPaperSizes().then((data) => {
      setRowLength(data.count);
      setPaperSizes(data.rows);
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

  const typeTableColumns = [
    {
      field: "no",
      headerName: getLocaleString("common_table_number"),
      editable: false,
      filterable: false,
      flex: 0.5,
      minWidth: 100,
    },
    {
      field: "name",
      headerName: getLocaleString("common_table_name"),
      editable: false,
      flex: 1,
      minWidth: 200,
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
      field: "height",
      headerName: getLocaleString("common_table_height"),
      editable: false,
      flex: 1,
      minWidth: 100,
    },
    {
      field: "width",
      headerName: getLocaleString("common_table_width"),
      editable: false,
      flex: 1,
      minWidth: 100,
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

  const rows = paperSizes.map((item, index) => ({
    ...item,
    no: paginationModel.page * paginationModel.pageSize + index + 1,
    width: item.width,
    height: item.height,
  }));

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <ContentWrapper>
      <ContentHeader>
        <Box className="mr-2">
          <Typography variant="h5">
            {getLocaleString("paper_size_page_title")}
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
          <ActionMenuItem onClick={() => handleEditPaperSize(activeRow)}>
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
      <CreatePaperSizeModal
        data={activePaperSize}
        open={openModal}
        close={() => setOpenModal(false)}
        create={handleCreate}
        update={handleUpdate}
      />
      <ConfirmModal
        content="toast_delete_paper_size_confirm_message"
        open={openRemoveModal}
        close={handleCloseRemoveModal}
        handleClick={handleRemoveType}
      />
    </ContentWrapper>
  );
};
export default PaperSize;
