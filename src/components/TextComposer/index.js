import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import { useTranslation } from "react-i18next";
import { Box, Stack, Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import SummaryModal from "./SummaryModal";
import {
  predictText,
  getWordSuggestion,
} from "../../services/text-compare.service";
import { TextComposerContainer, AntSwitch } from "./styles";
import { detectLanguage } from "../../services/text-compare.service";
import useDebounce from "../../hooks/useDebounce";
import { getProhibitedWords, ToastService } from "../../services";
import ConfirmModal from "../Modal/ConfirmModal";
import { getCurrentWord, getWordsWithPositions } from "./helper";
import SuggestionDropdown from "./SuggestionDropdown";
import SentimentModal from "./SentimentModal";
import GrammarCheckModal from "./GrammarCheckModal";
import Preview from "./Preview";

const TextComposer = ({
  value,
  onChange,
  spellCheck,
  text,
  onChangeText,
  disable,
  setDisabled,
}) => {
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [dropdownStyles, setDropdownStyles] = useState({});
  const [isPredict, setIsPredict] = useState(false);
  const [wordSuggestion, setWordSuggestion] = useState(false);
  const canSuggestRef = useRef(true);
  const quillRef = useRef(null);
  const containerRef = useRef(null);
  const dropdownItemIndexRef = useRef(0);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isLoadingProhibitedWords, setIsLoadingProhibitedWords] =
    useState(false);
  const [isLoadingGrammarCheck, setIsLoadingGrammarCheck] = useState(false);
  const [isLoadingSentiment, setIsLoadingSentiment] = useState(false);
  const [confirmDialogData, setConfirmDialogData] = useState(null);
  const debouncedText = useDebounce(text.trim());
  const displayNames = new Intl.DisplayNames(["en", "en-US"], {
    type: "language",
  });
  const [languages, setLanguages] = useState(["en", "fr"]);
  const [lang, setLang] = useState("en");
  const [loadingPredict, setLoadingPredict] = useState(false);
  const [prohibitedWords, setProhibitedWords] = useState([]);
  const [textValue, setTextValue] = useState("");
  const getLocaleString = (key) => t(key);

  useEffect(() => {
    setTextValue(
      quillRef.current?.getEditor().getText().replaceAll("/n", "").trim(),
    );
    detectLanguage(quillRef.current.getEditor().getText().replaceAll("\n", " "))
      .then((res) => {
        const detectedLang = res.data?.lang_code || "en";
        if (!languages.includes(detectedLang)) {
          setLanguages([...languages, detectedLang]);
        }
        setLang(detectedLang);
      })
      .catch((err) => {
        console.log("err=>", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedText]);

  const handleChange = () => {
    setSuggestions([]);
    setPredictions([]);
    const editor = quillRef.current.getEditor();
    if ((wordSuggestion || isPredict) && canSuggestRef.current) {
      const range = editor.getSelection();
      if (range) {
        const bounds = editor.getBounds(range.index);
        if (bounds) {
          setDropdownStyles(bounds);
        }
      }
      if (wordSuggestion) {
        const currentWord = getCurrentWord(editor);
        if (
          currentWord?.length > 1 &&
          /^[a-zA-Z]$/.test(currentWord[currentWord.length - 1])
        ) {
          getWordSuggestion(currentWord)
            .then((res) => {
              setSuggestions(res.data.suggestion_list);
            })
            .catch((err) => {
              console.log("err=>", err);
            });
        } else {
          setSuggestions([]);
        }
      } else {
        if (!loadingPredict) {
          setLoadingPredict(true);
          predictText(lang, editor.getText().replaceAll("\n", " "))
            .then((res) => {
              setPredictions(res.data?.slice(0, 20));
            })
            .finally(() => {
              setLoadingPredict(false);
            });
        }
      }
    }
    canSuggestRef.current = true;
  };

  useEffect(() => {
    handleChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const handleSuggestionSelect = (suggestion) => {
    const range = quillRef.current.editor.selection.savedRange;
    let currentWord = "";
    if (range) {
      let startPos = range.index - 1;
      while (
        startPos >= 0 &&
        /\S/.test(quillRef.current.getEditor().getText(startPos, 1))
      ) {
        startPos--;
      }
      startPos++;
      let endPos = range.index;
      while (
        endPos < quillRef.current.getEditor().getLength() &&
        /\S/.test(quillRef.current.getEditor().getText(endPos, 1))
      ) {
        endPos++;
      }
      currentWord = quillRef.current
        .getEditor()
        .getText(startPos, endPos - startPos);
    }
    canSuggestRef.current = false;
    quillRef.current
      .getEditor()
      .deleteText(range?.index - currentWord.length, currentWord.length);
    canSuggestRef.current = false;
    quillRef.current
      .getEditor()
      .insertText(range?.index - currentWord.length, suggestion);
    quillRef.current.focus();
    setSuggestions([]);
  };

  const handlePredictionSelect = (prediction) => {
    canSuggestRef.current = false;
    quillRef.current.getEditor().setText(prediction);
    quillRef.current.focus();
    setPredictions([]);
  };

  const handleClickOutSideOfMenu = useCallback(
    (e) => {
      const path = e.path || (e.composedPath && e.composedPath());
      if (path && !path.includes(containerRef.current)) {
        setSuggestions([]);
      }
    },
    [containerRef],
  );

  useEffect(() => {
    window.addEventListener("click", handleClickOutSideOfMenu);
    return () => {
      window.removeEventListener("click", handleClickOutSideOfMenu);
    };
  }, [handleClickOutSideOfMenu]);

  useEffect(() => {
    onChangeText(quillRef.current.getEditor().getText());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const toggleSuggestion = (e) => {
    setWordSuggestion(e.target.checked);
    setIsPredict(false);
  };

  const togglePredict = (e) => {
    setIsPredict(e.target.checked);
    setWordSuggestion(false);
  };

  const onClickCheckProhibitedWords = async () => {
    const text = quillRef.current.getEditor().getText();
    const selectedRange = quillRef.current.editor.getSelection();

    if (!selectedRange?.length) {
      setConfirmDialogData({
        content: getLocaleString("common_confirm_entire_text"),
        handler: () => handleCheckProhibitedWords(text, 0),
      });
    } else {
      const startIndex = selectedRange.index;
      const selectedText = text.slice(
        selectedRange.index,
        selectedRange.index + selectedRange.length,
      );
      await handleCheckProhibitedWords(selectedText, startIndex);
    }
  };

  const handleCheckProhibitedWords = async (selectedText, startIndex) => {
    setConfirmDialogData(null);
    setIsLoadingProhibitedWords(true);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => {
        reject(new Error(getLocaleString("common_timeout_error")));
      }, 60000),
    );
    Promise.race([getWordsWithPositions(selectedText), timeoutPromise])
      .then((wordsWithPositions) => {
        prohibitedWords.forEach((word) => {
          if (wordsWithPositions.has(word.name)) {
            wordsWithPositions.get(word.name).forEach((start) => {
              quillRef.current.editor.formatText(
                startIndex + start,
                word.name.length,
                "background-color",
                "red",
              );
            });
          }
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
        setIsLoadingProhibitedWords(false);
      });
  };

  useEffect(() => {
    getProhibitedWords()
      .then((res) => {
        setProhibitedWords(res.rows);
      })
      .catch((err) => {
        console.log("err=>", err);
      });
  }, []);

  useEffect(() => {
    if (setDisabled) {
      setDisabled(
        isLoadingPreview ||
          isLoadingSummary ||
          isLoadingProhibitedWords ||
          isLoadingSentiment ||
          isLoadingGrammarCheck,
      );
    }
  }, [
    setDisabled,
    isLoadingPreview,
    isLoadingSummary,
    isLoadingProhibitedWords,
    isLoadingSentiment,
    isLoadingGrammarCheck,
  ]);

  const onKeyDownCapture = (e) => {
    if (e.keyCode === 13 || e.keyCode === 27) {
      if (
        (wordSuggestion && !!suggestions.length) ||
        (isPredict && !!predictions.length)
      ) {
        e.preventDefault();
        e.stopPropagation();
        if (e.keyCode === 13) {
          if (suggestions[dropdownItemIndexRef.current]) {
            handleSuggestionSelect(suggestions[dropdownItemIndexRef.current]);
          }
          if (predictions[dropdownItemIndexRef.current]) {
            handlePredictionSelect(predictions[dropdownItemIndexRef.current]);
          }
        } else {
          setSuggestions([]);
          setPredictions([]);
        }
      }
    }
  };

  return (
    <TextComposerContainer>
      <Box className="actions">
        <Box className="flex items-center">
          <p className="mr-2">
            <span className="font-bold">Language:</span> {displayNames.of(lang)}
          </p>
        </Box>
        <Box className="sm:flex gap-2">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography>{getLocaleString("text_composer_predict")}</Typography>
            <AntSwitch
              checked={isPredict}
              onChange={togglePredict}
              inputProps={{ "aria-label": "ant design" }}
            />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography>Suggestion</Typography>
            <AntSwitch
              checked={wordSuggestion}
              onChange={toggleSuggestion}
              inputProps={{ "aria-label": "ant design" }}
            />
          </Stack>
        </Box>
      </Box>
      <Box className="md:flex md:justify-start gap-2 pb-3">
        <SummaryModal
          setConfirmDialogData={setConfirmDialogData}
          quillRef={quillRef}
          isLoading={isLoadingSummary}
          setIsLoading={setIsLoadingSummary}
          lang={lang}
          textValue={textValue}
        />
        {spellCheck && (
          <Preview
            setConfirmDialogData={setConfirmDialogData}
            quillRef={quillRef}
            isLoading={isLoadingPreview}
            setIsLoading={setIsLoadingPreview}
            lang={lang}
            textValue={textValue}
          />
        )}
        <LoadingButton
          size="small"
          variant="contained"
          loading={isLoadingProhibitedWords}
          disabled={!textValue}
          onClick={onClickCheckProhibitedWords}
          sx={{ mb: 1, mx: 0.5 }}
        >
          {getLocaleString("text_composer_prohibited_word")}
        </LoadingButton>
        <GrammarCheckModal
          setConfirmDialogData={setConfirmDialogData}
          quillRef={quillRef}
          isLoading={isLoadingGrammarCheck}
          setIsLoading={setIsLoadingGrammarCheck}
          lang={lang}
          textValue={textValue}
        />
        <SentimentModal
          setConfirmDialogData={setConfirmDialogData}
          quillRef={quillRef}
          isLoading={isLoadingSentiment}
          setIsLoading={setIsLoadingSentiment}
          textValue={textValue}
        />
      </Box>

      <div
        className="quill-container"
        onKeyDownCapture={onKeyDownCapture}
        ref={containerRef}
      >
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          readOnly={disable}
        />
        {((wordSuggestion && !!suggestions.length) ||
          (isPredict && !!predictions.length)) && (
          <SuggestionDropdown
            wordSuggestion={wordSuggestion}
            isPredict={isPredict}
            suggestions={suggestions}
            predictions={predictions}
            handleSuggestionSelect={handleSuggestionSelect}
            handlePredictionSelect={handlePredictionSelect}
            dropdownStyles={dropdownStyles}
            dropdownItemIndexRef={dropdownItemIndexRef}
          />
        )}
      </div>
      <ConfirmModal
        open={!!confirmDialogData}
        content={confirmDialogData?.content}
        close={() => setConfirmDialogData(null)}
        handleClick={confirmDialogData?.handler}
        handleClickCancel={() => setConfirmDialogData(null)}
      />
    </TextComposerContainer>
  );
};

export default TextComposer;
