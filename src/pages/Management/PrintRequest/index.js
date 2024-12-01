import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, Button, Pagination, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import moment from "moment";
import CustomDataGrid from "../../../components/common/DataGrid";
import CreatePrintRequestModal from "../../../components/Modal/CreatePrintRequestModal";
import {
  getPrintRequests,
  createPrintRequest,
  updatePrintRequest,
  uploadDocument,
  ToastService,
} from "../../../services";
import { PrintRequestStatus, URL_WEB_SOCKET } from "../../../constants";
import { ContentHeader, ContentWrapper } from "../../style";
import { sendNotification } from "../../../utils/helper";
import { useAuthState } from "../../../hooks/redux";

const PrintRequest = () => {
  let connection = new WebSocket(URL_WEB_SOCKET);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [requests, setRequests] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState();
  const { account } = useAuthState();
  const [filterModel, setFilterModel] = useState({ items: [] });
  const getLocaleString = (key) => t(key);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleChangedSearch = (filter) => {
    setFilterModel(filter);
  };

  const getAllRequests = useCallback(() => {
    let query = {};
    query.pageSize = pageSize;
    query.page = page;
    query.filters = filterModel.items.map((item) => ({
      field: item.field,
      operator: item.operator,
      value: item.value,
    }));
    query.filtersOperator = filterModel.logicOperator;
    return getPrintRequests(query);
  }, [pageSize, page, filterModel]);

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
    getAllRequests()
      .then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setRequests(data.rows);
      })
      .catch((err) => {
        console.log("err=>", err);
        ToastService.error(getLocaleString("toast_load_print_requests_failed"));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllRequests, filterModel]);

  const handleCreate = async (data, file) => {
    try {
      const res = await uploadDocument({
        ...data,
        file,
      });

      const fileType = file.name.split(".").pop();
      const updatedData = {
        ...data,
        fileType: fileType,
        documentId: res.documentId,
      };

      await createPrintRequest(updatedData).then((res) => {
        ToastService.success(getLocaleString(res.message));
      });
      await getAllRequests().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setRequests(data.rows);
      });
      handleCloseModal();
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
      await updatePrintRequest(id, data).then((res) => {
        ToastService.success(getLocaleString(res.message));
      });
      await getAllRequests().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setRequests(data.rows);
      });
    } catch (err) {
      console.log("err=>", err);
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }

    setOpenModal(false);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  const handlePrintUpdate = async (row) => {
    let updateData = {};
    if (row.status === PrintRequestStatus.PENDING) {
      updateData = {
        ...row,
        status: PrintRequestStatus.PROGRESS,
        start: new Date(),
      };
    } else if (row.status === PrintRequestStatus.PROGRESS) {
      updateData = {
        ...row,
        status: PrintRequestStatus.DONE,
        end: new Date(),
      };

      sendNotification(
        connection,
        account.id,
        "notification",
        {
          key: "toast_notification_print_request",
          data: {
            user: account.name,
            currentStage: row.stage,
            printVolume: row.printVolume
          },
        },
        "done",
      );
    }

    try {
      await updatePrintRequest(row.id, updateData).then((res) => {
        ToastService.success(getLocaleString(res.message));
      });
      await getAllRequests().then((res) => {
        setTotalPage(Math.ceil(res.count / pageSize));
        setRequests(res.rows);
      });
    } catch (err) {
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
  };

  const renderCell = ({ row }) => {
    if (
      row?.status === PrintRequestStatus.PROGRESS ||
      row?.status === PrintRequestStatus.PENDING
    ) {
      return (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handlePrintUpdate(row)}
        >
          {row?.status === PrintRequestStatus.PENDING
            ? getLocaleString("common_start")
            : getLocaleString("common_end")}
        </Button>
      );
    } else {
      return <React.Fragment key={row.no} />;
    }
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
      field: "title",
      headerName: getLocaleString("common_table_title"),
      editable: false,
      flex: 3,
    },
    {
      field: "pagesCount",
      headerName: getLocaleString("common_table_pages_count"),
      editable: false,
      flex: 1,
    },
    {
      field: "printVolume",
      headerName: getLocaleString("common_table_print_volume"),
      editable: false,
      flex: 1,
    },
    {
      field: "paperSize",
      headerName: getLocaleString("common_table_paper_size"),
      editable: false,
      flex: 1,
    },
    {
      field: "stage",
      headerName: getLocaleString("common_table_stage"),
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
      field: "subSection",
      headerName: getLocaleString("common_table_subsection"),
      editable: false,
      flex: 1,
    },
    {
      field: "fileType",
      headerName: getLocaleString("common_table_file_type"),
      editable: false,
      flex: 1,
    },
    {
      field: "status",
      headerName: getLocaleString("common_table_status"),
      editable: false,
      flex: 1,
    },
    {
      field: "start",
      headerName: getLocaleString("common_start"),
      editable: false,
      type: "date",
      flex: 1,
      renderCell: ({ row }) => {
        return (
          <React.Fragment key={row.no}>
            {row.start
              ? moment(row.start).utc(false).format("YYYY-MM-DD h:mm:ss")
              : ""}
          </React.Fragment>
        );
      },
    },
    {
      field: "end",
      headerName: getLocaleString("common_end"),
      editable: false,
      type: "date",
      flex: 1,
      renderCell: ({ row }) => {
        return (
          <React.Fragment key={row.no}>
            {row.end
              ? moment(row.end).utc(false).format("YYYY-MM-DD h:mm:ss")
              : ""}
          </React.Fragment>
        );
      },
    },
    {
      field: "createdAt",
      headerName: getLocaleString("common_table_created_at"),
      editable: false,
      type: "date",
      flex: 1,
      renderCell: ({ row }) =>
        moment(row.createdAt).utc(false).format("YYYY-MM-DD"),
    },
    {
      field: "documentId",
      headerName: getLocaleString("common_preview"),
      editable: false,
      filterable: false,
      flex: 1,
      renderCell: ({ row }) => {
        return (
          <React.Fragment key={row.no}>
            <Button variant="outlined">
              <Link to={`/preview/${row.documentId}`} target="_blank">
                {getLocaleString("common_preview")}
              </Link>
            </Button>
          </React.Fragment>
        );
      },
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

  const rows = requests.map((item, index) => ({
    ...item,
    no: (page - 1) * pageSize + index + 1,
    start: !item.start ? "" : moment(item.start).toDate(),
    end: !item.end ? "" : moment(item?.end).toDate(),
    printVolume: item.printVolume ?? 0,
    pagesCount: item.pagesCount ?? 0,
    paperSize: item.paperSize ?? "",
    documentId: item.documentId ?? "",
    createdAt: moment(item.createdAt).toDate(),
    updatedAt: moment(item.updatedAt).toDate(),
  }));

  const handleGoBack = () => {
    const pathArr = location.pathname.split("/");
    navigate(`${pathArr.slice(0, pathArr.length - 1).join("/")}`);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ContentWrapper>
        <ContentHeader>
          <Box>
            <Typography variant="h5">
              {getLocaleString("print_request_page_title")}
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
        <CreatePrintRequestModal
          open={openModal}
          close={handleCloseModal}
          create={handleCreate}
          update={handleUpdate}
        />
      </ContentWrapper>
    </LocalizationProvider>
  );
};

export default PrintRequest;
