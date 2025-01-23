import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, Button, Typography } from "@mui/material";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import moment from "moment";
import CustomDataGrid from "../../components/common/DataGrid";
import { ToastService, getProgressPlans } from "../../services";
import { ContentHeader, ContentWrapper } from "../style";
import { useAuthState } from "../../hooks/redux";
import { UserRoles } from "../../constants";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import debounce from "lodash/debounce";

const ProgressingPlan = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState({ rows: [], count: 0 });
  const [rowLength, setRowLength] = useState(0);
  const { t } = useTranslation();
  const { account } = useAuthState();
  const [filterModel, setFilterModel] = useState({ items: [] });

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const getLocaleString = (key) => t(key);

  const handleChangedSearch = (filter) => {
    setFilterModel(filter);
  };

  const handleDebounceChangeSearch = debounce(handleChangedSearch, 500);

  const getProgressingPlans = useCallback(() => {
    let query = {};
    query.pageSize = paginationModel.pageSize;
    query.page = paginationModel.page;
    if (account?.name === UserRoles.MASTER) {
      query.sectionId = account?.sectionId;
    } else if (account?.name === UserRoles.SUBMASTER) {
      query.sectionId = account?.sectionId;
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
    getProgressingPlans()
      .then((data) => {
        if (!data.count) {
          ToastService.warning(getLocaleString("common_table_no_plan"));
        }
        setRowLength(data.count);
        setPlans(data);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProgressingPlans, filterModel, paginationModel]);

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
      width: 100,
    },
    {
      field: "title",
      headerName: getLocaleString("common_table_title"),
      editable: false,
      flex: 3,
      minWidth: 250,
    },
    {
      field: "section",
      headerName: getLocaleString("common_table_section"),
      editable: false,
      flex: 1,
      minWidth: 150,
    },
    {
      field: "subsection",
      headerName: getLocaleString("common_table_subsection"),
      editable: false,
      flex: 1,
      minWidth: 150,
    },
    {
      field: "startDate",
      headerName: getLocaleString("common_table_start_date"),
      editable: false,
      flex: 1,
      minWidth: 150,
      type: "date",
      renderCell: ({ row }) =>
        moment(row.startDate).utc(false).format("YYYY-MM-DD"),
    },
    {
      field: "endDate",
      headerName: getLocaleString("common_table_end_date"),
      editable: false,
      flex: 1,
      minWidth: 150,
      type: "date",
      renderCell: ({ row }) =>
        moment(row.endDate).utc(false).format("YYYY-MM-DD"),
    },
    {
      field: "publishDate",
      headerName: getLocaleString("common_table_publish_date"),
      editable: false,
      flex: 1,
      minWidth: 150,
      type: "date",
      renderCell: ({ row }) =>
        moment(row.publishDate).utc(false).format("YYYY-MM-DD"),
    },
    {
      field: "action",
      headerName: getLocaleString("common_table_action"),
      editable: false,
      filterable: false,
      sortable: false,
      width: 175,
      renderCell,
    },
  ];

  const rows = plans.rows.map((row, index) => ({
    ...row,
    no: paginationModel.page * paginationModel.pageSize + index + 1,
    section: row.section?.name || "None",
    subsection: row.subsection?.name || "None",
    sectionId: row.section?.id,
    subsectionId: row.subsection?.id,
    startDate: moment(row.startDate).toDate(),
    endDate: moment(row.endDate).toDate(),
    publishDate: moment(row.publishDate).toDate(),
  }));

  const handleGoBack = () => {
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
        rowLength={rowLength}
        onPaginationModelChange={setPaginationModel}
        paginationModel={paginationModel}
        filterModel={filterModel}
        onFilterChanged={handleDebounceChangeSearch}
      />
    </ContentWrapper>
  );
};

export default ProgressingPlan;
