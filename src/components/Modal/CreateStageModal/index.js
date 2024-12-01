import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Modal,
  TextField,
} from "@mui/material";
import { CloseButtonBox, FormContainer } from "../style";
import { useTranslation } from "react-i18next";

const validationSchema = Yup.object().shape({
  stageMode: Yup.string().required("modal_mode_required"),
});

const CreateStageModal = ({ data, open, close, create, update }) => {
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
      stageMode: "",
      enabled: false,
      order: "0",
      start: new Date(),
      end: new Date(),
      printPermission: false,
    },
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    if (data) {
      form.setValues({
        stageMode: data.stageMode,
        enabled: data.enabled,
        order: data.order,
        printPermission: data.printPermission,
      });
    } else {
      form.setValues({
        stageMode: "",
        enabled: false,
        order: "0",
        start: new Date(),
        end: new Date(),
        printPermission: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleEnableChange = () => {
    form.setFieldValue("enabled", !form.values.enabled);
  };

  const handlePermissionChange = () => {
    form.setFieldValue("printPermission", !form.values.printPermission);
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
                <Box display="flex" alignItems="center" gap="1rem" mb={2}>
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
                        onChange={handleEnableChange}
                      />
                    }
                    label={getLocaleString("common_table_enable")}
                    className="mb-4"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.values.printPermission}
                        onChange={handlePermissionChange}
                      />
                    }
                    label={getLocaleString("common_table_print_enable")}
                    className="mb-5"
                  />
                </div>
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
    </LocalizationProvider>
  );
};

export default CreateStageModal;
