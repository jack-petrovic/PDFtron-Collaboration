import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, Button, Menu, Typography } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import moment from "moment";
import CustomDataGrid from "../../components/common/DataGrid";
import {
  ToastService,
  getNotifications,
  deleteNotification,
  readNotification,
} from "../../services";
import {
  ActionMenuButtonWrapper,
  ActionMenuItem,
  ContentHeader,
  ContentWrapper,
  MoreActionsIcon,
} from "../style";
import { useDispatch, useSelector } from "react-redux";
import { setNotifications } from "../../redux/actions";
import debounce from "lodash/debounce";

const Notification = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const isOpen = Boolean(anchorEl);
  const [tableRows, setTableRows] = useState([]);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [rowLength, setRowLength] = useState(0);
  const notifications = useSelector(
    (state) => state.notificationReducer.notifications,
  );
  const dispatch = useDispatch();
  const getLocaleString = (key) => t(key);

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const getAllNotifications = useCallback(() => {
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
    return getNotifications(query);
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
    getAllNotifications()
      .then((data) => {
        setRowLength(data.count);
        setTableRows(data.rows);
      })
      .catch((err) => {
        ToastService.showHttpError(
          err,
          getLocaleString("toast_load_notification_failed"),
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllNotifications, filterModel, notifications, paginationModel]);

  const handleClick = (event, row) => {
    setActiveRow(row);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChangedSearch = (filter) => {
    setFilterModel(filter);
  };

  const handleDebounceChangeSearch = debounce(handleChangedSearch, 500);

  const handleMarkAsRead = async () => {
    await readNotification(activeRow.id).then((res) => {
      ToastService.success(getLocaleString(res.message));
    });
    await getAllNotifications().then((res) => {
      setTableRows(res.rows);
      getNotifications({
        pageSize: 10,
        page: 0,
      }).then((res) => {
        dispatch(setNotifications(res.rows));
      });
    });
    handleClose();
  };

  const handleRemoveNotification = async (activeRow) => {
    await deleteNotification(activeRow.id).then((res) => {
      ToastService.success(getLocaleString(res.message));
    });
    await getAllNotifications().then((data) => {
      setRowLength(data.count);
      setTableRows(data.rows);
      getNotifications({
        pageSize: 10,
        page: 0,
      });
    });
    handleClose();
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

  const notificationTableColumns = [
    {
      field: "no",
      headerName: getLocaleString("common_table_number"),
      editable: false,
      filterable: false,
      width: 100,
    },
    {
      field: "content",
      headerName: getLocaleString("common_table_content"),
      editable: false,
      flex: 3,
      minWidth: 300,
    },
    {
      field: "unread",
      headerName: getLocaleString("common_table_read"),
      editable: false,
      type: "boolean",
      width: 100,
      renderCell: ({ row }) => (
        <Typography className="text-gray-500">
          {row.unread ? getLocaleString("no") : getLocaleString("yes")}
        </Typography>
      ),
    },
    {
      field: "createdAt",
      headerName: getLocaleString("common_table_received_at"),
      editable: false,
      type: "date",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) =>
        moment(row.createdAt).utc(false).format("YYYY-MM-DD"),
    },
    {
      field: "updatedAt",
      headerName: getLocaleString("common_table_viewed_at"),
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

  const rows = tableRows.map((item, index) => ({
    ...item,
    no: paginationModel.page * paginationModel.pageSize + index + 1,
    enabled: item.enabled ? "Yes" : "No",
    content: t(JSON.parse(item?.content).key, JSON.parse(item?.content).data),
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
            {getLocaleString("notification_page_title")}
          </Typography>
        </Box>
        <Box className="sm:flex justify-between gap-1">
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
        columns={notificationTableColumns}
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
          <ActionMenuItem onClick={() => handleMarkAsRead(activeRow)}>
            {getLocaleString("mark_as_read")}
          </ActionMenuItem>
          <ActionMenuItem onClick={() => handleRemoveNotification(activeRow)}>
            {getLocaleString("common_delete")}
          </ActionMenuItem>
        </Menu>
      )}
    </ContentWrapper>
  );
};

export default Notification;
