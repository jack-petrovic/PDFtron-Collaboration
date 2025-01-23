import React from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import { useTranslation } from "react-i18next";
import { spellCheck } from "../../services/text-compare.service";
import { ToastService } from "../../services";

const Preview = ({
  isLoading,
  setIsLoading,
  textValue,
  setConfirmDialogData,
  quillRef,
  lang,
}) => {
  const { t } = useTranslation();
  const getLocaleString = (key) => t(key);

  const togglePreviewModal = () => {
    const selectedRange = quillRef.current.editor.getSelection();
    const text = quillRef.current.editor.getText();

    if (!selectedRange?.length) {
      setConfirmDialogData({
        content: getLocaleString("common_confirm_entire_text"),
        handler: () => handleSpellCheck(text, 0),
      });
    } else {
      const startIndex = selectedRange.index;
      const selectedText = text.slice(
        selectedRange.index,
        selectedRange.index + selectedRange.length,
      );
      handleSpellCheck(selectedText, startIndex);
    }
  };

  const handleSpellCheck = (selectedText, startIndex) => {
    setConfirmDialogData(null);
    setIsLoading(true);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => {
        reject(new Error(getLocaleString("common_timeout_error")));
      }, 60000),
    );
    Promise.race([spellCheck(selectedText, lang), timeoutPromise])
      .then((res) => {
        let wordCount = {};
        res.data.forEach((item) => {
          wordCount[item.checked_word] = wordCount[item.checked_word]
            ? wordCount[item.checked_word] + 1
            : 1;
          const regex = new RegExp("\\b" + item.checked_word + "\\b", "g");
          let match;
          let indices = [];
          while ((match = regex.exec(selectedText)) !== null) {
            indices.push(match.index);
          }
          quillRef.current.editor.formatText(
            startIndex + indices[wordCount[item.checked_word] - 1],
            item.checked_word.length,
            "background-color",
            "#ffeb3b",
          );
        });
        quillRef.current.editor.setSelection();
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
    <LoadingButton
      size="small"
      variant="contained"
      loading={isLoading}
      disabled={!textValue}
      onClick={togglePreviewModal}
      sx={{ mb: 1, mx: 0.5 }}
    >
      {getLocaleString("text_composer_spell_check")}
    </LoadingButton>
  );
};

export default Preview;
