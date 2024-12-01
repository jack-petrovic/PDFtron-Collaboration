import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, Button, Pagination, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import moment from "moment";
import { clearLogs, getLogs } from "../../../services";
import { ToastService } from "../../../services";
import CustomDataGrid from "../../../components/common/DataGrid";
import { ContentHeader, ContentWrapper } from "../../style";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ConfirmModal from "../../../components/Modal/ConfirmModal";

const GenerationLog = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState();
  const [filterModel, setFilterModel] = useState({ items: [] });
  const getLocaleString = (key) => t(key);

  const getAllLogs = useCallback(() => {
    let query = {};
    query.pageSize = pageSize;
    query.page = page;
    query.filters = filterModel.items.map((item) => ({
      field: item.field,
      operator: item.operator,
      value: item.value,
    }));
    query.filtersOperator = filterModel.logicOperator;
    return getLogs(query);
  }, [pageSize, page, filterModel]);
  const [openClearModal, setOpenClearModal] = useState(false);

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
        setTotalPage(Math.ceil(data.count / pageSize));
        setLogs(data.rows);
      })
      .catch((err) => {
        console.log("err=>", err);
        ToastService.error(
          getLocaleString("toast_load_generation_logs_failed"),
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllLogs, filterModel]);

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  const handleChangeSearch = (filter) => {
    setFilterModel(filter);
  };

  const onClickClear = () => {
    setOpenClearModal(true);
  };

  const closeClearModal = () => {
    setOpenClearModal(false);
  };

  const handleClear = async () => {
    try {
      await clearLogs().then((res) => {
        ToastService.success(getLocaleString(res.message));
      });
      await getAllLogs().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setLogs(data.rows);
      });
    } catch (err) {
      console.log("err=>", err);
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
    setOpenClearModal(false);
  };

  const logTableColumns = [
    {
      field: "no",
      headerName: getLocaleString("common_table_number"),
      editable: false,
      filterable: false,
      flex: 1,
    },
    {
      field: "month",
      headerName: getLocaleString("common_table_month"),
      editable: false,
      type: "date",
      flex: 1,
      renderCell: ({ row }) => (
        <React.Fragment key={row.no}>
          {moment(row.month).utc(false).format("YYYY-MM-DD")}
        </React.Fragment>
      ),
    },
    {
      field: "performed",
      headerName: getLocaleString("common_table_performed"),
      editable: false,
      flex: 1,
    },
    {
      field: "error",
      headerName: getLocaleString("common_table_error"),
      editable: false,
      flex: 2,
    },
    {
      field: "date",
      headerName: getLocaleString("common_table_date"),
      editable: false,
      type: "date",
      flex: 2,
      renderCell: ({ row }) => moment(row.date).utc(false).format("YYYY-MM-DD"),
    },
  ];

  const rows = logs.map((row, index) => ({
    ...row,
    no: (page - 1) * pageSize + index + 1,
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
        <Typography variant="h5">
          {getLocaleString("common_generation_logs")}
        </Typography>
        <Box display="flex" justifyContent="between" gap="4px">
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={onClickClear}
          >
            {getLocaleString("generation_logs_clear_log")}
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
        columns={logTableColumns}
        filterMode="server"
        filterModel={filterModel}
        onFilterChanged={(filter) => handleChangeSearch(filter)}
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
      <ConfirmModal
        content={getLocaleString("toast_delete_logs_confirm_message")}
        open={openClearModal}
        close={closeClearModal}
        handleClick={handleClear}
      />
    </ContentWrapper>
  );
};

export default GenerationLog;
