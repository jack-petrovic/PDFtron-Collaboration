import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { addSection, editSection, removeSection } from "../../../redux/actions";
import moment from "moment";
import { Box, Menu, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
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
  ArchivedChip,
  ArchivedIcon,
  ContentHeader,
  ContentWrapper,
  MenuItemButton,
  MoreActionsIcon,
} from "../../style";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ConfirmModal from "../../../components/Modal/ConfirmModal";
import debounce from "lodash/debounce";

const Section = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sections, setSections] = useState({ rows: [], count: 0 });
  const [openModal, setOpenModal] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [rowLength, setRowLength] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);
  const { account } = useAuthState();
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [removeItem, setRemoveItem] = useState(undefined);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

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

  const handleDebounceChangeSearch = debounce(handleChangedSearch, 500);

  const getAllSections = useCallback(() => {
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
    return getSections(query);
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
    getAllSections()
      .then((data) => {
        setRowLength(data.count);
        setSections(data);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllSections, filterModel, paginationModel]);

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
    await deleteSection(removeItem.id)
      .then((res) => {
        ToastService.success(getLocaleString(res.message));
        dispatch(removeSection(removeItem.id));
      });
    await getAllSections()
      .then((data) => {
        setSections(data);
        setRowLength(data.count);
      });
    handleClose();
    setOpenRemoveModal(false);
  };

  const handleCreateSection = async (data) => {
    await createSection({
      ...data,
    })
      .then((res) => {
        ToastService.success(getLocaleString("toast_create_section_success"));
        dispatch(addSection(res));
      });
    await getAllSections()
      .then((data) => {
        setSections(data);
        setRowLength(data.count);
      });
    handleCloseModal();
  };

  const handleUpdateSection = async (id, data, form) => {
    await updateSection(id, {
      ...data,
      ...form,
    })
      .then((res) => {
        dispatch(editSection(res));
        ToastService.success(getLocaleString("toast_update_section_success"));
      });
    await getAllSections()
      .then((data) => {
        setSections(data);
        setRowLength(data.count);
      });
    handleCloseModal();
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
          <MoreActionsIcon />
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
      width: 100,
    },
    {
      field: "name",
      headerName: getLocaleString("common_table_name"),
      editable: false,
      minWidth: 250,
      flex: 3,
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
      minWidth: 100,
    },
    {
      field: "createdAt",
      headerName: getLocaleString("common_table_created_at"),
      editable: false,
      type: "date",
      flex: 2,
      minWidth: 150,
      renderCell: ({ row }) =>
        moment(row.createdAt).utc(false).format("YYYY-MM-DD"),
    },
    {
      field: "updatedAt",
      headerName: getLocaleString("common_table_updated_at"),
      editable: false,
      type: "date",
      flex: 2,
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

  const rows = sections.rows.map((row, index) => ({
    ...row,
    no: paginationModel.page * paginationModel.pageSize + index + 1,
    archived: row.archived,
    createdAt: moment(row.createdAt).toDate(),
    updatedAt: moment(row.updatedAt).toDate(),
  }));

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <ContentWrapper>
      <ContentHeader>
        <Box className="mr-2">
          <Typography variant="h5">
            {getLocaleString("section_page_title")}
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
        columns={sectionTableColumns}
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
          <ActionMenuItem onClick={() => handleEditSection(activeRow)}>
            <EditIcon className="menu-icon" />
            {getLocaleString("common_edit")}
          </ActionMenuItem>
          {account.role.name === UserRoles.SUPERADMIN && (
            <ActionMenuItem onClick={() => handleOpenRemoveModal(activeRow)}>
              <DeleteIcon className="menu-icon" />
              {getLocaleString("common_delete")}
            </ActionMenuItem>
          )}
          <ActionMenuItem onClick={() => goToSubSectionPage(activeRow)}>
            <SubdirectoryArrowRightIcon className="menu-icon" />
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
