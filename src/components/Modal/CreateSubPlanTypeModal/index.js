import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as Yup from "yup";
import CloseIcon from "@mui/icons-material/Close";
import { Box, FormControlLabel, Modal, Switch, TextField } from "@mui/material";
import { CloseButtonBox, FormContainer, SubmitButton } from "../style";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("register_name_required"),
});

const CreateSubPlanTypeModal = ({ data, open, close, create, update }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const editing = Boolean(data);
  const subPlanTypeId = data?.id;
  const getLocaleString = (key) => t(key);

  const handleSubmit = async (data) => {
    editing ? update(subPlanTypeId, data, id) : create(data, id);
  };

  const form = useFormik({
    validationSchema,
    initialValues: {
      name: "",
      planTypeId: "",
      archived: false,
    },
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    if (data && open) {
      form.setValues({
        name: data.name || "",
        planTypeId: data.planTypeId || "",
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
              <SubmitButton
                fullWidth
                type="submit"
                variant="contained"
                color="primary"
                disabled={!isChanged}
              >
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

export default CreateSubPlanTypeModal;
