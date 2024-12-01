import React, { useEffect, useMemo, useState, createRef } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useAuthState, useGetAccountAction } from "../../hooks/redux";
import {
  Avatar,
  Box,
  Chip,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import * as Yup from "yup";
import { useFormik } from "formik";
import { MenuProps } from "../../constants";
import { updateUser, ToastService, uploadAvatar } from "../../services";
import { ProfileContainer } from "./style";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import moment from "moment/moment";
import dayjs from "dayjs";

const validationSchema = Yup.object().shape({
  userId: Yup.string().required("register_userId_required"),
  name: Yup.string().required("register_name_required"),
  email: Yup.string().email("register_email_invalid"),
  birthday: Yup.string()
    .required("register_birthday_required")
    .test("date", "Invalid date format", (value) => {
      const regex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])-(19|20)\d{2}$/;
      return regex.test(value);
    }),
  gender: Yup.bool().required("register_gender_required"),
});

const Profile = () => {
  const { t } = useTranslation();
  const { account } = useAuthState();
  const sections = useSelector((state) => state.sectionReducer.sections);
  const subSections = useSelector(
    (state) => state.subSectionReducer.subSections,
  );
  const roles = useSelector((state) => state.roleReducer.roles);
  const [loading, setLoading] = useState(false);
  const [sectionId, setSectionId] = useState(0);
  const [gender, setGender] = useState(true);
  const [image, setImage] = useState(null);
  const [changedImage, setChangedImage] = useState(null);
  const inputFileRef = createRef(null);

  const getAccount = useGetAccountAction();
  const formData = new FormData();
  const getLocaleString = (key) => t(key);
  const handleSubmit = async (data) => {
    setLoading(true);
    let isImageUploadSuccess = true;
    const payload = {
      ...data,
      sectionId: data.sectionId === "" ? null : data.sectionId,
      subsectionId: data.subsectionId === "" ? null : data.subsectionId,
    };
    const isValid = changedImage?.type.startsWith("image/");

    try {
      if (isValid) {
        formData.append("file", changedImage);
        const res = await uploadAvatar(account.id, formData);
        payload.avatarUrl = res.path;
      } else if (payload.avatarUrl !== payload.originAvatar) {
        ToastService.error(getLocaleString("invalid_avatar"));
      }

      if (isImageUploadSuccess && (isValid || !changedImage)) {
        await updateUser(account.id, payload);
        ToastService.success(getLocaleString("profile_update"));
      }
    } catch (err) {
      ToastService.error(
        getLocaleString(err.response?.data?.message || "common_network_error"),
      );
    } finally {
      setLoading(false);
      setChangedImage(null);
      getAccount();
    }
  };

  const form = useFormik({
    validationSchema,
    initialValues: {
      userId: "",
      name: "",
      email: "",
      sectionId: "",
      subsectionId: "",
      roleId: "",
      avatarUrl: "",
      originAvatar: "",
      birthday: "", // Initialize to empty string
      gender: true,
    },
    onSubmit: handleSubmit,
  });

  const handleChangeSectionId = (e) => {
    form.setFieldValue("sectionId", e.target.value);
    form.setFieldValue("subsectionId", "");
    setSectionId(e.target.value);
  };

  const handleChangeSubsectionId = (e) => {
    form.setFieldValue("subsectionId", e.target.value);
  };

  const availableSubSections = useMemo(() => {
    return !sectionId
      ? null
      : subSections.filter((item) => item.sectionId === sectionId);
  }, [sectionId, subSections]);

  useEffect(() => {
    form.setValues({
      userId: account.userId ?? "",
      name: account.name ?? "",
      email: account.email ?? "",
      sectionId: account.sectionId ?? "",
      subsectionId: account.subsectionId ?? "",
      roleId: account.roleId ?? "",
      avatarUrl: account.avatarUrl ?? "",
      originAvatar: account.avatarUrl ?? "",
      birthday: account.birthday ?? "", // Set to account's birthday or empty
      gender: account.gender ?? true,
    });
    setSectionId(account.sectionId);
    setImageUrl(
      process.env.REACT_APP_API_SERVER.replace("api", account.avatarUrl),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const isChanged = useMemo(
    () =>
      form.values.name !== account.name ||
      (!(form.values.sectionId === "" && account.sectionId === null) &&
        form.values.sectionId !== account.sectionId) ||
      (changedImage?.type.startsWith("image/") &&
        !(form.values.avatarUrl === "" && account.avatarUrl === null) &&
        form.values.avatarUrl !== account.avatarUrl) ||
      (!(form.values.subsectionId === "" && account.subsectionId === null) &&
        form.values.subsectionId !== account.subsectionId) ||
      (!(form.values.birthday === "" && account.birthday === null) &&
        form.values.birthday !== account.birthday) ||
      (!(form.values.gender === "" && account.gender === null) &&
        form.values.gender !== account.gender),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [account, form.values],
  );

  const cleanup = () => {
    URL.revokeObjectURL(image);
    inputFileRef.current.value = null;
  };

  const setImageUrl = (newImage) => {
    if (image) {
      cleanup();
    }
    setImage(newImage);
  };

  const handleOnClick = async (event) => {
    inputFileRef.current.click();
  };

  const handleOnChange = async (event) => {
    const newImage = event.target?.files?.[0];
    if (newImage) {
      if (newImage.type.startsWith("image/")) {
        setImageUrl(URL.createObjectURL(newImage));
        setChangedImage(newImage);
        form.setFieldValue("avatarUrl", newImage);
      } else {
        ToastService.error(getLocaleString("invalid_avatar"));
      }
    }
  };

  const handleSetGender = (event) => {
    setGender(event.target.value);
    form.setFieldValue("gender", event.target.value);
  };

  return (
    <ProfileContainer container columns={12}>
      <Grid item xs={3} className="avatar-section">
        <form id="avatar-form" method="post" encType="multipart/form-data">
          <Avatar
            alt="Avatar"
            src={image}
            className="avatar"
            onClick={handleOnClick}
          />
          <input
            ref={inputFileRef}
            accept="image/*"
            hidden
            id="avatar-image-upload"
            type="file"
            onChange={handleOnChange}
          />
        </form>
        <Typography className="name">
          {getLocaleString(account.name)}
        </Typography>
        <Typography className="email">{account.email}</Typography>
        <Typography className="userId">{account.userId}</Typography>
      </Grid>
      <Grid className="content" item xs={9}>
        <h1 className="title">{getLocaleString("profile_page_title")}</h1>

        <Grid container columns={2}>
          <Grid item xs={1} sx={{ mb: 3, pr: 1 }}>
            <TextField
              fullWidth
              disabled
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
          </Grid>
          <Grid item xs={1} sx={{ mb: 3, pl: 1 }}>
            <TextField
              fullWidth
              disabled
              label={getLocaleString("register_email_label")}
              placeholder={getLocaleString("register_email_placeholder")}
              {...form.getFieldProps("email")}
              helperText={getLocaleString(
                form.errors.email && form.touched.email
                  ? form.errors.email
                  : "",
              )}
              error={Boolean(form.errors.email && form.touched.email)}
            />
          </Grid>

          <Grid item xs={2} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label={getLocaleString("register_name_label")}
              placeholder={getLocaleString("register_name_placeholder")}
              {...form.getFieldProps("name")}
              helperText={getLocaleString(
                form.errors.name && form.touched.name ? form.errors.name : "",
              )}
              error={Boolean(form.errors.name && form.touched.name)}
            />
          </Grid>

          <Grid item xs={2} sx={{ mb: 3 }}>
            <FormControl fullWidth disabled>
              <InputLabel id="section-label">
                {getLocaleString("select_user_role_label")}
              </InputLabel>
              <Select
                labelId="role-label"
                id="role-select"
                label={getLocaleString("select_user_role_label")}
                disabled
                MenuProps={MenuProps}
                {...form.getFieldProps("roleId")}
                onChange={(e) => form.setFieldValue("roleId", e.target.value)}
              >
                {roles?.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {getLocaleString(role.name)}
                    {role.archived && (
                      <Chip
                        label={getLocaleString("common_table_archived")}
                        icon={<WarningAmberIcon sx={{ fontSize: "16px" }} />}
                        color="warning"
                        sx={{
                          marginLeft: "0.5rem",
                          "-webkit-text-fill-color": "white",
                        }}
                      />
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid container columns={2}>
            <Grid item xs={1} sx={{ mb: 3, pr: 1 }}>
              <FormControl fullWidth>
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
                  <FormHelperText sx={{ color: "red" }}>
                    {getLocaleString(
                      form.errors.birthday && form.touched.birthday
                        ? form.errors.birthday
                        : "",
                    )}
                  </FormHelperText>
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
                  <FormHelperText sx={{ color: "red" }}>
                    {getLocaleString("register_gender_required")}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>

          <Grid item xs={2} sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="section-label">
                {getLocaleString("common_table_section")}
              </InputLabel>
              <Select
                labelId="section-label"
                id="section-select"
                label={getLocaleString("common_table_section")}
                MenuProps={MenuProps}
                {...form.getFieldProps("sectionId")}
                onChange={(e) => handleChangeSectionId(e)}
              >
                <MenuItem sx={{ height: "36px" }} key="-1" value="" />
                {sections?.map((section) => (
                  <MenuItem key={section.id} value={section.id}>
                    {section.name}
                    {section.archived && (
                      <Chip
                        label={getLocaleString("common_table_archived")}
                        icon={<WarningAmberIcon sx={{ fontSize: "16px" }} />}
                        color="warning"
                        sx={{ marginLeft: "0.5rem" }}
                      />
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={2} sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="sub-section-label">
                {getLocaleString("common_table_subsection")}
              </InputLabel>
              <Select
                labelId="sub-section-label"
                id="section-sub-select"
                label={getLocaleString("common_table_subsection")}
                MenuProps={MenuProps}
                {...form.getFieldProps("subsectionId")}
                onChange={(e) => handleChangeSubsectionId(e)}
              >
                <MenuItem sx={{ height: "36px" }} key="-1" value="" />
                {availableSubSections?.map((subSection) => (
                  <MenuItem key={subSection.id} value={subSection.id}>
                    {subSection.name}
                    {subSection.archived && (
                      <Chip
                        label={getLocaleString("common_table_archived")}
                        icon={<WarningAmberIcon sx={{ fontSize: "16px" }} />}
                        color="warning"
                        sx={{ marginLeft: "0.5rem" }}
                      />
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box className="actions">
          <LoadingButton
            loading={loading}
            disabled={!isChanged}
            onClick={form.submitForm}
            loadingPosition="start"
            startIcon={<SaveIcon />}
            variant="contained"
          >
            {getLocaleString("common_save")}
          </LoadingButton>
        </Box>
      </Grid>
    </ProfileContainer>
  );
};

export default Profile;
