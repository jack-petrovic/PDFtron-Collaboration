import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Modal,
  Select,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseIcon from "@mui/icons-material/Close";
import { PDFDocument } from "pdf-lib";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileDropzone from "../../FileDropzone";
import { useAuthState } from "../../../hooks/redux";
import { MenuProps, UserRoles } from "../../../constants";
import { getPlans, ToastService } from "../../../services";
import { CloseButtonBox, FormBox, FormContainer } from "../style";
import { FileDropzoneContainer } from "./style";

const validationSchema = Yup.object().shape({
  owner: Yup.string().required("modal_owner_required"),
  planId: Yup.string().required("modal_planId_required"),
});

const CreateDocumentModal = ({ open, close, data, create }) => {
  const { t } = useTranslation();
  const editing = !!data;
  const [file, setFile] = useState(null);
  const { account } = useAuthState();
  const [statusData, setStatusData] = useState([]);
  const [plans, setPlans] = useState([]);
  const getLocaleString = (key) => t(key);

  const handleSubmit = async (formData) => {
    if (file) {
      await create(formData, file);
    } else {
      ToastService.error(getLocaleString("toast_upload_invalid_live_document"));
    }
  };

  useEffect(() => {
    let query = { pageSize: 100, page: 1 };
    getPlans(query)
      .then((data) => {
        setPlans(data.rows);
      })
      .catch((err) => {
        ToastService.error(
          getLocaleString(
            err.response?.data?.message || "common_network_error",
          ),
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useFormik({
    validationSchema,
    initialValues: {
      fileName: "",
      stage: 1,
      owner: account?.email,
      paperSize: "",
      planId: "",
      pagesCount: 0,
      approvalStatus: "{}",
    },
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    if (data) {
      form.setValues({
        fileName: data.fileName,
        owner: data.owner,
        paperSize: data.paperSize,
        stage: data.stage,
        planId: data.planId,
        pagesCount: data.pagesCount,
        approvalStatus: data.approvalStatus,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const updateApprovalStatus = (status) => {
    const currentStatus = JSON.parse(form.values.approvalStatus);
    const updatedStatus = { ...currentStatus, [account.userId]: status };
    form.setFieldValue("approvalStatus", JSON.stringify(updatedStatus));
  };

  useEffect(() => {
    const status = JSON.parse(form.values.approvalStatus);
    const newData = Object.keys(status).map((key) => ({
      role: key,
      status:
        status[key] === -1 ? ` - ${key} rejected.` : ` - ${key} approved.`,
    }));
    setStatusData(newData);
  }, [form.values.approvalStatus]);

  const handleChangePlanId = (e) => {
    const selectedPlan = plans.find((plan) => plan.id === e.target.value);
    form.setFieldValue("planId", e.target.value);
    form.setFieldValue("stage", selectedPlan.currentStage);
    form.setFieldValue("paperSize", selectedPlan.paper_size.name);
  };

  const handleChangeFile = (file) => {
    if (!file || file.type !== "application/pdf") {
      return ToastService.error(
        getLocaleString("toast_upload_invalid_live_document"),
      );
    }

    const fileReader = new FileReader();
    fileReader.onload = async () => {
      const existingPdfBytes = fileReader.result;
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pageCount = pdfDoc.getPageCount();

      setFile(file);
      form.setFieldValue("pagesCount", pageCount);
      form.setFieldValue("fileName", file.name);
    };

    fileReader.onerror = () => {
      ToastService.error(getLocaleString("toast_upload_live_document_failed"));
    };

    fileReader.readAsArrayBuffer(file);
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
          <Typography variant="h5" textAlign="center" mb={2} color="primary">
            {!editing
              ? getLocaleString("document_create_modal_title")
              : getLocaleString("document_edit_modal_title")}
          </Typography>
          {!file && !editing ? (
            <Typography variant="h6" mb={2}>
              {getLocaleString("document_modal_file_upload")}
            </Typography>
          ) : (
            <Typography variant="h6" mb={1}>
              {getLocaleString("document_modal_file")}
            </Typography>
          )}
          {editing && !file && (
            <Box display="flex" alignItems="center" mb={2}>
              <PictureAsPdfIcon />
              <Typography variant="body1" ml={1}>
                {form.values.fileName}
              </Typography>
            </Box>
          )}
          {file ? (
            <Box display="flex" alignItems="center" mb={2}>
              <PictureAsPdfIcon />
              <Typography variant="body1" ml={1}>
                {form.values.fileName}
              </Typography>
            </Box>
          ) : (
            <FileDropzone file={file} onChange={handleChangeFile}>
              <FileDropzoneContainer>
                <FileDownloadIcon color="#bbb" cursor="pointer" />
              </FileDropzoneContainer>
            </FileDropzone>
          )}
          <form onSubmit={form.handleSubmit} encType="multipart/form-data">
            <FormBox>
              <FormControl
                fullWidth
                sx={{ marginBottom: "1rem", maxHeight: "100px" }}
              >
                <InputLabel id="plan-label">
                  {getLocaleString("common_table_plan")}
                </InputLabel>
                <Select
                  labelId="plan-label"
                  id="plan-select"
                  label={getLocaleString("common_table_plan")}
                  MenuProps={MenuProps}
                  {...form.getFieldProps("planId")}
                  onChange={handleChangePlanId}
                >
                  {plans.map((plan) => (
                    <MenuItem key={plan.id} value={plan.id}>
                      {plan.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label={getLocaleString("common_table_owner")}
                placeholder={getLocaleString("modal_owner_placeholder")}
                {...form.getFieldProps("owner")}
                helperText={getLocaleString(
                  form.errors.owner && form.touched.owner
                    ? form.errors.owner
                    : "",
                )}
                error={Boolean(form.errors.owner && form.touched.owner)}
                sx={{ mb: 3 }}
              />
              {(account.role.name === UserRoles.MASTER ||
                account.role.name === UserRoles.SUPERMASTER) && (
                <React.Fragment>
                  <Box display="flex" gap="0.5rem">
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={
                        JSON.parse(form.values.approvalStatus)[
                          account.role.name
                        ] === 1
                      }
                      onClick={() => updateApprovalStatus(1)}
                    >
                      {getLocaleString("document_modal_approve_button")}
                    </Button>
                    <Button
                      variant="contained"
                      color="warning"
                      disabled={
                        JSON.parse(form.values.approvalStatus)[
                          account.role.name
                        ] === -1
                      }
                      onClick={() => updateApprovalStatus(-1)}
                    >
                      {getLocaleString("document_modal_reject_button")}
                    </Button>
                  </Box>
                  <Box>
                    <Divider />
                    <Typography my="1rem" fontSize="1.5rem" color="primary">
                      {getLocaleString("document_approve_status")}
                    </Typography>
                    <Box>
                      {statusData.map((item, index) => (
                        <Typography
                          key={index}
                          color={
                            item.role === account.role.name ? "error" : "black"
                          }
                        >
                          {item.status}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                </React.Fragment>
              )}
            </FormBox>
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

export default CreateDocumentModal;
