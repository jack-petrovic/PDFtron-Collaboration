import React, { useEffect, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Modal, TextField } from "@mui/material";
import { CloseButtonBox, FormContainer, SubmitButton } from "../style";
import { useTranslation } from "react-i18next";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("common_text_required"),
});

const CreateProhibitedWordModal = ({ data, open, close, create, update }) => {
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
    },
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    if (data && open) {
      form.setValues({
        name: data.name || "",
      });
    } else {
      form.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, open]);

  const isChanged = useMemo(
    () =>
      (data && (
        form.values.name !== data?.name
      )) || (!data && (
        form.values.name !== ""
      ))
    , [form.values, data]
  );

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
            <Box display="flex" flexDirection="column" gap="8px">
              <Box>
                <TextField
                  fullWidth
                  label={getLocaleString("common_text")}
                  placeholder={getLocaleString("common_text_placeholder")}
                  {...form.getFieldProps("name")}
                  helperText={getLocaleString(
                    form.errors.name && form.touched.name
                      ? form.errors.name
                      : "",
                  )}
                  error={Boolean(
                    form.errors.name && form.touched.name
                      ? form.errors.name
                      : "",
                  )}
                />
              </Box>
              <CloseButtonBox>
                <CloseIcon onClick={close} />
              </CloseButtonBox>
              <SubmitButton type="submit" variant="contained" color="primary" disabled={!isChanged}>
                {editing
                  ? getLocaleString("common_save")
                  : getLocaleString("common_create")}
              </SubmitButton>
            </Box>
          </form>
        </FormContainer>
      </Box>
    </Modal>
  );
};

export default CreateProhibitedWordModal;
