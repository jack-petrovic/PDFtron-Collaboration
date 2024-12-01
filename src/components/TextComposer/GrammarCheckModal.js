import React, { Fragment, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Modal, Button, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LoadingButton from "@mui/lab/LoadingButton";
import { ModalContainer, CloseButtonBox } from "./styles";
import { ToastService } from "../../services";
import { grammarCheck } from "../../services/text-compare.service";

const GrammarCheckModal = ({
  setConfirmDialogData,
  quillRef,
  isLoading,
  setIsLoading,
  lang,
  textValue,
}) => {
  const { t } = useTranslation();
  const [grammarData, setGrammarData] = useState(null);
  const getLocaleString = (key) => t(key);

  const onClickCheckGrammar = async () => {
    const text = quillRef.current.getEditor().getText();
    const selectedRange = quillRef.current.editor.getSelection();

    if (!selectedRange?.length) {
      setConfirmDialogData({
        content: getLocaleString("common_confirm_entire_text"),
        handler: () => handleCheckGrammar(text),
      });
    } else {
      const selectedText = text.slice(
        selectedRange.index,
        selectedRange.index + selectedRange.length,
      );
      handleCheckGrammar(selectedText);
    }
  };

  const handleCheckGrammar = async (selectedText) => {
    setConfirmDialogData(null);
    setIsLoading(true);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => {
        reject(new Error(getLocaleString("common_timeout_error")));
      }, 60000),
    );
    Promise.race([grammarCheck(lang, selectedText), timeoutPromise])
      .then((res) => {
        setGrammarData({
          text: selectedText,
          grammar: res.data,
        });
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

  const handleClose = () => {
    setGrammarData(null);
  };

  const textParts = useMemo(() => {
    if (!grammarData) return [];

    const parts = [];
    let lastIndex = 0;
    grammarData.grammar.matches.forEach((match) => {
      parts.push({
        text: grammarData.text.slice(lastIndex, match.offset),
      });
      parts.push({
        text: grammarData.text.slice(match.offset, match.offset + match.length),
        message: match.message,
      });
      lastIndex = match.offset + match.length;
    });
    parts.push({
      text: grammarData.text.slice(lastIndex),
    });
    return parts;
  }, [grammarData]);

  return (
    <React.Fragment>
      <LoadingButton
        size="small"
        variant="contained"
        loading={isLoading}
        disabled={!textValue}
        onClick={onClickCheckGrammar}
      >
        {getLocaleString("text_composer_grammar_check")}
      </LoadingButton>
      <Modal open={!!grammarData} onClose={handleClose}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <ModalContainer className="grammar-check-dialog">
            <h1 className="title">
              {getLocaleString("text_composer_grammar_check")}
            </h1>
            <CloseButtonBox>
              <CloseIcon onClick={handleClose} />
            </CloseButtonBox>

            <Box>
              {textParts.map((part, index) => (
                <Fragment key={`part-${index}`}>
                  {part.message ? (
                    <Tooltip title={part.message} placement="top-start">
                      <span className="highlight">{part.text}</span>
                    </Tooltip>
                  ) : (
                    <span>{part.text}</span>
                  )}
                </Fragment>
              ))}
            </Box>

            <Box className="actions">
              <Button
                size="small"
                variant="contained"
                color="inherit"
                onClick={handleClose}
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

export default GrammarCheckModal;
