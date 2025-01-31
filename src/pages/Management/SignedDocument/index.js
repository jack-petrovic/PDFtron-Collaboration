import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button, Box, Typography, Menu, Pagination } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import moment from "moment";
import CustomDataGrid from "../../../components/common/DataGrid";
import CreateSignedDocumentModal from "../../../components/Modal/CreateSignedDocumentModal";
import {
  createSignedDocument,
  deleteSignedDocument,
  getSignedDocuments,
  updateSignedDocument,
  ToastService,
} from "../../../services";
import {
  ActionMenuButtonWrapper,
  ActionMenuItem,
  ContentHeader,
  ContentWrapper,
} from "../../style";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ConfirmModal from "../../../components/Modal/ConfirmModal";
import { useNavigate } from "react-router-dom";

function SignedDocument() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [signedDocuments, setSignedDocuments] = useState({
    rows: [],
    count: 0,
  });
  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [activeSignedDocument, setActiveSignedDocument] = useState(null);
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
    setAnchorEl(event.currentTarget);
    setActiveRow(row);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
    setActiveSignedDocument(null);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleChangedSearch = (filter) => {
    setFilterModel(filter);
  };

  const getAllSignedDocuments = useCallback(() => {
    let query = {};
    query.pageSize = pageSize;
    query.page = page;
    query.filters = filterModel.items.map((item) => ({
      field: item.field,
      operator: item.operator,
      value: item.value,
    }));
    query.filtersOperator = filterModel.logicOperator;
    return getSignedDocuments(query);
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
    getAllSignedDocuments()
      .then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setSignedDocuments(data);
      })
      .catch((err) => {
        ToastService.showHttpError(
          err,
          getLocaleString("toast_load_signed_documents_failed"),
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllSignedDocuments, filterModel]);

  const handleEditSignedDocument = (signedDocument) => {
    setOpenModal(true);
    setActiveSignedDocument(signedDocument);
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

  const handleRemoveSignedDocument = async () => {
    try {
      await deleteSignedDocument(removeItem.documentId).then((res) => {
        ToastService.success(getLocaleString(res.message));
      });
      await getAllSignedDocuments().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setSignedDocuments(data);
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

  const handleCreateSignedDocument = async (data) => {
    try {
      await createSignedDocument({
        ...data,
      }).then((res) => {
        ToastService.success(getLocaleString(res.message));
      });

      await getAllSignedDocuments().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setSignedDocuments(data);
      });
      handleCloseModal();
    } catch (err) {
      console.log("err=>", err);
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
  };

  const handleUpdateSignedDocument = async (data, form) => {
    const documentId = data.documentId;

    try {
      await updateSignedDocument(documentId, {
        ...data,
        ...form,
      }).then((res) => {
        ToastService.success(getLocaleString(res.message));
      });

      await getAllSignedDocuments().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setSignedDocuments(data);
      });
      handleCloseModal();
    } catch (err) {
      console.log("err=>", err);
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
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

  const signedDocumentTableColumns = [
    {
      field: "no",
      headerName: getLocaleString("common_table_number"),
      editable: false,
      filterable: false,
      flex: 1,
    },
    {
      field: "username",
      headerName: getLocaleString("common_table_user_name"),
      editable: false,
      flex: 2,
    },
    {
      field: "fileName",
      headerName: getLocaleString("common_table_file_name"),
      editable: false,
      flex: 2,
    },
    {
      field: "fileContent",
      headerName: getLocaleString("common_table_file_content"),
      editable: false,
      flex: 2,
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

  const rows = signedDocuments.rows.map((row, index) => ({
    ...row,
    no: (page - 1) * pageSize + index + 1,
    id: row.documentId,
    createdAt: moment(row.createdAt).toDate(),
    updatedAt: moment(row.updatedAt).toDate(),
  }));

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <ContentWrapper>
      <ContentHeader>
        <Box>
          <Typography variant="h5">
            {getLocaleString("signed_document_page_title")}
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
        columns={signedDocumentTableColumns}
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
          <ActionMenuItem onClick={() => handleEditSignedDocument(activeRow)}>
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
        <CreateSignedDocumentModal
          open={openModal}
          close={handleCloseModal}
          create={handleCreateSignedDocument}
          update={handleUpdateSignedDocument}
          data={activeSignedDocument}
        />
      )}
      <ConfirmModal
        content="toast_delete_signed_document_confirm_message"
        open={openRemoveModal}
        close={handleCloseRemoveModal}
        handleClick={handleRemoveSignedDocument}
      />
    </ContentWrapper>
  );
}

export default SignedDocument;
