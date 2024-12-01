import styled from "@emotion/styled";
import { Box } from "@mui/material";

export const GridContainer = styled(Box)`
  width: 100%;

  .data-grid {
    min-height: 100px;

    .MuiDataGrid-main {
      min-height: 100px;
    }

    .MuiDataGrid-virtualScrollerContent {
      min-height: 50px;
    }
  }
`;
