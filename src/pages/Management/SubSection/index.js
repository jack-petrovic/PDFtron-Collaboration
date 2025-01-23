import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  addSubSection,
  editSubSection,
  removeSubSection,
} from "../../../redux/actions";
import { Box, Menu, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
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
  ArchivedChip,
  ArchivedIcon,
  ContentHeader,
  ContentWrapper,
  MenuItemButton,
  MoreActionsIcon,
} from "../../style";
import ConfirmModal from "../../../components/Modal/ConfirmModal";
import { UserRoles } from "../../../constants";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuthState } from "../../../hooks/redux";
import debounce from "lodash/debounce";

const SubSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { id } = useParams();
  const [subSections, setSubSections] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [activeSubSection, setActiveSubSection] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [rowLength, setRowLength] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [removeItem, setRemoveItem] = useState(undefined);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const isOpen = Boolean(anchorEl);
  const { account } = useAuthState();
  const [sectionName, setSectionName] = useState("");
  const sections = useSelector((state) => state.sectionReducer.sections);

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const getLocaleString = (key) => t(key);

  useEffect(() => {
    setSectionName(sections.find((item) => item?.id === id)?.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  const handleChangedSearch = (filter) => {
    setFilterModel(filter);
  };

  const handleDebounceChangeSearch = debounce(handleChangedSearch, 500);

  const getAllSubSections = useCallback(() => {
    let query = {
      id: id,
      pageSize: paginationModel.pageSize,
      page: paginationModel.page,
      filters: filterModel.items.map((item) => ({
        field: item.field,
        operator: item.operator,
        value: item.value,
      })),
      filtersOperator: filterModel.logicOperator,
    };
    return getSubSections(query);
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
    getAllSubSections()
      .then((data) => {
        setRowLength(data.count);
        setSubSections(data.rows);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllSubSections, filterModel, paginationModel]);

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
    await deleteSubSection(removeItem.id).then((res) => {
      dispatch(removeSubSection(removeItem.id));
      ToastService.success(getLocaleString(res.message));
    });
    await getAllSubSections().then((data) => {
      setRowLength(data.count);
      setSubSections(data.rows);
    });
    handleClose();
    setOpenRemoveModal(false);
  };

  const handleCreateSubSection = async (data, id) => {
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
      setRowLength(data.count);
      setSubSections(data.rows);
    });
    handleCloseModal();
  };

  const handleUpdateSubSection = async (id, data, sectionId) => {
    await updateSubSection(id, {
      ...data,
    }).then((res) => {
      dispatch(editSubSection({ ...res, sectionId: sectionId }));
      ToastService.success(
        getLocaleString("toast_update_sub_section_success"),
      );
    });

    await getAllSubSections().then((data) => {
      setRowLength(data.count);
      setSubSections(data.rows);
    });
    handleCloseModal();
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
          <MoreActionsIcon />
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
      flex: 1,
      minWidth: 100,
    },
    {
      field: "name",
      headerName: getLocaleString("common_table_name"),
      editable: false,
      flex: 3,
      minWidth: 250,
      renderCell: ({ row }) => (
        <React.Fragment key={row.no}>
          {row.name}
          {row.archived && (
            <ArchivedChip
              label={getLocaleString("common_table_archived")}
              icon={<ArchivedIcon />}
              color="warning"
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
      minWidth: 150,
    },
    {
      field: "section",
      headerName: getLocaleString("common_table_section"),
      editable: false,
      filterable: false,
      flex: 1.5,
      minWidth: 150,
    },
    {
      field: "createdAt",
      headerName: getLocaleString("common_table_created_at"),
      editable: false,
      type: "date",
      renderCell: ({ row }) =>
        moment(row.createdAt).utc(false).format("YYYY-MM-DD"),
      flex: 1,
      minWidth: 100,
    },
    {
      field: "updatedAt",
      headerName: getLocaleString("common_table_updated_at"),
      editable: false,
      type: "date",
      renderCell: ({ row }) =>
        moment(row.updatedAt).utc(false).format("YYYY-MM-DD"),
      flex: 1,
      minWidth: 100,
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

  const rows = subSections.map((row, index) => ({
    ...row,
    no: paginationModel.page * paginationModel.pageSize + index + 1,
    archived: row.archived,
    section: sectionName,
    createdAt: moment(row.createdAt).toDate(),
    updatedAt: moment(row.updatedAt).toDate(),
  }));

  return (
    <ContentWrapper>
      <ContentHeader>
        <Box className="mr-2">
          <Typography variant="h5">
            {getLocaleString("subsection_page_title")}
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
        columns={subSectionTableColumns}
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
          <ActionMenuItem onClick={() => handleEditSubSection(activeRow)}>
            <EditIcon className="menu-icon" />
            {getLocaleString("common_edit")}
          </ActionMenuItem>
          {account.role.name === UserRoles.SUPERADMIN && (
            <ActionMenuItem onClick={() => handleOpenRemoveModal(activeRow)}>
              <DeleteIcon className="menu-icon" />
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
