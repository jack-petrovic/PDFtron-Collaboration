import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";

const TextDiffDialog = ({ total, inserted, deleted, edited }) => {
  const { t } = useTranslation();
  const getLocaleString = (key) => t(key);

  return (
    <Box>
      <Typography>
        {getLocaleString("comparison_modal_total")}: {total}
      </Typography>
      <Box display="flex" flexDirection="column" gap="5">
        <Typography>
          {getLocaleString("comparison_modal_insert")}: {inserted}
        </Typography>
        <Typography>
          {getLocaleString("comparison_modal_edit")}: {edited}
        </Typography>
        <Typography>
          {getLocaleString("comparison_modal_delete")}: {deleted}
        </Typography>
      </Box>
    </Box>
  );
};

export default TextDiffDialog;
