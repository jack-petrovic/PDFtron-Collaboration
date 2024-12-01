import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { addSection, editSection, removeSection } from "../../../redux/actions";
import moment from "moment";
import { Box, Menu, Typography, Button, Pagination, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import CustomDataGrid from "../../../components/common/DataGrid";
import CreateSectionModal from "../../../components/Modal/CreateSectionModal";
import {
  createSection,
  deleteSection,
  getSections,
  updateSection,
  ToastService,
} from "../../../services";
import { useAuthState } from "../../../hooks/redux";
import { UserRoles } from "../../../constants";
import {
  ActionMenuButtonWrapper,
  ActionMenuItem,
  ContentHeader,
  ContentWrapper,
} from "../../style";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ConfirmModal from "../../../components/Modal/ConfirmModal";

const Section = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sections, setSections] = useState({ rows: [], count: 0 });
  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const pageSize = 10;
  const [totalPage, setTotalPage] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);
  const { account } = useAuthState();
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
    setActiveSection(null);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleChangedSearch = (filter) => {
    setFilterModel(filter);
  };

  const getAllSections = useCallback(() => {
    let query = {};
    query.pageSize = pageSize;
    query.page = page;
    query.filters = filterModel.items.map((item) => ({
      field: item.field,
      operator: item.operator,
      value: item.value,
    }));
    query.filtersOperator = filterModel.logicOperator;
    return getSections(query);
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
    getAllSections()
      .then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setSections(data);
      })
      .catch((err) => {
        ToastService.showHttpError(
          err,
          getLocaleString("toast_load_sections_failed"),
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllSections, filterModel]);

  const handleEditSection = (section) => {
    setOpenModal(true);
    setActiveSection(sections.rows.find((item) => item.id === section.id));
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

  const handleRemoveSection = async () => {
    try {
      await deleteSection(removeItem.id).then((res) => {
        ToastService.success(getLocaleString(res.message));
        dispatch(removeSection(removeItem.id));
      });
      await getAllSections().then((data) => {
        setSections(data);
        setTotalPage(Math.ceil(data.count / pageSize));
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

  const handleCreateSection = async (data) => {
    try {
      await createSection({
        ...data,
      }).then((res) => {
        ToastService.success(getLocaleString("toast_create_section_success"));
        dispatch(addSection(res));
      });
      await getAllSections().then((data) => {
        setSections(data);
        setTotalPage(Math.ceil(data.count / pageSize));
      });
      handleCloseModal();
    } catch (err) {
      console.log("err=>", err);
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
  };

  const handleUpdateSection = async (id, data, form) => {
    try {
      await updateSection(id, {
        ...data,
        ...form,
      }).then((res) => {
        dispatch(editSection(res));
        ToastService.success(getLocaleString("toast_update_section_success"));
      });
      await getAllSections().then((data) => {
        setSections(data);
        setTotalPage(Math.ceil(data.count / pageSize));
      });
      handleCloseModal();
    } catch (err) {
      console.log("err=>", err);
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
  };

  const goToSubSectionPage = (item) => {
    navigate(`/management/section/${item.id}`);
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

  const sectionTableColumns = [
    {
      field: "no",
      headerName: getLocaleString("common_table_number"),
      editable: false,
      filterable: false,
      flex: 1,
    },
    {
      field: "name",
      headerName: getLocaleString("common_table_name"),
      editable: false,
      flex: 3,
      renderCell: ({ row }) => (
        <React.Fragment key={row.no}>
          {row.name}
          {row.archived && (
            <Chip
              label={getLocaleString("common_table_archived")}
              icon={<WarningAmberIcon sx={{ fontSize: "16px" }} />}
              color="warning"
              sx={{ marginLeft: "0.5rem" }}
            />
          )}
        </React.Fragment>
      ),
    },
    {
      field: "archived",
      headerName: getLocaleString("common_table_archived"),
      editable: false,
      type: "boolean",
      flex: 1,
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
      field: "updatedAt",
      headerName: getLocaleString("common_table_updated_at"),
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

  const rows = sections.rows.map((row, index) => ({
    ...row,
    no: (page - 1) * pageSize + index + 1,
    archived: row.archived,
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
            {getLocaleString("section_page_title")}
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
        columns={sectionTableColumns}
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
          <ActionMenuItem onClick={() => handleEditSection(activeRow)}>
            <EditIcon sx={{ marginRight: "1rem", color: "gray" }} />
            {getLocaleString("common_edit")}
          </ActionMenuItem>
          {account.role.name === UserRoles.SUPERADMIN && (
            <ActionMenuItem onClick={() => handleOpenRemoveModal(activeRow)}>
              <DeleteIcon sx={{ marginRight: "1rem", color: "gray" }} />
              {getLocaleString("common_delete")}
            </ActionMenuItem>
          )}
          <ActionMenuItem onClick={() => goToSubSectionPage(activeRow)}>
            <SubdirectoryArrowRightIcon
              sx={{ marginRight: "1rem", color: "gray" }}
            />
            {getLocaleString("section_go_to_subsection")}
          </ActionMenuItem>
        </Menu>
      )}
      {openModal && (
        <CreateSectionModal
          open={openModal}
          close={handleCloseModal}
          data={activeSection}
          create={handleCreateSection}
          update={handleUpdateSection}
        />
      )}
      <ConfirmModal
        content="toast_delete_section_confirm_message"
        open={openRemoveModal}
        close={handleCloseRemoveModal}
        handleClick={handleRemoveSection}
      />
    </ContentWrapper>
  );
};

export default Section;
