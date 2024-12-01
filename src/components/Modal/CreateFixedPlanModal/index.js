import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import {
  Box,
  Button,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Repeat from "../../Repeat";
import StageTable from "../../Table/StageTable";
import { MenuProps } from "../../../constants";
import { CloseButtonBox, FormContainer, FormBox } from "../style";

const validationSchema = Yup.object().shape({
  title: Yup.string().required("modal_title_required"),
  planTypeId: Yup.string().required("modal_plan_type_required"),
  sectionId: Yup.string().required("modal_section_required"),
  paperSizeId: Yup.string().required("modal_paper_size_required"),
});

const CreateFixedPlanModal = ({ open, close, data, create, update }) => {
  const { t } = useTranslation();
  const editing = Boolean(data);
  const id = data?.id;
  const [sectionId, setSectionId] = useState(0);
  const [planTypeId, setPlanTypeId] = useState(0);

  // Redux selectors
  const sections = useSelector((state) => state.sectionReducer.sections);
  const subSections = useSelector(
    (state) => state.subSectionReducer.subSections,
  );
  const planTypes = useSelector((state) => state.planTypeReducer.planTypes);
  const subPlanTypes = useSelector(
    (state) => state.subPlanTypeReducer.subPlanTypes,
  );
  const paperSizes = useSelector((state) => state.paperSizeReducer.paperSizes);

  const getLocaleString = (key) => t(key);

  const handleSubmit = async (data) => {
    const payload = {
      ...data,
      sectionId: data.sectionId,
      subsectionId: data.subsectionId || null,
      planTypeId: data.planTypeId,
      subPlanTypeId: data.subPlanTypeId || null,
      paperSizeId: data.paperSizeId,
    };
    if (!editing) {
      create(payload);
    } else {
      update(id, payload, form);
    }
  };

  useEffect(() => {
    if (data) {
      setSectionId(data.sectionId);
      setPlanTypeId(data.planTypeId);
    }
  }, [data]);

  const form = useFormik({
    validationSchema,
    initialValues: {
      title: "",
      sectionId: "",
      subsectionId: "",
      stages: "[]",
      isRepeatable: "{}",
      planTypeId: "",
      subPlanTypeId: "",
      paperSizeId: "",
    },
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    if (data) {
      form.setValues({
        title: data.title ?? "",
        sectionId: data.sectionId ?? "",
        subsectionId: data.subsectionId ?? "",
        isRepeatable: data.isRepeatable ?? "",
        stages: data.stages ?? "",
        planTypeId: data.planTypeId ?? "",
        subPlanTypeId: data.subPlanTypeId ?? "",
        paperSizeId: data.paperSizeId ?? "",
      });
      setSectionId(data.sectionId);
      setPlanTypeId(data.planTypeId);
    }
  }, [data]);

  const availableSubSections = useMemo(() => {
    return sectionId
      ? subSections.filter((item) => item.sectionId === sectionId)
      : [];
  }, [sectionId, subSections]);

  const availableSubPlanTypes = useMemo(() => {
    return planTypeId
      ? subPlanTypes.filter((item) => item.planTypeId === planTypeId)
      : [];
  }, [planTypeId, subPlanTypes]);

  const handleChangeSectionId = (e) => {
    const value = e.target.value;
    form.setFieldValue("sectionId", value);
    form.setFieldValue("subsectionId", "");
    setSectionId(value);
  };

  const handleChangePlanTypeId = (e) => {
    const value = e.target.value;
    form.setFieldValue("planTypeId", value);
    form.setFieldValue("subPlanTypeId", "");
    setPlanTypeId(value);
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
          <FormContainer sx={{ width: "75% !important" }}>
            <form onSubmit={form.handleSubmit}>
              <FormBox>
                <TextField
                  fullWidth
                  label={getLocaleString("modal_title_label")}
                  placeholder={getLocaleString("modal_title_placeholder")}
                  {...form.getFieldProps("title")}
                  helperText={
                    form.touched.title && form.errors.title
                      ? getLocaleString(form.errors.title)
                      : ""
                  }
                  error={Boolean(form.touched.title && form.errors.title)}
                  sx={{ mb: 3 }}
                />
                <FormControl
                  fullWidth
                  sx={{ marginBottom: "1rem", maxHeight: "100px" }}
                >
                  <InputLabel id="section-label">
                    {getLocaleString("common_table_section")}
                  </InputLabel>
                  <Select
                    labelId="section-label"
                    id="section-select"
                    MenuProps={MenuProps}
                    label={getLocaleString("common_table_section")}
                    {...form.getFieldProps("sectionId")}
                    error={Boolean(
                      form.touched.sectionId && form.errors.sectionId,
                    )}
                    onChange={handleChangeSectionId}
                  >
                    <MenuItem sx={{ height: "36px" }} key="-1" value="" />
                    {sections.map((section) => (
                      <MenuItem key={section.id} value={section.id}>
                        {section.name}
                        {section.archived && (
                          <Chip
                            label={getLocaleString("common_table_archived")}
                            icon={
                              <WarningAmberIcon sx={{ fontSize: "16px" }} />
                            }
                            color="warning"
                            sx={{ marginLeft: "0.5rem" }}
                          />
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                  {form.touched.sectionId && form.errors.sectionId && (
                    <FormHelperText sx={{ color: "red" }}>
                      {getLocaleString("modal_section_required")}
                    </FormHelperText>
                  )}
                </FormControl>

                <FormControl
                  fullWidth
                  sx={{ marginBottom: "1rem", maxHeight: "100px" }}
                >
                  <InputLabel id="sub-section-label">
                    {getLocaleString("common_table_subsection")}
                  </InputLabel>
                  <Select
                    labelId="sub-section-label"
                    id="section-sub-select"
                    MenuProps={MenuProps}
                    label={getLocaleString("common_table_subsection")}
                    {...form.getFieldProps("subsectionId")}
                    error={Boolean(
                      form.touched.subsectionId && form.errors.subsectionId,
                    )}
                  >
                    <MenuItem sx={{ height: "36px" }} key="-1" value="" />
                    {availableSubSections.map((subSection) => (
                      <MenuItem key={subSection.id} value={subSection.id}>
                        {subSection.name}
                        {subSection.archived && (
                          <Chip
                            label={getLocaleString("common_table_archived")}
                            icon={
                              <WarningAmberIcon sx={{ fontSize: "16px" }} />
                            }
                            color="warning"
                            sx={{ marginLeft: "0.5rem" }}
                          />
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                  {form.touched.subsectionId && form.errors.subsectionId && (
                    <FormHelperText sx={{ color: "red" }}>
                      {getLocaleString("modal_sub_section_required")}
                    </FormHelperText>
                  )}
                </FormControl>

                <FormControl
                  fullWidth
                  sx={{ marginBottom: "1rem", maxHeight: "100px" }}
                >
                  <InputLabel id="type-label">
                    {getLocaleString("common_table_type")}
                  </InputLabel>
                  <Select
                    labelId="type-label"
                    id="type-select"
                    MenuProps={MenuProps}
                    label={getLocaleString("common_table_type")}
                    {...form.getFieldProps("planTypeId")}
                    error={Boolean(
                      form.touched.planTypeId && form.errors.planTypeId,
                    )}
                    onChange={handleChangePlanTypeId}
                  >
                    <MenuItem sx={{ height: "36px" }} key="-1" value="" />
                    {planTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                        {type.archived && (
                          <Chip
                            label={getLocaleString("common_table_archived")}
                            icon={
                              <WarningAmberIcon sx={{ fontSize: "16px" }} />
                            }
                            color="warning"
                            sx={{ marginLeft: "0.5rem" }}
                          />
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                  {form.touched.planTypeId && form.errors.planTypeId && (
                    <FormHelperText sx={{ color: "red" }}>
                      {getLocaleString("modal_plan_type_required")}
                    </FormHelperText>
                  )}
                </FormControl>

                <FormControl
                  fullWidth
                  sx={{ marginBottom: "1rem", maxHeight: "100px" }}
                >
                  <InputLabel id="sub-plan-type-label">
                    {getLocaleString("common_table_subplan_type")}
                  </InputLabel>
                  <Select
                    labelId="sub-plan-type-label"
                    id="sub-plan-type-select"
                    MenuProps={MenuProps}
                    label={getLocaleString("common_table_subplan_type")}
                    {...form.getFieldProps("subPlanTypeId")}
                    error={Boolean(
                      form.touched.subPlanTypeId && form.errors.subPlanTypeId,
                    )}
                  >
                    <MenuItem sx={{ height: "36px" }} key="-1" value="" />
                    {availableSubPlanTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                        {type.archived && (
                          <Chip
                            label={getLocaleString("common_table_archived")}
                            icon={
                              <WarningAmberIcon sx={{ fontSize: "16px" }} />
                            }
                            color="warning"
                            sx={{ marginLeft: "0.5rem" }}
                          />
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                  {form.touched.subPlanTypeId && form.errors.subPlanTypeId && (
                    <FormHelperText sx={{ color: "red" }}>
                      {getLocaleString("modal_sub_plan_type_required")}
                    </FormHelperText>
                  )}
                </FormControl>

                <FormControl
                  fullWidth
                  sx={{ marginBottom: "1rem", maxHeight: "100px" }}
                >
                  <InputLabel>
                    {getLocaleString("common_table_paper_size")}
                  </InputLabel>
                  <Select
                    label={getLocaleString("common_table_paper_size")}
                    MenuProps={MenuProps}
                    {...form.getFieldProps("paperSizeId")}
                    error={Boolean(
                      form.touched.paperSizeId && form.errors.paperSizeId,
                    )}
                  >
                    <MenuItem sx={{ height: "36px" }} key="-1" value="" />
                    {paperSizes.map((size) => (
                      <MenuItem key={size.id} value={size.id}>
                        {size.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {form.touched.paperSizeId && form.errors.paperSizeId && (
                    <FormHelperText sx={{ color: "red" }}>
                      {getLocaleString("modal_paper_size_required")}
                    </FormHelperText>
                  )}
                </FormControl>

                <Repeat
                  data={data?.isRepeatable}
                  onChange={(e) => form.setFieldValue("isRepeatable", e)}
                />
                <StageTable
                  data={data?.stages}
                  planStart={new Date().toString()}
                  onChange={(stages) => form.setFieldValue("stages", stages)}
                  showRanges={false}
                  disable={false}
                />
              </FormBox>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                sx={{ textTransform: "capitalize", marginTop: "1rem" }}
              >
                {editing
                  ? getLocaleString("common_save")
                  : getLocaleString("common_create")}
              </Button>
            </form>
            <CloseButtonBox>
              <CloseIcon onClick={close} />
            </CloseButtonBox>
          </FormContainer>
        </Box>
      </Modal>
    </LocalizationProvider>
  );
};

export default CreateFixedPlanModal;
