import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, Button, Menu, Typography } from "@mui/material";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import moment from "moment";
import CustomDataGrid from "../../../components/common/DataGrid";
import CreateDocumentModal from "../../../components/Modal/CreateDocumentModal";
import ConfirmModal from "../../../components/Modal/ConfirmModal";
import {
  createDocument,
  deleteDocument,
  getDocuments,
  ToastService,
  updateDocument,
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

const Document = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [liveDocuments, setLiveDocuments] = useState({ rows: [], count: 0 });
  const [openModal, setOpenModal] = useState(false);
  const [activeDocument, setActiveDocument] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [rowLength, setRowLength] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [removeItem, setRemoveItem] = useState(undefined);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
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
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setActiveDocument(null);
  };
  const handleChangedSearch = (filter) => {
    setFilterModel(filter);
  };

  const handleDebounceChangeSearch = debounce(handleChangedSearch, 500);

  const getAllLiveDocuments = useCallback(() => {
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
    return getDocuments(query);
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
    getAllLiveDocuments()
      .then((data) => {
        setRowLength(data.count);
        setLiveDocuments(data);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllLiveDocuments, filterModel, paginationModel]);

  const handleEditDocument = async (item) => {
    setOpenModal(true);
    setActiveDocument(liveDocuments.rows[item.no - 1]);
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

  const handleRemoveDocument = async () => {
    await deleteDocument(removeItem.documentId).then((res) => {
      ToastService.success(getLocaleString(res.message));
    });
    await getAllLiveDocuments().then((data) => {
      setRowLength(data.count);
      setLiveDocuments(data);
    });
    handleClose();
    setOpenRemoveModal(false);
  };

  const joinLiveCollaboration = (document) => {
    navigate(`/result/${document.documentId}`);
    handleClose();
  };

  const handleCreateDocument = async (data, file) => {
    await createDocument({
      ...data,
      file,
    }).then(() => {
      ToastService.success(
        getLocaleString("toast_create_live_document_success"),
      );
    });
    await getAllLiveDocuments().then((data) => {
      setRowLength(data.count);
      setLiveDocuments(data);
    });
    handleCloseModal();
  };

  const handleUpdateDocument = async (id, data) => {
    await updateDocument(id, data).then(() => {
      ToastService.success(
        getLocaleString("toast_update_live_document_success"),
      );
    });
    await getAllLiveDocuments().then((data) => {
      setRowLength(data.count);
      setLiveDocuments(data);
    });
    handleCloseModal();
  };

  const handleStatus = (value) => {
    const status = JSON.parse(value);
    let result = "";
    Object.keys(status).forEach((key) => {
      if (status[key] === -1) {
        result += `${key} rejected.\n`;
      } else {
        result += `${key} approved.\n`;
      }
    });
    return result;
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

  const documentTableColumns = [
    {
      field: "no",
      headerName: getLocaleString("common_table_number"),
      editable: false,
      filterable: false,
      width: 100,
    },
    {
      field: "fileName",
      headerName: getLocaleString("common_table_file_name"),
      editable: false,
      flex: 3,
      minWidth: 250,
    },
    {
      field: "stage",
      headerName: getLocaleString("common_table_stage"),
      editable: false,
      flex: 1,
      minWidth: 100,
    },
    {
      field: "owner",
      headerName: getLocaleString("common_table_owner"),
      editable: false,
      flex: 2,
      minWidth: 200,
    },
    {
      field: "plan",
      headerName: getLocaleString("common_table_plan"),
      editable: false,
      flex: 2,
      minWidth: 200,
    },
    {
      field: "approvalStatus",
      headerName: getLocaleString("common_table_status"),
      editable: false,
      filterable: false,
      flex: 1,
      minWidth: 100,
    },
    {
      field: "pagesCount",
      headerName: getLocaleString("common_table_pages_count"),
      editable: false,
      filterable: false,
      flex: 1,
      minWidth: 100,
    },
    {
      field: "paperSize",
      headerName: getLocaleString("common_table_paper_size"),
      editable: false,
      flex: 1,
      minWidth: 100,
    },
    {
      field: "createdAt",
      headerName: getLocaleString("common_table_created_at"),
      editable: false,
      type: "date",
      flex: 1.5,
      minWidth: 150,
      renderCell: ({ row }) =>
        moment(row.createdAt).utc(false).format("YYYY-MM-DD"),
    },
    {
      field: "updatedAt",
      headerName: getLocaleString("common_table_updated_at"),
      editable: false,
      type: "date",
      flex: 1.5,
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

  const rows = liveDocuments.rows.map((row, index) => ({
    ...row,
    no: paginationModel.page * paginationModel.pageSize + index + 1,
    id: row.documentId,
    plan: row.plan?.title,
    approvalStatus: handleStatus(row?.approvalStatus),
    pagesCount: row.pagesCount,
    createdAt: moment(row?.createdAt).toDate(),
    updatedAt: moment(row?.updatedAt).toDate(),
  }));

  const handleGoBack = () => {
    const pathArr = location.pathname.split("/");
    navigate(`${pathArr.slice(0, pathArr.length - 1).join("/")}`);
  };

  return (
    <ContentWrapper>
      <ContentHeader>
        <Box className="mr-2">
          <Typography variant="h5">
            {getLocaleString("document_page_title")}
          </Typography>
          <Typography variant="body1">
            {getLocaleString("document_page_description")}
          </Typography>
        </Box>
        <Box className="sm:flex justify-between gap-2">
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
        columns={documentTableColumns}
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
          <ActionMenuItem onClick={() => joinLiveCollaboration(activeRow)}>
            <ContentPasteIcon className="menu-icon" />
            {getLocaleString("common_join")}
          </ActionMenuItem>
          <ActionMenuItem onClick={() => handleEditDocument(activeRow)}>
            <EditIcon className="menu-icon" />
            {getLocaleString("common_edit")}
          </ActionMenuItem>
          <ActionMenuItem onClick={() => handleOpenRemoveModal(activeRow)}>
            <DeleteIcon className="menu-icon" />
            {getLocaleString("common_delete")}
          </ActionMenuItem>
        </Menu>
      )}
      {openModal && (
        <CreateDocumentModal
          open={openModal}
          close={handleCloseModal}
          create={handleCreateDocument}
          update={handleUpdateDocument}
          data={activeDocument}
        />
      )}
      <ConfirmModal
        content="toast_delete_document_confirm_message"
        open={openRemoveModal}
        close={handleCloseRemoveModal}
        handleClick={handleRemoveDocument}
      />
    </ContentWrapper>
  );
};

export default Document;
