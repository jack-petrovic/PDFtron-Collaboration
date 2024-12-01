import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, Button, Menu, Pagination, Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
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
} from "../../../services";
import {
  ActionMenuButtonWrapper,
  ActionMenuItem,
  ContentHeader,
  ContentWrapper,
} from "../../style";

const Document = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [liveDocuments, setLiveDocuments] = useState({ rows: [], count: 0 });
  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [activeDocument, setActiveDocument] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const pageSize = 10;
  const [totalPage, setTotalPage] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [removeItem, setRemoveItem] = useState(undefined);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
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
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setActiveDocument(null);
  };
  const handleChangedSearch = (filter) => {
    setFilterModel(filter);
  };

  const getAllLiveDocuments = useCallback(() => {
    let query = {};
    query.pageSize = pageSize;
    query.page = page;
    query.filters = filterModel.items.map((item) => ({
      field: item.field,
      operator: item.operator,
      value: item.value,
    }));
    query.filtersOperator = filterModel.logicOperator;
    return getDocuments(query);
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
    getAllLiveDocuments()
      .then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setLiveDocuments(data);
      })
      .catch((err) => {
        ToastService.showHttpError(
          err,
          getLocaleString("toast_load_documents_failed"),
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllLiveDocuments, filterModel]);

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
    try {
      await deleteDocument(removeItem.documentId).then((res) => {
        ToastService.success(getLocaleString(res.message));
      });
      await getAllLiveDocuments().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setLiveDocuments(data);
      });
    } catch (err) {
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }

    handleClose();
    setOpenRemoveModal(false);
  };

  const joinLiveCollaboration = (document) => {
    navigate(`/result/${document.documentId}`);
    handleClose();
  };

  const handleCreateDocument = async (data, file) => {
    try {
      await createDocument({
        ...data,
        file,
      }).then((res) => {
        ToastService.success(
          getLocaleString("toast_create_live_document_success"),
        );
      });
      await getAllLiveDocuments().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setLiveDocuments(data);
      });
      handleCloseModal();
    } catch (err) {
      console.log("err=>", err);
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
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
          <MoreVertIcon sx={{ color: "gray" }} />
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
      flex: 1,
    },
    {
      field: "fileName",
      headerName: getLocaleString("common_table_file_name"),
      editable: false,
      flex: 2,
    },
    {
      field: "stage",
      headerName: getLocaleString("common_table_stage"),
      editable: false,
      flex: 1,
    },
    {
      field: "owner",
      headerName: getLocaleString("common_table_owner"),
      editable: false,
      flex: 2,
    },
    {
      field: "plan",
      headerName: getLocaleString("common_table_plan"),
      editable: false,
      flex: 2,
    },
    {
      field: "approvalStatus",
      headerName: getLocaleString("common_table_status"),
      editable: false,
      type: "boolean",
      filterable: false,
      flex: 2,
    },
    {
      field: "pagesCount",
      headerName: getLocaleString("common_table_pages_count"),
      editable: false,
      filterable: false,
      flex: 1,
    },
    {
      field: "paperSize",
      headerName: getLocaleString("common_table_paper_size"),
      editable: false,
      flex: 1,
    },
    {
      field: "createdAt",
      headerName: getLocaleString("common_table_created_at"),
      editable: false,
      type: "date",
      flex: 2,
      renderCell: ({ row }) =>
        moment(row.createdAt).utc(false).format("YYYY-MM-DD"),
    },
    {
      field: "updatedAt",
      headerName: getLocaleString("common_table_updated_at"),
      editable: false,
      type: "date",
      flex: 2,
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

  const rows = liveDocuments.rows.map((row, index) => ({
    ...row,
    no: (page - 1) * pageSize + index + 1,
    id: row.documentId,
    plan: row.plan?.title,
    approvalStatus: handleStatus(row?.approvalStatus),
    pagesCount: row.pagesCount,
    createdAt: moment(row?.createdAt).toDate(),
    updatedAt: moment(row?.updatedAt).toDate(),
  }));

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  const handleGoBack = () => {
    const pathArr = location.pathname.split("/");
    navigate(`${pathArr.slice(0, pathArr.length - 1).join("/")}`);
  };

  return (
    <ContentWrapper>
      <ContentHeader>
        <Box>
          <Typography variant="h5">
            {getLocaleString("document_page_title")}
          </Typography>
          <Typography variant="body1">
            {getLocaleString("document_page_description")}
          </Typography>
        </Box>
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
        columns={documentTableColumns}
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
          <ActionMenuItem onClick={() => joinLiveCollaboration(activeRow)}>
            <ContentPasteIcon sx={{ marginRight: "1rem", color: "gray" }} />
            {getLocaleString("common_join")}
          </ActionMenuItem>
          <ActionMenuItem onClick={() => handleEditDocument(activeRow)}>
            <EditIcon sx={{ marginRight: "1rem", color: "gray" }} />
            {getLocaleString("common_edit")}
          </ActionMenuItem>
          <ActionMenuItem onClick={() => handleOpenRemoveModal(activeRow)}>
            <DeleteIcon sx={{ marginRight: "1rem", color: "gray" }} />
            {getLocaleString("common_delete")}
          </ActionMenuItem>
        </Menu>
      )}
      {openModal && (
        <CreateDocumentModal
          open={openModal}
          close={handleCloseModal}
          create={handleCreateDocument}
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
