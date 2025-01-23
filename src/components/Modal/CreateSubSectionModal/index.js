import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Box, FormControlLabel, Modal, Switch } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { CloseButtonBox, FormContainer, SubmitButton } from "../style";
import { FormTextField } from "../../../pages/style";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("register_name_required"),
});

const CreateSubSectionModal = ({ open, close, data, create, update }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const editing = !!data;
  const subSectionId = data?.id;
  const getLocaleString = (key) => t(key);

  const handleSubmit = async (data) => {
    if (!editing) {
      create(data, id);
    } else {
      update(subSectionId, data, id);
    }
  };

  const form = useFormik({
    validationSchema,
    initialValues: {
      name: "",
      sectionId: "",
      archived: false,
    },
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    if (data && open) {
      form.setValues({
        name: data.name || "",
        sectionId: data.sectionId || null,
        archived: data.archived || false,
      });
    } else {
      form.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, open]);

  const isChanged = useMemo(
    () =>
      (data && (
        form.values.name !== data?.name ||
        form.values.archived !== data?.archived
      )) || (!data && (
        form.values.name !== "" ||
        form.values.archived !== false
      ))
    , [form.values, data]
  );

  const handleSwitchArchived = () => {
    if (form.values.archived) {
      form.setFieldValue("archived", false);
    } else {
      form.setFieldValue("archived", true);
    }
  };

  return (
    <Modal open={open} onClose={close}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
      >
        <FormContainer>
          <form onSubmit={form.handleSubmit}>
            <FormTextField
              fullWidth
              label={getLocaleString("register_name_label")}
              placeholder={getLocaleString("register_name_placeholder")}
              {...form.getFieldProps("name")}
              helperText={getLocaleString(
                form.errors.name && form.touched.name ? form.errors.name : "",
              )}
              error={Boolean(
                form.errors.name && form.touched.name ? form.errors.name : "",
              )}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.values.archived}
                  onChange={handleSwitchArchived}
                />
              }
              label={getLocaleString("common_table_archived")}
              sx={{ mb: 2 }}
            />
            <SubmitButton fullWidth type="submit" variant="contained" disabled={!isChanged}>
              {!editing
                ? getLocaleString("common_create")
                : getLocaleString("common_save")}
            </SubmitButton>
          </form>
          <CloseButtonBox>
            <CloseIcon onClick={close} />
          </CloseButtonBox>
        </FormContainer>
      </Box>
    </Modal>
  );
};

export default CreateSubSectionModal;
