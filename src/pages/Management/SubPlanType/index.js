import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  addSubPlanType,
  editSubPlanType,
  removeSubPlanType,
} from "../../../redux/actions";
import { Box, Button, Menu, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import moment from "moment";
import CustomDataGrid from "../../../components/common/DataGrid";
import CreateSubPlanTypeModal from "../../../components/Modal/CreateSubPlanTypeModal";
import {
  createSubType,
  getSubPlanTypes,
  updateSubType,
  ToastService,
  deleteSubType,
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

const SubPlanType = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [subTypes, setSubTypes] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeSubType, setActiveSubType] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [rowLength, setRowLength] = useState(0);
  const isOpen = Boolean(anchorEl);
  const { account } = useAuthState();
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [removeItem, setRemoveItem] = useState(undefined);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [planTypeName, setPlanTypeName] = useState("");
  const planTypes = useSelector((state) => state.planTypeReducer.planTypes);

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const getLocaleString = (key) => t(key);

  useEffect(() => {
    setPlanTypeName(planTypes.find((item) => item?.id === id)?.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleClick = (event, row) => {
    setActiveRow(row);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
    setActiveSubType(null);
  };

  const getAllSubTypes = useCallback(() => {
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
    return getSubPlanTypes(query);
  }, [paginationModel, filterModel, id]);

  const handleChangedSearch = (filter) => {
    setFilterModel(filter);
  };

  const handleDebounceChangeSearch = debounce(handleChangedSearch, 500);

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
    getAllSubTypes()
      .then((data) => {
        setRowLength(data.count);
        setSubTypes(data.rows);
      })
      .catch((err) => {
        console.log("err=>", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllSubTypes, filterModel, id, paginationModel]);

  const handleCreateSubPlanType = async (data, id) => {
    await createSubType({
      ...data,
      planTypeId: id,
    }).then((res) => {
      ToastService.success(
        getLocaleString("toast_create_sub_plan_type_success"),
      );
      dispatch(addSubPlanType(res));
    });

    await getAllSubTypes().then((data) => {
      setRowLength(data.count);
      setSubTypes(data.rows);
    });
    setOpenModal(false);
  };

  const handleUpdateSubPlanType = async (id, data, planTypeId) => {
    await updateSubType(id, data).then((res) => {
      dispatch(editSubPlanType({ ...res, planTypeId: planTypeId }));
      ToastService.success(
        getLocaleString("toast_update_sub_plan_type_success"),
      );
    });
    await getAllSubTypes().then((data) => {
      setRowLength(data.count);
      setSubTypes(data.rows);
    });
    setOpenModal(false);
  };

  const handleEditSubPlanType = (row) => {
    setOpenModal(true);
    setActiveSubType(subTypes.find((type) => type.id === row.id));
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

  const handleRemoveSubType = async () => {
    await deleteSubType(removeItem.id).then((res) => {
      dispatch(removeSubPlanType(removeItem.id));
      ToastService.success(getLocaleString(res.message));
    });
    await getAllSubTypes().then((data) => {
      setRowLength(data.count);
      setSubTypes(data.rows);
    });
    handleClose();
    setOpenRemoveModal(false);
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

  const typeTableColumns = [
    {
      field: "no",
      headerName: getLocaleString("common_table_number"),
      editable: false,
      filterable: false,
      flex: 0.5,
      minWidth: 100,
    },
    {
      field: "name",
      headerName: getLocaleString("common_table_name"),
      editable: false,
      flex: 1,
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
      field: "planType",
      headerName: getLocaleString("common_table_plan_type"),
      editable: false,
      filterable: false,
      flex: 1,
      minWidth: 150,
    },
    {
      field: "createdAt",
      headerName: getLocaleString("common_table_created_at"),
      editable: false,
      type: "date",
      flex: 1,
      minWidth: 100,
      renderCell: ({ row }) =>
        moment(row.createdAt).utc(false).format("YYYY-MM-DD"),
    },
    {
      field: "updatedAt",
      headerName: getLocaleString("common_table_updated_at"),
      editable: false,
      type: "date",
      flex: 1,
      minWidth: 100,
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

  const rows = subTypes.map((item, index) => ({
    ...item,
    no: paginationModel.page * paginationModel.pageSize + index + 1,
    archived: item.archived,
    planType: planTypeName,
    createdAt: moment(item.createdAt).toDate(),
    updatedAt: moment(item.updatedAt).toDate(),
  }));

  const handleGoBack = () => {
    const pathArr = location.pathname.split("/");
    navigate(`${pathArr.slice(0, pathArr.length - 1).join("/")}`);
  };

  return (
    <ContentWrapper>
      <ContentHeader>
        <Box className="mr-5">
          <Typography variant="h5">
            {getLocaleString("sub_plan_type_page_title")}
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
          <ActionMenuItem onClick={() => handleEditSubPlanType(activeRow)}>
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
      <CreateSubPlanTypeModal
        data={activeSubType}
        open={openModal}
        close={() => setOpenModal(false)}
        create={handleCreateSubPlanType}
        update={handleUpdateSubPlanType}
      />
      <ConfirmModal
        content="toast_delete_sub_plan_type_confirm_message"
        open={openRemoveModal}
        close={handleCloseRemoveModal}
        handleClick={handleRemoveSubType}
      />
    </ContentWrapper>
  );
};
export default SubPlanType;
