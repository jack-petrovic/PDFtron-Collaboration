import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";
import {
  FormWrapper,
  FormContainer,
  MenuActionItem,
  MenuContainer,
} from "./style";

const MenuAction = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const getLocaleString = (key) => t(key);

  const menuItems = [
    {
      key: "menu_action_pdf_compare",
      path: "/main-pdf-comparison",
    },
    {
      key: "menu_action_text_compare",
      path: "/main-text-comparison",
    },
    {
      key: "menu_action_image_compare",
      path: "/main-image-comparison",
    },
  ];

  return (
    <FormWrapper>
      <FormContainer>
        <MenuContainer>
          <Typography variant="h5">
            {getLocaleString("common_welcome")}!
          </Typography>
          <Typography>
            {getLocaleString("menu_action_choose_feature")}
          </Typography>
        </MenuContainer>
        {menuItems.map(({ key, path }) => (
          <MenuActionItem
            key={key}
            onClick={() => navigate(path)}
            role="button"
          >
            {getLocaleString(key)}
          </MenuActionItem>
        ))}
      </FormContainer>
    </FormWrapper>
  );
};

export default MenuAction;
