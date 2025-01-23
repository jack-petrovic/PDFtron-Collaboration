import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { useFormik } from "formik";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Modal,
  Select,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import moment from "moment";
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
  startDate: Yup.date()
    .nullable()
    .test("required", "modal_start_date_required", (value) => {
      return !!value;
    })
    .test("minDate", "modal_start_date_validation", function (value) {
      const endDate = this.resolve(Yup.ref("endDate"));
      if (value && endDate) {
        return !moment(value).isAfter(endDate, "day");
      }
      return true;
    }),
  endDate: Yup.date()
    .nullable()
    .test("required", "modal_end_date_required", (value) => {
      return !!value;
    })
    .test("minDate", "modal_end_date_validation", function (value) {
      const startDate = this.resolve(Yup.ref("startDate"));
      const publishDate = this.resolve(Yup.ref("publishDate"));
      if (value && startDate && publishDate) {
        return (
          !moment(value).isAfter(publishDate, "day") &&
          !moment(value).isBefore(startDate, "day")
        );
      }
      return true;
    }),
  publishDate: Yup.date()
    .nullable()
    .test("required", "modal_publish_date_required", (value) => {
      return !!value;
    })
    .test("minDate", "modal_publish_date_validation", function (value) {
      const endDate = this.resolve(Yup.ref("endDate"));
      if (value && endDate) {
        return !moment(value).isBefore(endDate, "day");
      }
      return true;
    }),
});
const CreatePlanModal = ({ open, close, data, create, update }) => {
  const { t } = useTranslation();
  const editing = !!data;
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
    if (!editing) {
      create(payload);
    } else {
      update(id, payload, form);
    }
  };

  const form = useFormik({
    validationSchema,
    initialValues: {
      title: "",
      sectionId: "",
      subsectionId: "",
      startDate: new Date().toString(),
      endDate: new Date().toString(),
      publishDate: new Date().toString(),
      stages: data?.stages || "",
      planTypeId: "",
      subPlanTypeId: "",
      paperSizeId: "",
    },
    onSubmit: handleSubmit,
  });

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
        new Date(form.values.startDate).getTime() !== new Date(data?.startDate).getTime() ||
        new Date(form.values.endDate).getTime() !== new Date(data?.endDate).getTime() ||
        new Date(form.values.publishDate).getTime() !== new Date(data?.publishDate).getTime()
      ), // eslint-disable-next-line react-hooks/exhaustive-deps
    [form.values, data]
  );

  const availableSubSections = useMemo(() => {
    return !sectionId
      ? null
      : subSections.filter((item) => item.sectionId === sectionId);
  }, [sectionId, subSections]);

  const availableSubPlanTypes = useMemo(() => {
    return !planTypeId
      ? null
      : subPlanTypes.filter((item) => item.planTypeId === planTypeId);
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

  const handleStagesChange = (e, end) => {
    if (end) {
      form.setFieldValue("endDate", end);
    }
    form.setFieldValue("stages", e);
  };

  useEffect(() => {
    form.setValues({
      title: data?.title || "",
      sectionId: data?.sectionId || "",
      subsectionId: data?.subsectionId || "",
      startDate: moment(data?.startDate).utc(false).format("YYYY-MM-DD") || "",
      endDate: moment(data?.endDate).utc(false).format("YYYY-MM-DD") || "",
      publishDate:
        moment(data?.publishDate).utc(false).format("YYYY-MM-DD") || "",
      stages: data?.stages || "",
      planTypeId: data?.planTypeId || "",
      subPlanTypeId: data?.subPlanTypeId || "",
      paperSizeId: data?.paperSizeId || "",
    });
    setSectionId(data?.sectionId || 0);
    setPlanTypeId(data?.planTypeId || 0);
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
          <FormContainer sx={{ width: "75% !important" }}>
            <form onSubmit={form.handleSubmit}>
              <FormBox>
                <FormTextField
                  fullWidth
                  label={getLocaleString("modal_title_label")}
                  placeholder={getLocaleString("modal_title_placeholder")}
                  {...form.getFieldProps("title")}
                  helperText={getLocaleString(
                    form.errors.title && form.touched.title
                      ? form.errors.title
                      : "",
                  )}
                  error={Boolean(
                    form.errors.title && form.touched.title
                      ? form.errors.title
                      : "",
                  )}
                />
                <CustomFormControl fullWidth>
                  <InputLabel id="type-label">
                    {getLocaleString("common_table_type")}
                  </InputLabel>
                  <Select
                    labelId="type-label"
                    id="type-select"
                    label={getLocaleString("common_table_type")}
                    MenuProps={MenuProps}
                    {...form.getFieldProps("planTypeId")}
                    error={Boolean(
                      form.errors.planTypeId && form.touched.planTypeId
                        ? form.errors.planTypeId
                        : "",
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
                  {Boolean(
                    form.errors.planTypeId && form.touched.planTypeId
                      ? form.errors.planTypeId
                      : "",
                  ) && (
                    <FormErrorText>
                      {getLocaleString("modal_plan_type_required")}
                    </FormErrorText>
                  )}
                </CustomFormControl>
                <CustomFormControl fullWidth>
                  <InputLabel id="type-label">
                    {getLocaleString("common_table_subplan_type")}
                  </InputLabel>
                  <Select
                    labelId="type-label"
                    id="type-select"
                    label={getLocaleString("common_table_subplan_type")}
                    MenuProps={MenuProps}
                    {...form.getFieldProps("subPlanTypeId")}
                    error={Boolean(
                      form.errors.subPlanTypeId && form.touched.subPlanTypeId
                        ? form.errors.subPlanTypeId
                        : "",
                    )}
                    onChange={(e) => handleChangeSubPlanTypeId(e)}
                  >
                    <MenuItemContainer key="-1" value="" />
                    {availableSubPlanTypes?.map((type) => (
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
                  {Boolean(
                    form.errors.subPlanTypeId && form.touched.subPlanTypeId
                      ? form.errors.subPlanTypeId
                      : "",
                  ) && (
                    <FormErrorText>
                      {getLocaleString("modal_sub_plan_type_required")}
                    </FormErrorText>
                  )}
                </CustomFormControl>
                <CustomFormControl fullWidth>
                  <InputLabel id="section-label">
                    {getLocaleString("common_table_section")}
                  </InputLabel>
                  <Select
                    labelId="section-label"
                    id="section-select"
                    label={getLocaleString("common_table_section")}
                    MenuProps={MenuProps}
                    {...form.getFieldProps("sectionId")}
                    error={Boolean(
                      form.errors.sectionId && form.touched.sectionId
                        ? form.errors.sectionId
                        : "",
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
                  {Boolean(
                    form.errors.sectionId && form.touched.sectionId
                      ? form.errors.sectionId
                      : "",
                  ) && (
                    <FormErrorText>
                      {getLocaleString("modal_section_required")}
                    </FormErrorText>
                  )}
                </CustomFormControl>
                <CustomFormControl fullWidth>
                  <InputLabel id="section-label">
                    {getLocaleString("common_table_subsection")}
                  </InputLabel>
                  <Select
                    labelId="sub-section-label"
                    id="section-sub-select"
                    label={getLocaleString("common_table_subsection")}
                    MenuProps={MenuProps}
                    {...form.getFieldProps("subsectionId")}
                    error={Boolean(
                      form.errors.subsectionId && form.touched.subsectionId
                        ? form.errors.subsectionId
                        : "",
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
                  {Boolean(
                    form.errors.subsectionId && form.touched.subsectionId
                      ? form.errors.subsectionId
                      : "",
                  ) && (
                    <FormErrorText>
                      {getLocaleString("modal_sub_section_required")}
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
                      form.errors.paperSizeId && form.touched.paperSizeId
                        ? form.errors.paperSizeId
                        : "",
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
                  {Boolean(
                    form.errors.paperSizeId && form.touched.paperSizeId
                      ? form.errors.paperSizeId
                      : "",
                  ) && (
                    <FormErrorText>
                      {getLocaleString("modal_paper_size_required")}
                    </FormErrorText>
                  )}
                </CustomFormControl>
                {/*<Grid container className="columns-3 justify-between">*/}
                <Grid container columns={3} justifyContent="space-between">
                  <Grid item xs={1} sx={{ mb: 3, pr: 1 }}>
                    <FormControl fullWidth>
                      <DatePicker
                        sx={{
                          ...(Boolean(
                            form.errors.startDate && form.touched.startDate,
                          )
                            ? {
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "red",
                                },
                              }
                            : {}),
                        }}
                        value={new Date(form.values.startDate)}
                        label={getLocaleString("common_table_start_date")}
                        onChange={(date) => {
                          form.setFieldValue("startDate", date);
                        }}
                        views={["year", "month", "day"]}
                        error={Boolean(
                          form.errors.startDate && form.touched.startDate
                            ? form.errors.startDate
                            : "",
                        )}
                        helperText={getLocaleString(
                          form.errors.startDate && form.touched.startDate
                            ? form.errors.startDate
                            : "",
                        )}
                      />
                      {Boolean(
                        form.errors.startDate && form.touched.startDate,
                      ) && (
                        <FormErrorText>
                          {getLocaleString(
                            form.errors.startDate && form.touched.startDate
                              ? form.errors.startDate
                              : "",
                          )}
                        </FormErrorText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={1} sx={{ mb: 3, px: 1 }}>
                    <FormControl fullWidth>
                      <DatePicker
                        value={new Date(form.values.endDate)}
                        label={getLocaleString("common_table_end_date")}
                        onChange={(date) => {
                          form.setFieldValue("endDate", date);
                        }}
                        views={["year", "month", "day"]}
                        disabled={true}
                      />
                      {Boolean(form.errors.endDate && form.touched.endDate) && (
                        <FormErrorText>
                          {getLocaleString(
                            form.errors.endDate && form.touched.endDate
                              ? form.errors.endDate
                              : "",
                          )}
                        </FormErrorText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={1} sx={{ mb: 3, pl: 1 }}>
                    <FormControl fullWidth>
                      <DatePicker
                        value={new Date(form.values.publishDate)}
                        label={getLocaleString("common_table_publish_date")}
                        onChange={(date) => {
                          form.setFieldValue("publishDate", date);
                        }}
                        views={["year", "month", "day"]}
                        minDate={new Date(form.values.endDate)}
                        error={getLocaleString(
                          form.errors.publishDate && form.touched.publishDate
                            ? form.errors.publishDate
                            : "",
                        )}
                        sx={{
                          ...(Boolean(
                            form.errors.publishDate && form.touched.publishDate,
                          )
                            ? {
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "red",
                                },
                              }
                            : {}),
                        }}
                      />
                      {Boolean(
                        form.errors.publishDate && form.touched.publishDate,
                      ) && (
                        <FormErrorText>
                          {getLocaleString(
                            form.errors.publishDate && form.touched.publishDate
                              ? form.errors.publishDate
                              : "",
                          )}
                        </FormErrorText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
                <StageTable
                  data={data?.stages}
                  onChange={handleStagesChange}
                  disable={false}
                  planStart={form.values.startDate}
                  showRanges={true}
                />
              </FormBox>
              <SubmitButton fullWidth type="submit" variant="contained" disabled={data && !isChanged}>
                {!editing
                  ? getLocaleString("common_create")
                  : getLocaleString("common_save")}
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

export default CreatePlanModal;
