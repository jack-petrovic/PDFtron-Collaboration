import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, Modal, TextField } from "@mui/material";
import { CloseButtonBox, FormContainer } from "../style";
import { useTranslation } from "react-i18next";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("modal_paper_size_required"),
  height: Yup.number()
    .required("modal_height_required")
    .typeError("Height must be a number"),
  width: Yup.number()
    .required("modal_width_required")
    .typeError("Width must be a number"),
});

const CreatePaperSizeModal = ({ data, open, close, create, update }) => {
  const { t } = useTranslation();
  const editing = Boolean(data);
  const id = data?.id;

  const getLocaleString = (key) => t(key);

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        await update(id, values);
      } else {
        await create(values);
      }
      form.resetForm();
      close();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const form = useFormik({
    validationSchema,
    initialValues: {
      name: "",
      height: "",
      width: "",
    },
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    if (data) {
      form.setValues({
        name: data.name || "",
        height: data.height || "",
        width: data.width || "",
      });
    } else {
      form.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
                <TextField
                  fullWidth
                  label={getLocaleString("common_table_paper_size")}
                  placeholder={getLocaleString("common_table_paper_size")}
                  {...form.getFieldProps("name")}
                  helperText={
                    form.touched.name && form.errors.name
                      ? getLocaleString(form.errors.name)
                      : ""
                  }
                  error={Boolean(form.touched.name && form.errors.name)}
                />
                <TextField
                  fullWidth
                  label={getLocaleString("common_table_height")}
                  placeholder={getLocaleString("common_table_height")}
                  {...form.getFieldProps("height")}
                  helperText={
                    form.touched.height && form.errors.height
                      ? getLocaleString(form.errors.height)
                      : ""
                  }
                  error={Boolean(form.touched.height && form.errors.height)}
                />
                <TextField
                  fullWidth
                  label={getLocaleString("common_table_width")}
                  placeholder={getLocaleString("common_table_width")}
                  {...form.getFieldProps("width")}
                  helperText={
                    form.touched.width && form.errors.width
                      ? getLocaleString(form.errors.width)
                      : ""
                  }
                  error={Boolean(form.touched.width && form.errors.width)}
                />
                <CloseButtonBox>
                  <CloseIcon onClick={close} />
                </CloseButtonBox>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ textTransform: "capitalize", marginTop: "1rem" }}
                >
                  {editing
                    ? getLocaleString("common_save")
                    : getLocaleString("common_create")}
                </Button>
              </Box>
            </form>
          </FormContainer>
        </Box>
      </Modal>
    </LocalizationProvider>
  );
};

export default CreatePaperSizeModal;
