import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import SaveIcon from "@mui/icons-material/Save";
import { Box, TextField, Typography } from "@mui/material";
import WebViewer from "@pdftron/webviewer";
import axios from "axios";
import SignedDocument from "../SignedDocument";
import {
  DigitalSignatureSidebar,
  FileSaveButton,
  FileUploadButton,
  GetDocumentComponent,
} from "./style";

function DigitalSignature(props) {
  const { t } = useTranslation();
  const { language } = i18next;
  let userName = props.userName;
  const viewerCompare = useRef(null);
  const [instance, setInstance] = useState(null);
  const [documentViewer, setDocumentViewer] = useState(null);
  const [annotationManager, setAnnotationManager] = useState(null);
  const [signedDocuments, setSignedDocuments] = useState([]);
  const [fileDocument, setFileDocument] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState("es");
  const getLocaleString = (key) => t(key);

  useEffect(() => {
    setCurrentLanguage(language);
  }, [language]);

  function base64ToBlob(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; ++i) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: "application/pdf" });
  }

  // API get all signed documents
  const getSignedDocuments = () => {
    axios
      .get("http://localhost:3333/api/documents")
      .then((res) => {
        setSignedDocuments(res.data ? res.data : []);
        // instance.UI.loadDocument(res.data[0]['fileContent'])
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // API create new signed document
  const createSignedDocument = (formData) => {
    axios
      .post("http://localhost:3333/api/documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        // get list signed documents
        getSignedDocuments();
      });
  };

  const viewSignedDocument = (fileContent, fileName) => {
    setFileDocument(null);
    instance.UI.loadDocument(base64ToBlob(fileContent), {
      filename: fileName,
    });
    annotationManager.enableReadOnlyMode();
  };

  const getDocumentComponent = () => {
    let a = [];
    signedDocuments.forEach((document, index) => {
      a.push(
        <SignedDocument
          key={"document_" + document.documentId}
          data={document}
          index={index}
          onClick={() => {
            viewSignedDocument(document?.fileContent, document?.fileName);
          }}
        ></SignedDocument>,
      );
    });
    return a;
  };

  const changeFileHandler = async (event) => {
    setFileDocument(event.target.files[0]);
    instance.UI.loadDocument(event.target.files[0], {
      filename: event.target.files[0].name,
    });
    event.target.value = null;
    annotationManager.disableReadOnlyMode();
  };

  const saveSignature = async () => {
    if (!fileDocument) {
      alert(getLocaleString("digital_signature_save_alert"));
      return;
    }
    const doc = documentViewer.getDocument();
    const xfdfString = await annotationManager.exportAnnotations();
    const data = await doc.getFileData({
      xfdfString,
    });
    const arr = new Uint8Array(data);
    const blob = new Blob([arr], { type: "application/pdf" });

    let formData = new FormData();
    formData.append("username", userName ? userName : "unknown");
    formData.append(
      "fileName",
      fileDocument.name ? fileDocument.name : "signed_document",
    );
    formData.append("fileContent", blob);
    createSignedDocument(formData);
    // switch to view mode
    instance.UI.loadDocument(blob, { filename: fileDocument.name });
    setFileDocument(null);
    annotationManager.enableReadOnlyMode();
  };

  useEffect(() => {
    if (instance) {
      instance.UI.setLanguage(language);
    }
  }, [instance, language]);

  useEffect(() => {
    getSignedDocuments();
    WebViewer(
      {
        path: "/webviewer/lib",
        fullAPI: true,
      },
      viewerCompare.current,
    ).then((instance) => {
      const { UI, Core } = instance;
      const { documentViewer, annotationManager } = Core;
      const Feature = UI.Feature;
      setInstance(instance);
      setDocumentViewer(documentViewer);
      setAnnotationManager(annotationManager);
      instance.UI.enableFeatures([Feature.FilePicker]);
    });
  }, []);

  return (
    <Box display="flex" height="100%">
      <DigitalSignatureSidebar>
        <Box display="flex" alignItems="center" sx={{ height: "36px" }}>
          <TextField
            type="file"
            id="file_upload"
            accept="application/pdf"
            onChange={changeFileHandler}
            sx={{ display: "none" }}
          />
          <FileUploadButton
            variant="outlined"
            startIcon={<FolderOpenIcon sx={{ color: "#1a4971" }} />}
            onClick={() => document.getElementById("file_upload").click()}
          >
            {getLocaleString("digital_signature_open_file")}
          </FileUploadButton>
          <FileSaveButton
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => saveSignature()}
          >
            {getLocaleString("digital_signature_save")}
          </FileSaveButton>
        </Box>
        <Box>
          <Box
            display="flex"
            alignItems="center"
            px={1.5}
            py={2}
            textAlign="left"
          >
            <Typography sx={{ fontWeight: "bold" }}>
              {getLocaleString("sidebar_signed_documents")}
            </Typography>
            <Typography variant="body1">{signedDocuments.length}</Typography>
          </Box>
          <Box display="flex" flexDirection="column">
            {signedDocuments.length === 0 ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
              >
                <img
                  src="/assets/img/empty.svg"
                  alt="icon-empty"
                  className="h-[83px] p-2"
                />
                <Typography variant="body1" sx={{ fontSize: "13px" }}>
                  {getLocaleString("digital_signature_no_signed_documents")}
                </Typography>
              </Box>
            ) : (
              <GetDocumentComponent>
                {getDocumentComponent()}
              </GetDocumentComponent>
            )}
          </Box>
        </Box>
      </DigitalSignatureSidebar>
      <Box flexGrow={1} ref={viewerCompare} />
    </Box>
  );
}

export default DigitalSignature;
