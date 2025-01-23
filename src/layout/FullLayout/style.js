import styled from "@emotion/styled";
import { Box } from "@mui/material";

export const AppContainer = styled(Box)`
  height: 100%;
  padding-top: 64px;

  @media (max-width: 600px) {
    padding-top: 56px;
  }

  display: flex;
  flex-direction: column;
`;
