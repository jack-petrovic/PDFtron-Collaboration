import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import moment from "moment";
import { clearLogs, getLogs } from "../../../services";
import { ToastService } from "../../../services";
import CustomDataGrid from "../../../components/common/DataGrid";
import { ContentHeader, ContentWrapper, MenuItemButton } from "../../style";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ConfirmModal from "../../../components/Modal/ConfirmModal";
import debounce from "lodash/debounce";

const GenerationLog = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rowLength, setRowLength] = useState(0);
  const [logs, setLogs] = useState([]);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [openClearModal, setOpenClearModal] = useState(false);

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const getLocaleString = (key) => t(key);

  const getAllLogs = useCallback(() => {
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
    return getLogs(query);
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
    getAllLogs()
      .then((data) => {
        setRowLength(data.count);
        setLogs(data.rows);
      })
      .catch((err) => {
        console.log("err=>", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllLogs, filterModel, paginationModel]);

  const handleChangedSearch = (filter) => {
    setFilterModel(filter);
  };

  const handleDebounceChangeSearch = debounce(handleChangedSearch, 500);

  const onClickClear = () => {
    setOpenClearModal(true);
  };

  const closeClearModal = () => {
    setOpenClearModal(false);
  };

  const handleClear = async () => {
    await clearLogs().then((res) => {
      ToastService.success(getLocaleString(res.message));
    });
    await getAllLogs().then((data) => {
      setRowLength(data.count);
      setLogs(data.rows);
    });
    setOpenClearModal(false);
  };

  const logTableColumns = [
    {
      field: "no",
      headerName: getLocaleString("common_table_number"),
      editable: false,
      filterable: false,
      minWidth: 100,
      flex: 1,
    },
    {
      field: "month",
      headerName: getLocaleString("common_table_month"),
      editable: false,
      type: "date",
      flex: 1,
      minWidth: 100,
      renderCell: ({ row }) => (
        <React.Fragment key={row.no}>
          {moment(row.month).utc(false).format("YYYY-MM")}
        </React.Fragment>
      ),
    },
    {
      field: "performed",
      headerName: getLocaleString("common_table_performed"),
      editable: false,
      flex: 1,
      minWidth: 150,
    },
    {
      field: "error",
      headerName: getLocaleString("common_table_error"),
      editable: false,
      flex: 2,
      minWidth: 150,
    },
    {
      field: "date",
      headerName: getLocaleString("common_table_date"),
      editable: false,
      type: "date",
      flex: 1,
      minWidth: 100,
      renderCell: ({ row }) => moment(row.date).utc(false).format("YYYY-MM-DD"),
    },
  ];

  const rows = logs.map((row, index) => ({
    ...row,
    no: paginationModel.page * paginationModel.pageSize + index + 1,
    month: moment(row?.month).toDate(),
    performed: row.performed ? "Yes" : "No",
    date: moment(row?.createdAt).toDate(),
  }));

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <ContentWrapper>
      <ContentHeader>
        <Box className="mr-2">
          <Typography variant="h5">
            {getLocaleString("sidebar_generation_logs")}
          </Typography>
        </Box>
        <Box className="sm:flex justify-between gap-1">
          <MenuItemButton
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={onClickClear}
            disabled={!rows.length}
            className="w-full sm:w-auto"
          >
            {getLocaleString("generation_logs_clear_log")}
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
        columns={logTableColumns}
        filterMode="server"
        rowLength={rowLength}
        onPaginationModelChange={setPaginationModel}
        paginationModel={paginationModel}
        filterModel={filterModel}
        onFilterChanged={handleDebounceChangeSearch}
      />
      <ConfirmModal
        content="toast_delete_logs_confirm_message"
        open={openClearModal}
        close={closeClearModal}
        handleClick={handleClear}
      />
    </ContentWrapper>
  );
};

export default GenerationLog;
