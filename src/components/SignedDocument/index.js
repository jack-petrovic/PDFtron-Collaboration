import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import { SignedDocumentWrapper } from "./style";

function SignedDocument({ data, index, onClick }) {
  const { t } = useTranslation();
  const getLocaleString = (key) => t(key);

  return (
    <SignedDocumentWrapper index={index} onClick={onClick}>
      <img
        src="/assets/img/file-pdf.svg"
        alt="icon-pdf"
        className="w-[70px] pr-2"
      />
      <Box flexGrow={1}>
        <Typography sx={{ fontWeight: "bold" }}>{data.fileName}</Typography>
        <Typography
          sx={{
            color: "#868e96",
            fontSize: "10px",
          }}
        >
          {data.createdTime}
        </Typography>
        <Typography variant="h6">
          {getLocaleString("common_author")}: {getLocaleString(data.username)}
        </Typography>
      </Box>
    </SignedDocumentWrapper>
  );
}

export default SignedDocument;
