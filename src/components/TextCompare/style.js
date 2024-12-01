import styled from "@emotion/styled";
import { Box } from "@mui/material";

export const TextCompareWrapper = styled(Box)`
  position: relative;
  height: 100%;
`;

export const TextCompareContainer = styled(Box)`
  position: absolute;
  top: 8rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
`;

export const TextCompareItem = styled(Box)`
  color: #ea5858;
  padding: 0 0.75rem;
  border: 1px solid #ea5858;
  border-radius: 0.5rem;
`;
