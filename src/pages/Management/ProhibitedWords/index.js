import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, Button, Menu, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import moment from "moment";
import CustomDataGrid from "../../../components/common/DataGrid";
import CreateProhibitedWordModal from "../../../components/Modal/CreateProhibitedWordModal";
import {
  createProhibitedWord,
  updateProhibitedWord,
  getProhibitedWords,
  deleteProhibitedWord,
  ToastService,
} from "../../../services";
import {
  ActionMenuButtonWrapper,
  ActionMenuItem,
  ContentHeader,
  ContentWrapper,
  MenuItemButton,
  MoreActionsIcon,
} from "../../style";
import ConfirmModal from "../../../components/Modal/ConfirmModal";
import debounce from "lodash/debounce";

const ProhibitedWord = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [words, setWords] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeWord, setActiveWord] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const isOpen = Boolean(anchorEl);
  const [rowLength, setRowLength] = useState(0);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [removeItem, setRemoveItem] = useState(undefined);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);

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
    setActiveWord(null);
  };

  const handleChangedSearch = (filter) => {
    setFilterModel(filter);
  };

  const handleDebounceChangeSearch = debounce(handleChangedSearch, 500);

  const getAllProhibitedWords = useCallback(() => {
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
    return getProhibitedWords(query);
  }, [paginationModel, filterModel]);

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
    getAllProhibitedWords()
      .then((data) => {
        setRowLength(data.count);
        setWords(data.rows);
      })
      .catch((err) => {
        ToastService.showHttpError(
          err,
          getLocaleString("toast_load_prohibited_words_failed"),
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllProhibitedWords, filterModel, paginationModel]);

  const handleUpdate = async (id, data) => {
    await updateProhibitedWord(id, data).then((res) => {
      ToastService.success(getLocaleString(res.message));
    });
    await getAllProhibitedWords().then((data) => {
      setRowLength(data.count);
      setWords(data.rows);
    });
    setOpenModal(false);
  };

  const handleEditProhibitedWord = (row) => {
    setOpenModal(true);
    setActiveWord(words[row.no - 1]);
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

  const handleCreate = async (data) => {
    await createProhibitedWord(data).then((res) => {
      ToastService.success(getLocaleString(res.message));
    });
    await getAllProhibitedWords().then((data) => {
      setRowLength(data.count);
      setWords(data.rows);
    });
    setOpenModal(false);
  };

  const handleRemoveProhibitedWord = async () => {
    await deleteProhibitedWord(removeItem.id).then((res) => {
      ToastService.success(getLocaleString(res.message));
    });
    await getAllProhibitedWords().then((data) => {
      setRowLength(data.count);
      setWords(data.rows);
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

  const wordTableColumns = [
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
      minWidth: 150,
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

  const rows = words.map((item, index) => ({
    ...item,
    no: paginationModel.page * paginationModel.pageSize + index + 1,
    createdAt: moment(item.createdAt).toDate(),
    updatedAt: moment(item.updatedAt).toDate(),
  }));

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <ContentWrapper>
      <ContentHeader>
        <Box className="mr-2">
          <Typography variant="h5">
            {getLocaleString("prohibited_words_page_title")}
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
        columns={wordTableColumns}
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
          <ActionMenuItem onClick={() => handleEditProhibitedWord(activeRow)}>
            <EditIcon className="menu-icon" />
            {getLocaleString("common_edit")}
          </ActionMenuItem>
          <ActionMenuItem onClick={() => handleOpenRemoveModal(activeRow)}>
            <DeleteIcon className="menu-icon" />
            {getLocaleString("common_delete")}
          </ActionMenuItem>
        </Menu>
      )}
      <CreateProhibitedWordModal
        data={activeWord}
        open={openModal}
        close={() => setOpenModal(false)}
        create={handleCreate}
        update={handleUpdate}
      />
      <ConfirmModal
        content="toast_delete_prohibited_word_confirm_message"
        open={openRemoveModal}
        close={handleCloseRemoveModal}
        handleClick={handleRemoveProhibitedWord}
      />
    </ContentWrapper>
  );
};

export default ProhibitedWord;
