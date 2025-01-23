import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { Box, InputLabel, MenuItem, Modal, Select } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Repeat from "../../Repeat";
import StageTable from "../../Table/StageTable";
import { MenuProps } from "../../../constants";
import {
  CloseButtonBox,
  FormContainer,
  FormBox,
  MenuItemContainer,
  CustomFormControl,
  SubmitButton,
} from "../style";
import {
  FormTextField,
  FormErrorText,
  ArchivedIcon,
  ArchivedChip,
} from "../../../pages/style";

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
    if (editing) {
      update(id, payload);
    } else {
      create(payload);
    }
  };

  const form = useFormik({
    validationSchema,
    initialValues: {
      title: "",
      sectionId: "",
      subsectionId: "",
      stages: data?.stages || "[]",
      isRepeatable: "{}",
      planTypeId: "",
      subPlanTypeId: "",
      paperSizeId: "",
    },
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    if (data && open) {
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
    } else {
      form.resetForm();
      setSectionId("");
      setPlanTypeId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, open]);

  const isChanged = useMemo(
    () =>
      data && (
        form.values.title !== data?.title ||
        form.values.planTypeId !== data?.planTypeId ||
        form.values.subPlanTypeId !== data?.subPlanTypeId ||
        form.values.subsectionId !== data?.subsectionId ||
        form.values.sectionId !== data?.sectionId ||
        form.values.paperSizeId !== data?.paperSizeId ||
        form.values.stages !== form.initialValues.stages ||
        form.values.isRepeatable !== data?.isRepeatable
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form.values, data]
  );
  
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
    form.setFieldValue("sectionId", e.target.value);
    form.setFieldValue("subsectionId", "");
    setSectionId(e.target.value);
  };

  const handleChangeSubsectionId = (e) => {
    form.setFieldValue("subsectionId", e.target.value);
  };

  const handleChangePlanTypeId = (e) => {
    form.setFieldValue("planTypeId", e.target.value);
    form.setFieldValue("subPlanTypeId", "");
    setPlanTypeId(e.target.value);
  };

  const handleChangeSubPlanTypeId = (e) => {
    form.setFieldValue("subPlanTypeId", e.target.value);
  };

  const handleChangePaperSizeId = (e) => {
    form.setFieldValue("paperSizeId", e.target.value);
  };

  const handleStagesChange = (stages) => {
    form.setFieldValue("stages", stages);
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
                <FormTextField
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
                />
                <CustomFormControl fullWidth>
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
                    onChange={(e) => handleChangeSectionId(e)}
                  >
                    <MenuItemContainer key="-1" value="" />
                    {sections?.map((section) => (
                      <MenuItem key={section.id} value={section.id}>
                        {section.name}
                        {section.archived && (
                          <ArchivedChip
                            label={getLocaleString("common_table_archived")}
                            icon={<ArchivedIcon />}
                            color="warning"
                          />
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                  {form.touched.sectionId && form.errors.sectionId && (
                    <FormErrorText>
                      {getLocaleString("modal_section_required")}
                    </FormErrorText>
                  )}
                </CustomFormControl>

                <CustomFormControl fullWidth>
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
                    onChange={(e) => handleChangeSubsectionId(e)}
                  >
                    <MenuItemContainer key="-1" value="" />
                    {availableSubSections?.map((subSection) => (
                      <MenuItem key={subSection.id} value={subSection.id}>
                        {subSection.name}
                        {subSection.archived && (
                          <ArchivedChip
                            label={getLocaleString("common_table_archived")}
                            icon={<ArchivedIcon />}
                            color="warning"
                          />
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                  {form.touched.subsectionId && form.errors.subsectionId && (
                    <FormErrorText>
                      {getLocaleString("modal_sub_section_required")}
                    </FormErrorText>
                  )}
                </CustomFormControl>

                <CustomFormControl fullWidth>
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
                    onChange={(e) => handleChangePlanTypeId(e)}
                  >
                    <MenuItemContainer key="-1" value="" />
                    {planTypes?.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                        {type.archived && (
                          <ArchivedChip
                            label={getLocaleString("common_table_archived")}
                            icon={<ArchivedIcon />}
                            color="warning"
                          />
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                  {form.touched.planTypeId && form.errors.planTypeId && (
                    <FormErrorText>
                      {getLocaleString("modal_plan_type_required")}
                    </FormErrorText>
                  )}
                </CustomFormControl>

                <CustomFormControl fullWidth>
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
                    onChange={(e) => handleChangeSubPlanTypeId(e)}
                  >
                    <MenuItemContainer key="-1" value="" />
                    {availableSubPlanTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                        {type.archived && (
                          <ArchivedChip
                            label={getLocaleString("common_table_archived")}
                            icon={<ArchivedIcon />}
                            color="warning"
                          />
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                  {form.touched.subPlanTypeId && form.errors.subPlanTypeId && (
                    <FormErrorText>
                      {getLocaleString("modal_sub_plan_type_required")}
                    </FormErrorText>
                  )}
                </CustomFormControl>

                <CustomFormControl fullWidth>
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
                    onChange={(e) => handleChangePaperSizeId(e)}
                  >
                    <MenuItemContainer key="-1" value="" />
                    {paperSizes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {form.touched.paperSizeId && form.errors.paperSizeId && (
                    <FormErrorText>
                      {getLocaleString("modal_paper_size_required")}
                    </FormErrorText>
                  )}
                </CustomFormControl>

                <Repeat
                  data={data?.isRepeatable}
                  onChange={(e) => form.setFieldValue("isRepeatable", e)}
                />
                <StageTable
                  data={data?.stages}
                  planStart={new Date().toString()}
                  onChange={handleStagesChange}
                  showRanges={false}
                  disable={false}
                />
              </FormBox>
              <SubmitButton fullWidth type="submit" variant="contained" disabled={data && !isChanged}>
                {editing
                  ? getLocaleString("common_save")
                  : getLocaleString("common_create")}
              </SubmitButton>
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
