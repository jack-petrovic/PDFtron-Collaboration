import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as Yup from "yup";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  FormControlLabel,
  Modal,
  Switch,
  TextField,
} from "@mui/material";
import { CloseButtonBox, FormContainer } from "../style";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("register_name_required"),
});

const CreateTypeModal = ({ data, open, close, create, update }) => {
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
      archived: false,
    },
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    if (data) {
      form.setValues({
        name: data.name,
        archived: data.archived,
      });
    } else {
      form.setValues({
        name: "",
        archived: false,
      });
    }
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
            <Box display="flex" flexDirection="column" gap="8px">
              <Box>
                <TextField
                  fullWidth
                  label={getLocaleString("modal_type_label")}
                  placeholder={getLocaleString("modal_type_enter")}
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
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.values.archived}
                      onChange={handleSwitchArchived}
                    />
                  }
                  label={getLocaleString("common_table_archived")}
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

export default CreateTypeModal;
