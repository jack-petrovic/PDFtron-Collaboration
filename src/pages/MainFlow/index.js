import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, Button, Pagination, Typography } from "@mui/material";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import moment from "moment";
import CustomDataGrid from "../../components/common/DataGrid";
import { ToastService, getProgressPlans } from "../../services";
import { ContentHeader, ContentWrapper } from "../style";
import { useAuthState } from "../../hooks/redux";
import { UserRoles } from "../../constants";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

const ProgressingPlan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [plans, setPlans] = useState({ rows: [], count: 0 });
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalPage, setTotalPage] = useState(0);
  const { t } = useTranslation();
  const { account } = useAuthState();
  const [filterModel, setFilterModel] = useState({ items: [] });
  const getLocaleString = (key) => t(key);
  const handleChangedSearch = (filter) => {
    setFilterModel(filter);
  };

  const getProgressingPlans = useCallback(() => {
    let query = {};
    query.pageSize = pageSize;
    query.page = page;
    if (account?.name === UserRoles.MASTER) {
      query.sectionId = account?.sectionId;
    } else if (account?.name === UserRoles.SUBMASTER) {
      query.subsectionId = account?.subsectionId;
    } else if (account?.name === UserRoles.EDITOR) {
      query.sectionId = account?.sectionId;
      query.subsectionId = account?.subsectionId;
    } else {
      query.sectionId = null;
    }
    query.filters = filterModel.items.map((item) => ({
      field: item.field,
      operator: item.operator,
      value: item.value,
    }));
    query.filtersOperator = filterModel.logicOperator;
    return getProgressPlans(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    getProgressingPlans()
      .then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setPlans(data);
      })
      .catch((err) => {
        ToastService.showHttpError(
          err,
          getLocaleString("toast_load_progress_plans_failed"),
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProgressingPlans, filterModel]);

  const handleDetailPlan = (item) => {
    navigate(`plan/${item.id}`);
  };

  const renderCell = ({ row }) => {
    return (
      <Button variant="contained" onClick={() => handleDetailPlan(row)}>
        <StickyNote2Icon sx={{ marginRight: "0.3rem", color: "white" }} />
        {getLocaleString("common_detail_view")}
      </Button>
    );
  };

  const planTableColumns = [
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
      field: "section",
      headerName: getLocaleString("common_table_section"),
      editable: false,
      flex: 1,
    },
    {
      field: "subsection",
      headerName: getLocaleString("common_table_subsection"),
      editable: false,
      flex: 1,
    },
    {
      field: "startDate",
      headerName: getLocaleString("common_table_start_date"),
      editable: false,
      flex: 1,
      type: "date",
      renderCell: ({ row }) =>
        moment(row.startDate).utc(false).format("YYYY-MM-DD"),
    },
    {
      field: "endDate",
      headerName: getLocaleString("common_table_end_date"),
      editable: false,
      flex: 1,
      type: "date",
      renderCell: ({ row }) =>
        moment(row.endDate).utc(false).format("YYYY-MM-DD"),
    },
    {
      field: "publishDate",
      headerName: getLocaleString("common_table_publish_date"),
      editable: false,
      flex: 1,
      type: "date",
      renderCell: ({ row }) =>
        moment(row.publishDate).utc(false).format("YYYY-MM-DD"),
    },
    {
      field: "action",
      headerName: "",
      editable: false,
      filterable: false,
      flex: 1.5,
      renderCell,
    },
  ];

  const rows = plans.rows.map((row, index) => ({
    ...row,
    no: (page - 1) * pageSize + index + 1,
    section: row.section?.name || "None",
    subsection: row.subsection?.name || "None",
    sectionId: row.section?.id,
    subsectionId: row.subsection?.id,
    startDate: moment(row.startDate).toDate(),
    endDate: moment(row.endDate).toDate(),
    publishDate: moment(row.publishDate).toDate(),
  }));
  const handleChangePage = (event, value) => {
    setPage(value);
  };
  const handleGoBack = () => {
    // const pathArr = location.pathname.split("/");
    // navigate(`${pathArr.slice(0, pathArr.length - 1).join("/")}`);
    navigate("/");
  };

  return (
    <ContentWrapper>
      <ContentHeader>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Typography variant="h5">
            {getLocaleString("main_flow_page_title")}
          </Typography>
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
        columns={planTableColumns}
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
    </ContentWrapper>
  );
};

export default ProgressingPlan;
