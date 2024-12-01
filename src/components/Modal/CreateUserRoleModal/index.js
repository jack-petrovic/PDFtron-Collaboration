import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as Yup from "yup";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Modal,
  Switch,
  TextField,
} from "@mui/material";
import { CloseButtonBox, FormContainer } from "../style";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("register_name_required"),
});

const CreateUserRoleModal = ({ data, open, close, create, update }) => {
  const { t } = useTranslation();
  const editing = !!data;
  const id = data?.id;
  const getLocaleString = (key) => t(key);
  const handleSubmit = async (data) => {
    try {
      if (!editing) {
        await create(data);
      } else {
        await update(id, data);
      }
      form.resetForm();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const form = useFormik({
    validationSchema,
    initialValues: {
      name: "",
      color: "#000000",
      archived: false,
      signature: false,
    },
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    if (open) {
      form.setValues({
        name: data?.name || "",
        color: data?.color || "#000000",
        archived: data?.archived || false,
        signature: data?.signature || false,
      });
    } else {
      form.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, open]);

  const handleSwitchArchived = () => {
    form.setFieldValue("archived", !form.values.archived);
  };

  const handleCheckSignature = () => {
    form.setFieldValue("signature", !form.values.signature);
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
            <Box display="flex" flexDirection="column" gap="8px">
              <TextField
                fullWidth
                label={getLocaleString("modal_role_label")}
                placeholder={getLocaleString("modal_role_placeholder")}
                {...form.getFieldProps("name")}
                helperText={getLocaleString(
                  form.errors.name && form.touched.name ? form.errors.name : "",
                )}
                error={Boolean(
                  form.errors.name && form.touched.name ? form.errors.name : "",
                )}
              />
              <Grid container spacing={2} mt={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="color"
                    label={getLocaleString("modal_color_label")}
                    {...form.getFieldProps("color")}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.values.signature}
                          onChange={handleCheckSignature}
                        />
                      }
                      label={getLocaleString("common_table_signature")}
                      sx={{ my: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
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
                  </Box>
                </Grid>
              </Grid>
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

export default CreateUserRoleModal;
