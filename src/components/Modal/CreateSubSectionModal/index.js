import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  Box,
  Button,
  FormControlLabel,
  Modal,
  Switch,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { CloseButtonBox, FormContainer } from "../style";

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
      form.resetForm();
    } else {
      update(subSectionId, data, form);
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
    form.setValues({
      name: data?.name || "",
      sectionId: data?.sectionId || null,
      archived: data?.archived || false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

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
            <TextField
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
              sx={{ mb: 3 }}
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

export default CreateSubSectionModal;
