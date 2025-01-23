import styled from "@emotion/styled";
import { Box } from "@mui/material";

export const SpinnerBox = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;      
  transform: translate(-50%, -50%);
  z-index: 1000;
  width: 100%;
  height: 100%;
  background-color: white;
  opacity: 0.6;
  display: flex;
  align-items: center;
  justify-content: center;
`;
