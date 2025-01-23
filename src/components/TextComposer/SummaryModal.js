import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Modal, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LoadingButton from "@mui/lab/LoadingButton";
import { ModalContainer, CloseButtonBox } from "./styles";
import { summaryText } from "../../services/text-compare.service";
import { ToastService } from "../../services";

const SummaryModal = ({
  isLoading,
  setIsLoading,
  textValue,
  setConfirmDialogData,
  quillRef,
  lang,
}) => {
  const { t } = useTranslation();
  const [summary, setSummary] = useState(null);
  const getLocaleString = (key) => t(key);

  const onClickSummary = () => {
    const selectedRange = quillRef.current.editor.getSelection();
    const text = quillRef.current.editor.getText();

    if (!selectedRange?.length) {
      setConfirmDialogData({
        content: getLocaleString("common_confirm_entire_text"),
        handler: () => handleSummary(text),
      });
    } else {
      const selectedText = text.slice(
        selectedRange.index,
        selectedRange.index + selectedRange.length,
      );
      handleSummary(selectedText);
    }
  };

  const handleSummary = (text) => {
    setConfirmDialogData(null);
    setIsLoading(true);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => {
        reject(new Error(getLocaleString("common_timeout_error")));
      }, 60000),
    );
    Promise.race([summaryText(lang, text), timeoutPromise])
      .then((res) => {
        setIsLoading(true);
        setSummary(res.data);
      })
      .catch((err) => {
        ToastService.error(
          getLocaleString(
            err.response?.data?.message || "common_network_error",
          ),
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <React.Fragment>
      <LoadingButton
        size="small"
        variant="contained"
        loading={isLoading}
        disabled={!textValue}
        onClick={onClickSummary}
        sx={{ mb: 1, mr: 0.5 }}
      >
        {getLocaleString("text_composer_summary")}
      </LoadingButton>
      <Modal open={!!summary} onClose={() => setSummary(null)}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <ModalContainer>
            <h1 className="title">Summary result</h1>
            <CloseButtonBox>
              <CloseIcon onClick={() => setSummary(null)} />
            </CloseButtonBox>
            <Box>
              <span>{summary}</span>
            </Box>
            <Box className="actions">
              <Button size="small" variant="contained" onClick={handleSummary}>
                {getLocaleString("common_take_it")}
              </Button>
              <Button
                size="small"
                variant="contained"
                color="inherit"
                onClick={() => setSummary(null)}
              >
                {getLocaleString("common_close")}
              </Button>
            </Box>
          </ModalContainer>
        </Box>
      </Modal>
    </React.Fragment>
  );
};

export default SummaryModal;
