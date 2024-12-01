import { Box } from "@mui/system";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import React from "react";

const data = {
  columns: [
    {
      field: "id",
      hide: true,
    },
    {
      field: "desk",
      headerName: "Desk",
      width: 110,
    },
    {
      field: "commodity",
      headerName: "Commodity",
      width: 180,
      editable: false,
    },
    {
      field: "traderName",
      headerName: "Trader Name",
      width: 120,
      editable: false,
    },
    {
      field: "traderEmail",
      headerName: "Trader Email",
      width: 150,
      editable: false,
    },
    {
      field: "quantity",
      headerName: "Quantity",
      type: "number",
      width: 140,
      editable: false,
    },
  ],
  rows: [
    {
      id: "c12d0554-dd99-5d76-a43d-bde713d6f0df",
      desk: "D-3168",
      commodity: "Sugar No.11",
      traderName: "Alice Miles",
      traderEmail: "idamip@goh.ad",
      quantity: 39953,
    },
    {
      id: "e895ced9-e0b8-55c3-8d60-807201abdb86",
      desk: "D-8497",
      commodity: "Soybean Meal",
      traderName: "Todd Dean",
      traderEmail: "wupfelu@miiki.me",
      quantity: 86899,
    },
    {
      id: "b8dd37a7-afaf-5358-8133-19c0d4f69841",
      desk: "D-1305",
      commodity: "Soybean Oil",
      traderName: "Dustin Brady",
      traderEmail: "elmo@bahoatu.com",
      quantity: 26350,
    },
    {
      id: "d62857ce-dd8d-5771-9875-b6ff49a3d4da",
      desk: "D-5644",
      commodity: "Adzuki bean",
      traderName: "Effie Kelley",
      traderEmail: "siaza@apebid.bw",
      quantity: 90963,
    },
    {
      id: "9ced3796-d3dd-523e-ba96-93090d371276",
      desk: "D-9487",
      commodity: "Robusta coffee",
      traderName: "Lillie Allen",
      traderEmail: "giwe@zitusrit.tp",
      quantity: 41420,
    },
  ],
  initialState: {
    columns: {
      columnVisibilityModel: {
        id: false,
      },
    },
  },
};

const CustomDataGrid = () => {
  return (
    <Box width="100%" height={350}>
      <DataGrid {...data} slots={{ toolbar: GridToolbar }} />
    </Box>
  );
};

export default CustomDataGrid;
