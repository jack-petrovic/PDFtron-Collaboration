import React, { useEffect, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Modal,
  TextField,
} from "@mui/material";
import { CloseButtonBox, FormContainer, SubmitButton } from "../style";
import { useTranslation } from "react-i18next";

const validationSchema = Yup.object().shape({
  stageMode: Yup.string().required("modal_mode_required"),
});

const CreateStageModal = ({ data, open, close, create, update }) => {
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
      stageMode: "",
      enabled: false,
      order: "0",
      start: new Date(),
      end: new Date(),
    },
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    if (data && open) {
      form.setValues({
        stageMode: data.stageMode,
        enabled: data.enabled,
        order: data.order,
      });
    } else {
      form.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, open]);

  const isChanged = useMemo(
    () =>
      (data && (
        form.values.stageMode !== data?.stageMode ||
        form.values.enabled !== data?.enabled
      )) || (!data && (
        form.values.stageMode !== "" ||
        form.values.enabled !== false
      ))
    , [form.values, data]
  );

  const handleToggle = (field) => {
    form.setFieldValue(field, !form.values[field]);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Modal open={open} onClose={close}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <FormContainer sx={{ width: "30% !important" }}>
            <form onSubmit={form.handleSubmit}>
              <Box display="flex" flexDirection="column" gap="8px">
                <Box display="flex" alignItems="center" gap="1rem" mb={1}>
                  <TextField
                    fullWidth
                    label={getLocaleString("modal_mode_label")}
                    placeholder={getLocaleString("modal_mode_placeholder")}
                    {...form.getFieldProps("stageMode")}
                    helperText={getLocaleString(
                      form.errors.stageMode && form.touched.stageMode
                        ? form.errors.stageMode
                        : "",
                    )}
                    error={Boolean(
                      form.errors.stageMode && form.touched.stageMode
                        ? form.errors.stageMode
                        : "",
                    )}
                  />
                </Box>
                <div className="md:flex justify-between items-center">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.values.enabled}
                        onChange={() => handleToggle("enabled")}
                      />
                    }
                    label={getLocaleString("common_table_enable")}
                  />
                </div>
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
    </LocalizationProvider>
  );
};

export default CreateStageModal;
