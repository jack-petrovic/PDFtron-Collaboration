import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Modal, Typography } from "@mui/material";
import TextCompare from "../../TextCompare";

const DocumentCompareModal = ({ open, close, file1, file2 }) => {
  return (
    <Modal open={open} onClose={close}>
      <Box
        width="100%"
        height="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Box
          width="80%"
          height="90%"
          sx={{
            padding: "1rem",
            background: "white",
            borderRadius: "1rem",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            paddingBottom="0.5rem"
            paddingRight="0.5rem"
          >
            <Typography color="primary" fontSize="1.5rem">
              {getLocaleString("modal_compare_documents")}
            </Typography>
            <CloseIcon sx={{ cursor: "pointer" }} onClick={close} />
          </Box>
          <Box height="95%">
            <TextCompare file1={file1} file2={file2} />
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default DocumentCompareModal;
