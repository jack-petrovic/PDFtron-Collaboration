import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Modal, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LoadingButton from "@mui/lab/LoadingButton";
import { ModalContainer, CloseButtonBox } from "./styles";
import { sentimentText } from "../../services/text-compare.service";
import { ToastService } from "../../services";

const SentimentModal = ({
  setConfirmDialogData,
  quillRef,
  isLoading,
  setIsLoading,
  textValue,
}) => {
  const { t } = useTranslation();
  const [maxField, setMaxField] = useState(0);
  const [maxValue, setMaxValue] = useState(0);
  const [sentiment, setSentiment] = useState(null);
  const getLocaleString = (key) => t(key);

  const onClickSentiment = () => {
    const selectedRange = quillRef.current.editor.getSelection();
    const text = quillRef.current.editor.getText();

    if (!selectedRange?.length) {
      setConfirmDialogData({
        content: getLocaleString("common_confirm_entire_text"),
        handler: () => handleSentiment(text),
      });
    } else {
      const selectedText = text.slice(
        selectedRange.index,
        selectedRange.index + selectedRange.length,
      );
      handleSentiment(selectedText);
    }
  };

  const handleSentiment = (text) => {
    setConfirmDialogData(null);
    setIsLoading(true);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => {
        reject(new Error(getLocaleString("common_timeout_error")));
      }, 60000),
    );
    Promise.race([sentimentText(text), timeoutPromise])
      .then((res) => {
        setSentiment(res.data);
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

  const labels = {
    neu: getLocaleString("sentiment_neutral"),
    pos: getLocaleString("sentiment_positive"),
    neg: getLocaleString("sentiment_negative"),
  };

  useEffect(() => {
    if (sentiment) {
      for (const key of ["neu", "pos", "neg"]) {
        const value = sentiment[key];
        if (value > maxValue) {
          setMaxField(key);
          setMaxValue(value);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentiment]);

  return (
    <React.Fragment>
      <LoadingButton
        size="small"
        variant="contained"
        loading={isLoading}
        disabled={!textValue}
        onClick={onClickSentiment}
        sx={{ mb: 1, mx: 0.5 }}
      >
        {getLocaleString("text_composer_sentiment")}
      </LoadingButton>
      <Modal open={!!sentiment} onClose={() => setSentiment(null)}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <ModalContainer className="sentiment-dialog">
            <h1 className="title">Sentiment</h1>
            <CloseButtonBox>
              <CloseIcon onClick={() => setSentiment(null)} />
            </CloseButtonBox>
            <Box>
              <span>
                {labels[maxField]}: {maxValue}
              </span>
            </Box>
            <Box className="actions">
              <Button
                size="small"
                variant="contained"
                color="inherit"
                onClick={() => setSentiment(null)}
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

export default SentimentModal;
