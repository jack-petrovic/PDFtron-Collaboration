import React, { useEffect, useMemo } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Box, FormControlLabel, Modal, Switch, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { CloseButtonBox, FormContainer, SubmitButton } from "../style";
import { useTranslation } from "react-i18next";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("register_section_name_required"),
});

const CreateSectionModal = ({ open, close, data, create, update }) => {
  const { t } = useTranslation();
  const editing = Boolean(data);
  const id = data?.id;
  const getLocaleString = (key) => t(key);

  const handleSubmit = async (formData) => {
    if (editing) {
      update(id, formData);
    } else {
      create(formData);
    }
  };

  const form = useFormik({
    validationSchema,
    initialValues: {
      name: "",
      archived: false,
    },
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    if (data && open) {
      form.setValues({
        name: data.name,
        archived: data.archived,
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
    form.setFieldValue("archived", !form.values.archived);
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
            <TextField
              fullWidth
              label={getLocaleString("register_section_name_label")}
              placeholder={getLocaleString("register_section_name_placeholder")}
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
              sx={{ my: 1 }}
            />
            <SubmitButton fullWidth type="submit" variant="contained" disabled={!isChanged}>
              {editing
                ? getLocaleString("common_save")
                : getLocaleString("common_create")}
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

export default CreateSectionModal;
