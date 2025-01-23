import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthState } from "../../hooks/redux";
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import Select from "@mui/material/Select";
import * as Yup from "yup";
import { useFormik } from "formik";
import { AuthService, ToastService } from "../../services";
import { ErrorText, FormWrapper, FormContainer, SuccessText } from "./style";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import moment from "moment";
import dayjs from "dayjs";
import { FormErrorText, FormTextField } from "../style";
import { SubmitButton } from "../../components/Modal/style";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("register_name_required"),
  email: Yup.string()
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Invalid email format'
    )
    .email("register_email_invalid")
    .required("register_email_required"),
  userId: Yup.string()
    .required("register_userId_required")
    .test("userId", "Invalid userId", (value) => {
      return /^[a-zA-Z0-9_]+$/.test(value);
    }),
  birthday: Yup.string()
    .required("register_birthday_required")
    .test("date", "Invalid date format", (value) => {
      const regex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])-(19|20)\d{2}$/;
      return regex.test(value);
    }),
  gender: Yup.bool().required("register_gender_required"),
  password: Yup.string()
    .required("register_password_required")
    .min(8, "register_password_min_length")
    .max(128, "register_password_max_length")
    .matches(/^[a-zA-Z0-9]+$/, "register_password_allowed_combination"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "register_confirm_password_match")
    .required("register_confirm_password_required"),
});

const Register = () => {
  const { error } = useAuthState();
  const [registered, setRegistered] = useState(false);
  const [gender, setGender] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const getLocaleString = (key) => t(key);

  const handleSubmit = async (values) => {
    try {
      const { confirmPassword, ...data } = values;
      await AuthService.register(data).then((res) => {
        setRegistered(true);
        ToastService.success(getLocaleString("toast_register_user_success"));
        navigate("/login");
      });
      form.resetForm();
    } catch (err) {
      console.log("err=>", err);
      setRegistered(false);
    }
  };

  const handleSetGender = (event) => {
    setGender(event.target.value);
    form.setFieldValue("gender", event.target.value);
  };

  const form = useFormik({
    validationSchema,
    initialValues: {
      name: "",
      email: "",
      userId: "",
      birthday: "", // Set initial value to null
      password: "",
      confirmPassword: "",
      gender: true,
    },
    onSubmit: handleSubmit,
  });

  return (
    <FormWrapper>
      <FormContainer>
        <form onSubmit={form.handleSubmit}>
          <Box sx={{ marginBottom: "1rem" }}>
            <Typography variant="h5">
              {getLocaleString("register_title")}
            </Typography>
            {error && <ErrorText>{error}</ErrorText>}
            {registered && (
              <SuccessText>
                {getLocaleString("register_successful")}
              </SuccessText>
            )}
          </Box>

          <FormTextField
            fullWidth
            label={getLocaleString("register_name_label")}
            placeholder={getLocaleString("register_name_placeholder")}
            {...form.getFieldProps("name")}
            helperText={getLocaleString(
              form.errors.name && form.touched.name ? form.errors.name : "",
            )}
            error={Boolean(form.errors.name && form.touched.name)}
          />

          <FormTextField
            fullWidth
            label={getLocaleString("register_email_label")}
            placeholder={getLocaleString("register_email_placeholder")}
            {...form.getFieldProps("email")}
            helperText={getLocaleString(
              form.errors.email && form.touched.email ? form.errors.email : "",
            )}
            error={Boolean(form.errors.email && form.touched.email)}
          />

          <FormTextField
            fullWidth
            label={getLocaleString("register_userId_label")}
            placeholder={getLocaleString("register_userId_placeholder")}
            {...form.getFieldProps("userId")}
            helperText={getLocaleString(
              form.errors.userId && form.touched.userId
                ? form.errors.userId
                : "",
            )}
            error={Boolean(form.errors.userId && form.touched.userId)}
          />

          <Grid container columns={2}>
            <Grid item xs={1} sx={{ mb: 3, pr: 1 }}>
              <FormControl>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    sx={{
                      ...(Boolean(form.errors.birthday && form.touched.birthday)
                        ? {
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "red",
                            },
                          }
                        : {}),
                    }}
                    label={getLocaleString("register_birthday_label")}
                    placeholder={getLocaleString(
                      "register_birthday_placeholder",
                    )}
                    onChange={(newValue) => {
                      if (newValue) {
                        form.setFieldValue(
                          "birthday",
                          moment(newValue.$d).format("DD-MM-YYYY"),
                        );
                      } else {
                        form.setFieldValue("birthday", ""); // Reset to empty string if no date is selected
                      }
                    }}
                    value={
                      form.values.birthday
                        ? dayjs(form.values.birthday, "DD-MM-YYYY")
                        : null
                    } // Control value with Formik
                    helperText={getLocaleString(
                      form.errors.birthday && form.touched.birthday
                        ? form.errors.birthday
                        : "",
                    )}
                  />
                </LocalizationProvider>
                {Boolean(form.errors.birthday && form.touched.birthday) && (
                  <FormErrorText>
                    {getLocaleString(
                      form.errors.birthday && form.touched.birthday
                        ? form.errors.birthday
                        : "",
                    )}
                  </FormErrorText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={1} sx={{ mb: 3, pl: 1 }}>
              <FormControl fullWidth>
                <InputLabel id="type-label">
                  {getLocaleString("register_gender_label")}
                </InputLabel>
                <Select
                  labelId="type-label"
                  id="type-select"
                  label={getLocaleString("register_gender_label")}
                  value={gender}
                  onChange={handleSetGender}
                  error={Boolean(form.errors.gender && form.touched.gender)}
                >
                  <MenuItem value={true} key="male">
                    {getLocaleString("Male")}
                  </MenuItem>
                  <MenuItem value={false} key="female">
                    {getLocaleString("Female")}
                  </MenuItem>
                </Select>
                {Boolean(form.errors.gender && form.touched.gender) && (
                  <FormErrorText>
                    {getLocaleString("register_gender_required")}
                  </FormErrorText>
                )}
              </FormControl>
            </Grid>
          </Grid>

          <FormTextField
            fullWidth
            type="password"
            label={getLocaleString("register_password_label")}
            placeholder={getLocaleString("register_password_placeholder")}
            {...form.getFieldProps("password")}
            helperText={getLocaleString(
              form.errors.password && form.touched.password
                ? form.errors.password
                : "",
            )}
            error={Boolean(form.errors.password && form.touched.password)}
          />

          <FormTextField
            fullWidth
            type="password"
            label={getLocaleString("register_confirm_password_label")}
            placeholder={getLocaleString(
              "register_confirm_password_placeholder",
            )}
            {...form.getFieldProps("confirmPassword")}
            helperText={getLocaleString(
              form.errors.confirmPassword && form.touched.confirmPassword
                ? form.errors.confirmPassword
                : "",
            )}
            error={Boolean(
              form.errors.confirmPassword && form.touched.confirmPassword,
            )}
          />

          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <SubmitButton variant="contained" type="submit" fullWidth>
              {getLocaleString("register_button_text")}
            </SubmitButton>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            mt={2}
          >
            <Link to="/login" style={{ color: "#589fef" }}>
              {getLocaleString("register_go_to_login")}
            </Link>
          </Stack>
        </form>
      </FormContainer>
    </FormWrapper>
  );
};

export default Register;
