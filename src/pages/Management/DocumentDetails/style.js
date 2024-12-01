import styled from "@emotion/styled";
import { Button } from "@mui/material";

export const TextCompareButton = styled(Button)(({ mode }) => ({
  padding: "0 0.5rem",
  border: mode === "textCompare" ? "1px solid #589fef" : "1px solid gray",
  borderRadius: "0.5rem",
  color: mode === "textCompare" ? "#589fef" : "gray",
  textTransform: "capitalize",
}));

export const ImageCompareButton = styled(Button)(({ mode }) => ({
  padding: "0 0.5rem",
  border: mode === "imageCompare" ? "1px solid #589fef" : "1px solid gray",
  borderRadius: "0.5rem",
  color: mode === "imageCompare" ? "#589fef" : "gray",
  textTransform: "capitalize",
}));

export const SingleButton = styled(Button)(({ mode }) => ({
  padding: "0 0.5rem",
  border: mode === "singleTextCompare" ? "1px solid #589fef" : "1px solid gray",
  borderRadius: "0.5rem",
  color: mode === "singleTextCompare" ? "#589fef" : "gray",
  textTransform: "capitalize",
}));

export const GoStatusButton = styled(Button)(({ mode }) => ({
  padding: "0 0.5rem",
  border: "1px solid gray",
  borderRadius: "0.5rem",
  color: "gray",
  textTransform: "capitalize",
}));
