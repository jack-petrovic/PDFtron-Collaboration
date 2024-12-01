import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, Modal, TextField } from "@mui/material";
import { CloseButtonBox, FormContainer } from "../style";
import { useTranslation } from "react-i18next";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("common_text_required"),
});
const CreateProhibitedWordModal = ({ data, open, close, create, update }) => {
  const { t } = useTranslation();
  const editing = !!data;
  const id = data?.id;
  const getLocaleString = (key) => t(key);
  const handleSubmit = async (data) => {
    if (!editing) {
      create(data);
    } else {
      update(id, data);
    }
    form.resetForm();
  };

  const form = useFormik({
    validationSchema,
    initialValues: {
      name: "",
    },
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    if (data) {
      form.setValues({
        name: data.name,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

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
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ textTransform: "capitalize", marginTop: "1rem" }}
              >
                {!editing
                  ? getLocaleString("common_create")
                  : getLocaleString("common_save")}
              </Button>
            </Box>
          </form>
        </FormContainer>
      </Box>
    </Modal>
  );
};

export default CreateProhibitedWordModal;
