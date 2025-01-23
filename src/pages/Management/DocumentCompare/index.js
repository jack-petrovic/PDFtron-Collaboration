import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, Button, Typography } from "@mui/material";
import TextCompare from "../../../components/TextCompare";
import { getDocument } from "../../../services";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

const DocumentComparePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);

  const { planId, documentId } = useParams();

  const getLocaleString = (key) => t(key);

  useEffect(() => {
    getDocument(documentId)
      .then((res) => {
        setFile1(res.prevDoc);
        setFile2(res.doc);
      })
      .catch((err) => {
        console.log("err=>", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, documentId]);

  const handleGoBack = () => {
    const pathArr = location.pathname.split("/");
    navigate(`${pathArr.slice(0, pathArr.length - 1).join("/")}`);
  };

  return (
    <Box height="100%">
      <Box
        display="flex"
        height="5%"
        justifyContent="space-between"
        alignItems="center"
        px="1rem"
      >
        <Typography fontSize="1.2rem" color="primary">
          {getLocaleString("document_compare_title")}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIosIcon />}
          color="secondary"
          onClick={handleGoBack}
        >
          {getLocaleString("common_go_back")}
        </Button>
      </Box>
      <Box height="95%">
        <TextCompare file1={file1} file2={file2} />
      </Box>
    </Box>
  );
};

export default DocumentComparePage;
