import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthState } from "../../hooks/redux";
import { Box, Stack, Typography } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ToastService } from "../../services";
import { ErrorText, FormWrapper, FormContainer } from "./style.js";
import { FormTextField } from "../style";
import { SubmitButton } from "../../components/Modal/style";
import { AuthService } from "../../services"

const validationSchema = Yup.object().shape({
  emailOrUserId: Yup.string().required("login_email_user_required"),
  password: Yup.string()
    .required("login_password_required")
    .required("register_password_required")
    .matches(/^[a-zA-Z0-9]+$/, "register_password_allowed_combination"),
});

const Login = () => {
  const authState = useAuthState();
  const { t } = useTranslation();

  const error = useMemo(() => {
    return authState.error;
  }, [authState]);

  const handleSubmit = async (values) => {
    await AuthService.login(values);
    ToastService.success(t("toast_login_success"));
  };

  const form = useFormik({
    validationSchema,
    initialValues: {
      emailOrUserId: "",
      password: "",
    },
    onSubmit: handleSubmit,
  });

  return (
    <FormWrapper>
      <FormContainer>
        <form onSubmit={form.handleSubmit}>
          <Box sx={{ marginBottom: "1rem" }}>
            <Typography variant="h5">
              {t("common_welcome")}!
            </Typography>
            <Typography variant="body1">
              {t("login_register_join_description")}
            </Typography>
            {error && <ErrorText>{error}</ErrorText>}
          </Box>

          <FormTextField
            fullWidth
            label={t("login_email_label")}
            placeholder={t("login_email_placeholder")}
            {...form.getFieldProps("emailOrUserId")}
            helperText={
              form.touched.emailOrUserId && form.errors.emailOrUserId
                ? t(form.errors.emailOrUserId)
                : ""
            }
            error={Boolean(
              form.touched.emailOrUserId && form.errors.emailOrUserId,
            )}
          />

          <FormTextField
            fullWidth
            type="password"
            label={t("login_password_label")}
            placeholder={t("login_password_placeholder")}
            {...form.getFieldProps("password")}
            helperText={
              form.touched.password && form.errors.password
                ? t(form.errors.password)
                : ""
            }
            error={Boolean(form.touched.password && form.errors.password)}
          />

          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <SubmitButton variant="contained" type="submit" fullWidth>
              {t("login_button_text")}
            </SubmitButton>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mt={2}
          >
            <Typography>
              {t("login_register_question")}
            </Typography>
            <Link to="/register" style={{ color: "#589fef" }}>
              {t("login_go_to_register")}
            </Link>
          </Stack>
        </form>
      </FormContainer>
    </FormWrapper>
  );
};

export default Login;
