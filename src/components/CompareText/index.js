import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Diff from "text-diff";
import { Box, FormControlLabel, RadioGroup, Radio } from "@mui/material";

const CompareText = ({ text1, text2 }) => {
  const { t } = useTranslation();
  const [view, setView] = useState("unified");
  const getLocaleString = (key) => t(key);
  const handleChangeView = (e) => {
    setView(e.target.value);
  };

  const { diffOutput, diffOutput1, diffOutput2 } = useMemo(() => {
    const diff = new Diff();
    diff.Timeout = 1;
    const textDiff1 = diff.main(text1, text2, 0);
    const textDiff2 = diff.main(text2, text1, 0);

    return {
      diffOutput: diff.prettyHtml(textDiff1),
      diffOutput1: diff.prettyHtml(textDiff1),
      diffOutput2: diff.prettyHtml(textDiff2),
    };
  }, [text1, text2]);

  return (
    <Box py={2}>
      <Box display="flex">
        <RadioGroup
          value={view}
          onChange={handleChangeView}
          display="flex"
          sx={{ flexDirection: "row" }}
        >
          <FormControlLabel
            value="split"
            control={<Radio />}
            label={getLocaleString("compare_text_split_view")}
          />
          <FormControlLabel
            value="unified"
            control={<Radio />}
            label={getLocaleString("compare_text_unified_view")}
          />
        </RadioGroup>
      </Box>

      {view === "split" ? (
        <Box display="flex">
          <Box
            flex={1}
            pr={2}
            py={2}
            dangerouslySetInnerHTML={{ __html: diffOutput2 }}
          />
          <Box
            flex={1}
            pl={4}
            py={2}
            dangerouslySetInnerHTML={{ __html: diffOutput1 }}
          />
        </Box>
      ) : (
        <Box px={1} py={2} dangerouslySetInnerHTML={{ __html: diffOutput }} />
      )}
    </Box>
  );
};

export default CompareText;
