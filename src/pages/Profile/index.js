import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Grid, Tab } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useAuthState } from "../../hooks/redux";
import { updateUser, ToastService } from "../../services";
import { ProfileContainer } from "./style";
import ProfileForm from "./ProfileForm";
import ResetPasswordForm from "./ResetPasswordForm";
import { AuthService } from "../../services";
import AvatarForm from "./AvatarForm";

const validationSchema = Yup.object().shape({
  userId: Yup.string().required("register_userId_required"),
  name: Yup.string().required("register_name_required"),
  email: Yup.string()
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Invalid email format'
    )
    .email("register_email_invalid")
    .required("register_email_required"),
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
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("profile");

  const handleSubmit = async (data) => {
    setLoading(true);
    const payload = {
      ...data,
      sectionId: data.sectionId === "" ? null : data.sectionId,
      subsectionId: data.subsectionId === "" ? null : data.subsectionId,
    };

    await updateUser(account.id, payload);
    ToastService.success(t("profile_update"));
    setLoading(false);
    AuthService.getAccount();
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
      birthday: "",
      gender: true,
    },
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    form.setValues({
      userId: account.userId ?? "",
      name: account.name ?? "",
      email: account.email ?? "",
      sectionId: account.sectionId ?? "",
      subsectionId: account.subsectionId ?? "",
      roleId: account.roleId ?? "",
      birthday: account.birthday ?? "",
      gender: account.gender ?? true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const isChanged = useMemo(
    () =>
      form.values.name !== account.name ||
      (!(form.values.sectionId === "" && account.sectionId === null) &&
        form.values.sectionId !== account.sectionId) ||
      (!(form.values.subsectionId === "" && account.subsectionId === null) &&
        form.values.subsectionId !== account.subsectionId) ||
      (!(form.values.birthday === "" && account.birthday === null) &&
        form.values.birthday !== account.birthday) ||
      (!(form.values.gender === "" && account.gender === null) &&
        form.values.gender !== account.gender),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [account, form.values],
  );

  const handleChangeTab = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <ProfileContainer container columns={12}>
      <Grid item xs={3} className="avatar-section">
        <AvatarForm />
      </Grid>
      <Grid className="content" item xs={9}>
        <TabContext value={selectedTab}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleChangeTab}>
              <Tab label={t("profile_page_title")} value="profile" />
              <Tab label={t("reset_password_title")} value="reset_password" />
            </TabList>
          </Box>
          <TabPanel value="profile">
            <ProfileForm
              form={form}
              account={account}
              loading={loading}
              isChanged={isChanged}
            />
          </TabPanel>
          <TabPanel value="reset_password">
            <ResetPasswordForm />
          </TabPanel>
        </TabContext>
      </Grid>
    </ProfileContainer>
  );
};

export default Profile;
