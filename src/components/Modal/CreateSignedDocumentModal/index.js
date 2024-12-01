import React, { useEffect } from "react";
import { Box, Button, Modal, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import * as Yup from "yup";
import { useFormik } from "formik";
import { CloseButtonBox, FormContainer } from "../style";
import { useTranslation } from "react-i18next";

const validationSchema = Yup.object().shape({
  documentId: Yup.string().required("modal_document_id_required"),
  username: Yup.string().required("register_name_required"),
  fileName: Yup.string().required("modal_file_name_required"),
  fileContent: Yup.string().required("modal_file_content_required"),
});

const CreateSignedDocumentModal = ({ open, close, data, create, update }) => {
  const { t } = useTranslation();
  const editing = !!data;
  const getLocaleString = (key) => t(key);
  const handleSubmit = async (data) => {
    if (!editing) {
      create(data);
    } else {
      update(data, form);
    }
  };

  const form = useFormik({
    validationSchema,
    initialValues: {
      documentId: "",
      username: "",
      fileName: "",
      fileContent: "",
    },
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    if (data) {
      form.setValues({
        documentId: data.documentId,
        username: data.username || "",
        fileName: data.fileName || "",
        fileContent: data.fileContent || "",
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
            <TextField
              fullWidth
              disabled={editing}
              label={getLocaleString("modal_document_id_label")}
              placeholder={getLocaleString("modal_document_id_placeholder")}
              {...form.getFieldProps("documentId")}
              helperText={getLocaleString(
                form.errors.documentId && form.touched.documentId
                  ? form.errors.documentId
                  : "",
              )}
              error={Boolean(
                form.errors.documentId && form.touched.documentId
                  ? form.errors.documentId
                  : "",
              )}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label={getLocaleString("common_table_user_name")}
              placeholder={getLocaleString("modal_user_name_placeholder")}
              {...form.getFieldProps("username")}
              helperText={getLocaleString(
                form.errors.username && form.touched.username
                  ? form.errors.username
                  : "",
              )}
              error={Boolean(
                form.errors.username && form.touched.username
                  ? form.errors.username
                  : "",
              )}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label={getLocaleString("modal_file_name_label")}
              placeholder={getLocaleString("modal_file_name_placeholder")}
              {...form.getFieldProps("fileName")}
              helperText={getLocaleString(
                form.errors.fileName && form.touched.fileName
                  ? form.errors.fileName
                  : "",
              )}
              error={Boolean(
                form.errors.fileName && form.touched.fileName
                  ? form.errors.fileName
                  : "",
              )}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label={getLocaleString("modal_file_content_label")}
              placeholder={getLocaleString("modal_file_content_placeholder")}
              {...form.getFieldProps("fileContent")}
              helperText={getLocaleString(
                form.errors.fileContent && form.touched.fileContent
                  ? form.errors.fileContent
                  : "",
              )}
              error={Boolean(
                form.errors.fileContent && form.touched.fileContent
                  ? form.errors.fileContent
                  : "",
              )}
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{ textTransform: "capitalize" }}
            >
              {!editing
                ? getLocaleString("common_create")
                : getLocaleString("common_save")}
            </Button>
          </form>
          <CloseButtonBox>
            <CloseIcon onClick={close} />
          </CloseButtonBox>
        </FormContainer>
      </Box>
    </Modal>
  );
};

export default CreateSignedDocumentModal;
