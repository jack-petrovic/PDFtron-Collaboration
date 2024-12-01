import styled from "@emotion/styled";
import { Box, Typography } from "@mui/material";

export const ErrorText = styled(Typography)(() => ({
  color: "#ea5858",
}));

export const FormWrapper = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  backgroundColor: "#f8fafc",
}));

export const FromContainer = styled(Box)(() => ({
  backgroundColor: "#fcfcfc",
  borderRadius: "1rem",
  width: "500px",
  maxWidth: "100%",
  padding: "1.5rem",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
}));

export const SuccessText = styled(Typography)(() => ({
  color: "#66ea58",
}));
