import styled from "@emotion/styled";
import { Box } from "@mui/material";

export const SignedDocumentWrapper = styled(Box)(({ index }) => ({
  display: "flex",
  alignItems: "center",
  padding: "0.625rem",
  fontSize: "14px",
  textAlign: "left",
  border: "1px solid #cfd4da",
  borderRadius: "5px",
  cursor: "pointer",
  marginTop: index === 0 ? "0" : "0.5rem",
}));
