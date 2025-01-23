import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, Button, Typography } from "@mui/material";
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
  updateDocument,
  ToastService,
} from "../../../services";
import { PrintRequestStatus, URL_WEB_SOCKET } from "../../../constants";
import { ContentHeader, ContentWrapper, MenuItemButton } from "../../style";
import { sendNotification } from "../../../utils/helper";
import { useAuthState } from "../../../hooks/redux";
import debounce from "lodash/debounce";

const PrintRequest = () => {
  let connection = new WebSocket(URL_WEB_SOCKET);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [rowLength, setRowLength] = useState(0);
  const [requests, setRequests] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const { account } = useAuthState();
  const [filterModel, setFilterModel] = useState({ items: [] });

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const getLocaleString = (key) => t(key);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleChangedSearch = (filter) => {
    setFilterModel(filter);
  };

  const handleDebounceChangeSearch = debounce(handleChangedSearch, 500);

  const getAllRequests = useCallback(() => {
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
    return getPrintRequests(query);
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
    getAllRequests()
      .then((data) => {
        setRowLength(data.count);
        setRequests(data.rows);
      })
      .catch((err) => {
        console.log("err=>", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllRequests, filterModel, paginationModel]);

  const handleCreate = async (data, file) => {
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
      setRowLength(data.count);
      setRequests(data.rows);
    });
    handleCloseModal();
    setOpenModal(false);
  };

  const handleUpdate = async (id, data) => {
    await updatePrintRequest(id, data).then((res) => {
      ToastService.success(getLocaleString(res.message));
    });
    await getAllRequests().then((data) => {
      setRowLength(data.count);
      setRequests(data.rows);
    });
    setOpenModal(false);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
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
      if (row.stage === 1) {
        await updateDocument(row.documentId, {
          completed: true,
        });
      }
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
            printVolume: row.printVolume,
          },
        },
        "done",
      );
    }

    await updatePrintRequest(row.id, updateData).then((res) => {
      ToastService.success(getLocaleString(res.message));
    });
    await getAllRequests().then((res) => {
      setRowLength(res.count);
      setRequests(res.rows);
    });
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
      flex: 1,
      minWidth: 100,
    },
    {
      field: "title",
      headerName: getLocaleString("common_table_title"),
      editable: false,
      flex: 3,
      minWidth: 200,
    },
    {
      field: "pagesCount",
      headerName: getLocaleString("common_table_pages_count"),
      editable: false,
      flex: 1.5,
      minWidth: 100,
    },
    {
      field: "printVolume",
      headerName: getLocaleString("common_table_print_volume"),
      editable: false,
      flex: 1.5,
      minWidth: 100,
    },
    {
      field: "paperSize",
      headerName: getLocaleString("common_table_paper_size"),
      editable: false,
      flex: 1.5,
      minWidth: 100,
    },
    {
      field: "stage",
      headerName: getLocaleString("common_table_stage"),
      editable: false,
      flex: 1.5,
      minWidth: 100,
    },
    {
      field: "section",
      headerName: getLocaleString("common_table_section"),
      editable: false,
      flex: 2,
      minWidth: 150,
    },
    {
      field: "subSection",
      headerName: getLocaleString("common_table_subsection"),
      editable: false,
      flex: 2,
      minWidth: 150,
    },
    {
      field: "fileType",
      headerName: getLocaleString("common_table_file_type"),
      editable: false,
      flex: 1.5,
      minWidth: 100,
    },
    {
      field: "status",
      headerName: getLocaleString("common_table_status"),
      editable: false,
      flex: 2,
      minWidth: 150,
    },
    {
      field: "start",
      headerName: getLocaleString("common_start"),
      editable: false,
      type: "date",
      flex: 2,
      minWidth: 100,
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
      flex: 2,
      minWidth: 100,
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
      flex: 2,
      minWidth: 100,
      renderCell: ({ row }) =>
        moment(row.createdAt).utc(false).format("YYYY-MM-DD"),
    },
    {
      field: "documentId",
      headerName: getLocaleString("common_preview"),
      editable: false,
      filterable: false,
      flex: 2,
      minWidth: 150,
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
      headerName: getLocaleString("common_table_action"),
      editable: false,
      filterable: false,
      sortable: false,
      width: 100,
      renderCell,
    },
  ];

  const rows = requests.map((item, index) => ({
    ...item,
    no: paginationModel.page * paginationModel.pageSize + index + 1,
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
          <Box className="mr-2">
            <Typography variant="h5">
              {getLocaleString("print_request_page_title")}
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
