import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
  addSubSection,
  editSubSection,
  removeSubSection,
} from "../../../redux/actions";
import { Box, Menu, Typography, Button, Pagination, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import moment from "moment";
import CustomDataGrid from "../../../components/common/DataGrid";
import CreateSubSectionModal from "../../../components/Modal/CreateSubSectionModal";
import {
  createSubSection,
  getSubSections,
  updateSubSection,
  ToastService,
  deleteSubSection,
} from "../../../services";
import {
  ActionMenuButtonWrapper,
  ActionMenuItem,
  ContentHeader,
  ContentWrapper,
} from "../../style";
import ConfirmModal from "../../../components/Modal/ConfirmModal";
import { UserRoles } from "../../../constants";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuthState } from "../../../hooks/redux";

const SubSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { id } = useParams();
  const [subSections, setSubSections] = useState([]);
  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [activeSubSection, setActiveSubSection] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const pageSize = 10;
  const [totalPage, setTotalPage] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [removeItem, setRemoveItem] = useState(undefined);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const isOpen = Boolean(anchorEl);
  const { account } = useAuthState();
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
    setActiveSubSection(null);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleChangeSearch = (filter) => {
    setFilterModel(filter);
  };

  const getAllSubSections = useCallback(() => {
    let query = {};
    query.id = id;
    query.pageSize = pageSize;
    query.page = page;
    query.filters = filterModel.items.map((item) => ({
      field: item.field,
      operator: item.operator,
      value: item.value,
    }));
    query.filtersOperator = filterModel.logicOperator;
    return getSubSections(query);
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
    getAllSubSections()
      .then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setSubSections(data.rows);
      })
      .catch((err) => {
        ToastService.showHttpError(
          err,
          getLocaleString("toast_load_sub_sections_failed"),
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllSubSections, filterModel]);

  const handleEditSubSection = (subSection) => {
    setOpenModal(true);
    setActiveSubSection(subSections.find((item) => item.id === subSection.id));
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

  const handleRemoveSubSection = async () => {
    try {
      await deleteSubSection(removeItem.id).then((res) => {
        dispatch(removeSubSection(removeItem.id));
        ToastService.success(getLocaleString(res.message));
      });
      await getAllSubSections().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setSubSections(data.rows);
      });
    } catch (err) {
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
    handleClose();
    setOpenRemoveModal(false);
  };

  const handleCreateSubSection = async (data, id) => {
    try {
      await createSubSection({
        ...data,
        sectionId: id,
      }).then((res) => {
        ToastService.success(
          getLocaleString("toast_create_sub_section_success"),
        );
        dispatch(addSubSection(res));
      });
      await getAllSubSections().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setSubSections(data.rows);
      });
      handleCloseModal();
    } catch (err) {
      console.log("err=>", err);
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
  };

  const handleUpdateSubSection = async (id, data, form) => {
    try {
      await updateSubSection(id, {
        ...data,
        ...form,
      }).then((res) => {
        dispatch(editSubSection(res));
        ToastService.success(
          getLocaleString("toast_update_sub_section_success"),
        );
      });

      await getAllSubSections().then((data) => {
        setTotalPage(Math.ceil(data.count / pageSize));
        setSubSections(data.rows);
      });
      handleCloseModal();
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

  const handleGoBack = () => {
    const pathArr = location.pathname.split("/");
    navigate(`${pathArr.slice(0, pathArr.length - 1).join("/")}`);
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

  const subSectionTableColumns = [
    {
      field: "no",
      headerName: getLocaleString("common_table_number"),
      editable: false,
      filterable: false,
      flex: 2,
    },
    {
      field: "name",
      headerName: getLocaleString("common_table_name"),
      editable: false,
      flex: 4,
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
      field: "sectionId",
      headerName: getLocaleString("common_table_sectionId"),
      editable: false,
      flex: 1,
    },
    {
      field: "createdAt",
      headerName: getLocaleString("common_table_created_at"),
      editable: false,
      type: "date",
      renderCell: ({ row }) =>
        moment(row.createdAt).utc(false).format("YYYY-MM-DD"),
      flex: 2,
    },
    {
      field: "updatedAt",
      headerName: getLocaleString("common_table_updated_at"),
      editable: false,
      type: "date",
      renderCell: ({ row }) =>
        moment(row.updatedAt).utc(false).format("YYYY-MM-DD"),
      flex: 2,
    },
    {
      field: "action",
      headerName: "",
      editable: false,
      filterable: false,
      flex: 2,
      renderCell,
    },
  ];

  const rows = subSections.map((row, index) => ({
    ...row,
    no: (page - 1) * pageSize + index + 1,
    archived: row.archived,
    createdAt: moment(row.createdAt).toDate(),
    updatedAt: moment(row.updatedAt).toDate(),
  }));

  return (
    <ContentWrapper>
      <ContentHeader>
        <Box>
          <Typography variant="h5">
            {getLocaleString("subsection_page_title")}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            sx={{ marginRight: "0.25rem" }}
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
        columns={subSectionTableColumns}
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
          <ActionMenuItem onClick={() => handleEditSubSection(activeRow)}>
            <EditIcon sx={{ marginRight: "1rem", color: "gray" }} />
            {getLocaleString("common_edit")}
          </ActionMenuItem>
          {account.role.name === UserRoles.SUPERADMIN && (
            <ActionMenuItem onClick={() => handleOpenRemoveModal(activeRow)}>
              <DeleteIcon sx={{ marginRight: "1rem", color: "gray" }} />
              {getLocaleString("common_delete")}
            </ActionMenuItem>
          )}
        </Menu>
      )}
      <CreateSubSectionModal
        open={openModal}
        close={handleCloseModal}
        data={activeSubSection}
        create={handleCreateSubSection}
        update={handleUpdateSubSection}
      />
      <ConfirmModal
        content="toast_delete_sub_section_confirm_message"
        open={openRemoveModal}
        close={handleCloseRemoveModal}
        handleClick={handleRemoveSubSection}
      />
    </ContentWrapper>
  );
};

export default SubSection;
