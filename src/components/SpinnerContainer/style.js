import styled from "@emotion/styled";
import { Box } from "@mui/material";

export const SpinnerBox = styled(Box)`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100vw;
  height: 100vh;
  background-color: white;
  opacity: 0.6;
  display: flex;
  align-items: center;
  justify-content: center;
`;
