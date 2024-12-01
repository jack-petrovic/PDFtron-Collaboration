import styled from "@emotion/styled";
import { Box, MenuItem } from "@mui/material";

export const ActionMenuButtonWrapper = styled(Box)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  height: 100%;
`;

export const ActionMenuItem = styled(MenuItem)(() => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  padding: "8px 16px",
}));

export const ContentWrapper = styled(Box)(() => ({
  height: "100%",
  backgroundColor: "#f8fafc",
  padding: "2rem 2rem 0 2rem",
}));

export const ContentHeader = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "1.5rem",
}));
