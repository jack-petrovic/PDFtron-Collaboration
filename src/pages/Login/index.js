import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLoginAction, useAuthState } from "../../hooks/redux";
import Button from "@mui/material/Button";
import { Box, Stack, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ToastService } from "../../services";
import { ErrorText, FormWrapper, FromContainer } from "./style.js";

const validationSchema = Yup.object().shape({
  emailOrUserId: Yup.string().required("login_email_user_required"),
  password: Yup.string().required("login_password_required"),
});

function Login() {
  const login = useLoginAction();
  const authState = useAuthState();
  const { t } = useTranslation();

  const getLocaleString = (key) => t(key);
  const error = useMemo(() => {
    return authState.error;
  }, [authState]);

  const handleSubmit = async (values) => {
    try {
      await login(values);
      ToastService.success(getLocaleString("toast_login_success"));
    } catch (err) {
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    }
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
      <FromContainer>
        <form onSubmit={form.handleSubmit}>
          <Box sx={{ marginBottom: "1rem" }}>
            <Typography variant="h5">
              {getLocaleString("common_welcome")}!
            </Typography>
            <Typography variant="body1">
              {getLocaleString("login_register_join_description")}
            </Typography>
            {error && <ErrorText>{error}</ErrorText>}
          </Box>

          <TextField
            fullWidth
            label={getLocaleString("login_email_label")}
            placeholder={getLocaleString("login_email_placeholder")}
            {...form.getFieldProps("emailOrUserId")}
            helperText={getLocaleString(
              form.errors.emailOrUserId && form.touched.emailOrUserId
                ? form.errors.emailOrUserId
                : "",
            )}
            error={Boolean(
              form.errors.emailOrUserId &&
                (form.touched.emailOrUserId ? form.errors.emailOrUserId : ""),
            )}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            type="password"
            label={getLocaleString("login_password_label")}
            placeholder={getLocaleString("login_password_placeholder")}
            {...form.getFieldProps("password")}
            helperText={getLocaleString(
              form.errors.password && form.touched.password
                ? form.errors.password
                : "",
            )}
            error={Boolean(
              form.errors.password && form.touched.password
                ? form.errors.password
                : "",
            )}
            sx={{ mb: 3 }}
          />

          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <Button
              variant="contained"
              type="submit"
              fullWidth
              sx={{ textTransform: "capitalize" }}
            >
              {getLocaleString("login_button_text")}
            </Button>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mt={2}
          >
            <Typography>
              {getLocaleString("login_register_question")}
            </Typography>
            <Link to="/register" style={{ color: "#589fef" }}>
              {getLocaleString("login_go_to_register")}
            </Link>
          </Stack>
        </form>
      </FromContainer>
    </FormWrapper>
  );
}

export default Login;
