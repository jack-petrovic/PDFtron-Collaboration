import React from "react";
import { Box } from "@mui/material";

const ImageDiffDialog = ({ src }) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        padding: "2rem",
      }}
    >
      <img
        src={src}
        alt="Result"
        width="100%"
      />
    </Box>
  );
};

export default ImageDiffDialog;
