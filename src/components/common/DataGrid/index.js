import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataGridPro, GridToolbar } from "@mui/x-data-grid-pro";
import { GridContainer } from "./style";

const CustomDataGrid = ({
  rows,
  columns,
  filterModel,
  filterMode = "client",
  paginationModel,
  rowLength,
  onPaginationModelChange,
  onFilterChanged,
}) => {
  const { t } = useTranslation();
  const pageOptions = [10, 25, 50, 100];
  const getLocaleString = (key) => t(key);

  const localeText = useMemo(
    () => ({
      toolbarColumns: getLocaleString("common_columns"),
      noRowsLabel: getLocaleString("common_no_rows"),
      columnsManagementSearchTitle: getLocaleString("columns_search_title"),
      columnsManagementReset: getLocaleString("columns_reset"),
      columnsManagementShowHideAllText: getLocaleString("columns_show_all_text"),
      toolbarFilters: getLocaleString("common_filters"),
      filterPanelAddFilter: getLocaleString("data_grid_table_add_filter_button"),
      filterPanelRemoveAll: getLocaleString("data_grid_table_delete_filters_button"),
      filterPanelColumns: getLocaleString("filter_columns"),
      filterPanelOperator: getLocaleString("filter_operator"),
      filterOperatorContains: getLocaleString("filter_contain"),
      filterOperatorEquals: getLocaleString("filter_equal"),
      filterOperatorStartsWith: getLocaleString("filter_start_with"),
      filterOperatorEndsWith: getLocaleString("filter_end_with"),
      filterOperatorIsEmpty: getLocaleString("filter_is_empty"),
      filterOperatorIsNotEmpty: getLocaleString("filter_is_not_empty"),
      filterOperatorIsAnyOf: getLocaleString("filter_is_any_of"),
      filterPanelInputLabel: getLocaleString("filter_input"),
      filterPanelInputPlaceholder: getLocaleString("filter_input_placeholder"),
      toolbarDensity: getLocaleString("common_density"),
      toolbarDensityStandard: getLocaleString("density_standard"),
      toolbarDensityCompact: getLocaleString("density_compact"),
      toolbarDensityComfortable: getLocaleString("density_comfortable"),
      toolbarExport: getLocaleString("common_export"),
      toolbarExportCSV: getLocaleString("export_csv"),
      toolbarExportPrint: getLocaleString("export_print"),
      columnMenuSortAsc: getLocaleString("menu_sort_by_asc"),
      columnMenuSortDesc: getLocaleString("menu_sort_by_desc"),
      pinToLeft: getLocaleString("menu_to_left"),
      pinToRight: getLocaleString("menu_to_right"),
      columnMenuHideColumn: getLocaleString("menu_hide_columns"),
      columnMenuFilter: getLocaleString("menu_filter"),
      columnMenuManageColumns: getLocaleString("menu_manage_columns"),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  const hasRows = rows.length > 0;

  return (
    <GridContainer>
      <DataGridPro
        className="data-grid"
        rows={rows}
        columns={columns}
        scrollbarSize={50}
        style={{ height: hasRows ? "auto" : "50vh" }}
        localeText={localeText}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            printOptions: {
              disableToolbarButton: true,
            },
          },
        }}
        pagination
        pageSizeOptions={pageOptions}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        rowCount={rowLength}
        paginationMode="server"
        initialState={{ pinnedColumns: { right: ["action"] } }}
        hideFooter={false}
        filterMode={filterMode}
        filterModel={filterModel}
        onFilterModelChange={onFilterChanged}
      />
    </GridContainer>
  );
};

export default CustomDataGrid;
