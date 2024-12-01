import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { FormWrapper, FromContainer, MenuActionItem } from "./style";

function MenuAction() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const getLocaleString = (key) => t(key);

  const menuItems = [
    {
      key: "menu_action_live_collaboration",
      path: "/result",
    },
    {
      key: "menu_action_comparison",
      path: "/compare",
    },
    {
      key: "menu_action_digital_signature",
      path: "/signature",
    },
    {
      key: "menu_action_text_compare",
      path: "/text-compare",
    },
  ];

  return (
    <FormWrapper>
      <FromContainer>
        <Box sx={{ marginBottom: "1rem" }}>
          <Typography variant="h5">
            {getLocaleString("common_welcome")}!
          </Typography>
          <Typography>
            {getLocaleString("menu_action_choose_feature")}
          </Typography>
        </Box>
        {menuItems.map(({ key, path }) => (
          <MenuActionItem
            key={key}
            onClick={() => navigate(path)}
            role="button"
          >
            {getLocaleString(key)}
          </MenuActionItem>
        ))}
      </FromContainer>
    </FormWrapper>
  );
}

export default MenuAction;
