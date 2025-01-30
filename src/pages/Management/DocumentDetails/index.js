import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import LiveCollaboration from "../../../components/LiveCollaboration";
import TextCompare from "../../../components/TextCompare";
import ImageCompare from "../../../components/ImageCompare";
import { getDocument } from "../../../services";
import {
  GoStatusButton,
  TextCompareButton,
  ImageCompareButton,
  SingleButton,
} from "./style";

const Document = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { documentId } = useParams();
  const [file, setFile] = useState(null);
  const [prevStageFile, setPrevStageFile] = useState(null);
  const [mode, setMode] = useState("textCompare");
  const getLocaleString = (key) => t(key);

  useEffect(() => {
    getDocument(documentId)
      .then((res) => {
        setFile(res.doc);
        setPrevStageFile(res.prevDoc);
      })
      .catch((err) => {
        console.log("err=>", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  const handleGoBack = () => {
    const pathArr = location.pathname.split("/");
    navigate(`${pathArr.slice(0, pathArr.length - 1).join("/")}`);
  };

  return (
    <React.Fragment>
      {file && (
        <React.Fragment>
          {!prevStageFile ? (
            <LiveCollaboration file={file} />
          ) : (
            <React.Fragment>
              <Box display="flex" justifyContent="end" px={1} gap={1} py={1}>
                <GoStatusButton mode={mode} onClick={handleGoBack}>
                  {getLocaleString("common_return_button")}
                </GoStatusButton>
                <SingleButton
                  mode={mode}
                  onClick={() => setMode("singleTextCompare")}
                >
                  {getLocaleString("common_single_button")}
                </SingleButton>
                <TextCompareButton
                  mode={mode}
                  onClick={() => setMode("textCompare")}
                >
                  {getLocaleString("common_text_compare_button")}
                </TextCompareButton>
                <ImageCompareButton
                  mode={mode}
                  onClick={() => setMode("imageCompare")}
                >
                  {getLocaleString("common_image_compare_button")}
                </ImageCompareButton>
              </Box>
              {mode === "textCompare" && (
                <TextCompare file1={prevStageFile} file2={file} />
              )}
              {mode === "singleTextCompare" && (
                <LiveCollaboration file={file} />
              )}
              {mode === "imageCompare" && (
                <ImageCompare
                  file1={prevStageFile}
                  file2={file}
                  isRandomMode={false}
                />
              )}
            </React.Fragment>
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default Document;
