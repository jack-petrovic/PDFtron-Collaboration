import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, Button, Menu, Pagination, Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
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
} from "../style";
import { useDispatch, useSelector } from "react-redux";
import { setNotifications } from "../../redux/actions";

const Notification = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const isOpen = Boolean(anchorEl);
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState();
  const [tableRows, setTableRows] = useState([]);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const notifications = useSelector(
    (state) => state.notificationReducer.notifications,
  );
  const dispatch = useDispatch();
  const getLocaleString = (key) => t(key);

  const getAllNotifications = useCallback(() => {
    let query = {};
    query.pageSize = pageSize;
    query.page = page;
    query.filters = filterModel.items.map((item) => ({
      field: item.field,
      operator: item.operator,
      value: item.value,
    }));
    query.filtersOperator = filterModel.logicOperator;
    return getNotifications(query);
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
    getAllNotifications()
      .then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setTableRows(data.rows);
      })
      .catch((err) => {
        ToastService.error(getLocaleString("toast_load_notification_failed"));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllNotifications, filterModel, notifications]);

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

  const handleMarkAsRead = async () => {
    try {
      await readNotification(activeRow.id).then((res) => {
        ToastService.success(getLocaleString(res.message));
      });
      await getAllNotifications().then((res) => {
        setTableRows(res.rows);
        getNotifications({
          pageSize: 10,
          page: 1,
        }).then((res) => {
          dispatch(setNotifications(res.rows));
        });
      });
      handleClose();
    } catch (err) {
      console.log("err=>", err);
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
  };

  const handleRemoveNotification = async (activeRow) => {
    try {
      await deleteNotification(activeRow.id).then((res) => {
        ToastService.success(getLocaleString(res.message));
      });
      await getAllNotifications().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setTableRows(data.rows);
        getNotifications({
          pageSize: 10,
          page: 1,
        });
      });
      handleClose();
    } catch (err) {
      console.log("err=>", err);
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
  };

  const handleChangePage = (event, value) => {
    setPage(value);
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

  const notificationTableColumns = [
    {
      field: "no",
      headerName: getLocaleString("common_table_number"),
      editable: false,
      filterable: false,
      flex: 1,
    },
    {
      field: "content",
      headerName: getLocaleString("common_table_content"),
      editable: false,
      flex: 3,
    },
    {
      field: "unread",
      headerName: getLocaleString("common_table_read"),
      editable: false,
      type: "boolean",
      flex: 1,
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
      renderCell: ({ row }) =>
        moment(row.createdAt).utc(false).format("YYYY-MM-DD"),
    },
    {
      field: "updatedAt",
      headerName: getLocaleString("common_table_viewed_at"),
      editable: false,
      type: "date",
      flex: 1,
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

  const rows = tableRows.map((item, index) => ({
    ...item,
    no: (page - 1) * pageSize + index + 1,
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
        <Box>
          <Typography variant="h5">
            {getLocaleString("notification_page_title")}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="between" gap="4px">
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
