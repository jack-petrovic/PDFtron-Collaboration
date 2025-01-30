import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as Yup from "yup";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  CloseButtonBox,
  CustomFormControl,
  FormBox,
  FormContainer,
  SubmitButton,
} from "../style";
import FileDropzone from "../../FileDropzone";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { FileDropzoneContainer } from "./style";
import { PDFDocument } from "pdf-lib";
import { ToastService } from "../../../services";
import { MenuProps, PrintRequestStatus } from "../../../constants";
import { useSelector } from "react-redux";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { FormErrorText } from "../../../pages/style";

const validationSchema = Yup.object().shape({
  title: Yup.string().required("modal_title_required"),
  note: Yup.string().required("modal_notes_required"),
  paperSize: Yup.string().required("modal_paper_size_required"),
  pagesCount: Yup.number().required("modal_pages_count_required"),
  printVolume: Yup.number().required("modal_print_volume_required"),
});

const CreatePrintRequestModal = ({ open, close, create }) => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const paperSizes = useSelector((state) => state.paperSizeReducer.paperSizes);
  const getLocaleString = (key) => t(key);

  const handleSubmit = async (data) => {
    if (file) {
      await create(data, file);
      form.resetForm();
      setFile(null);
    } else {
      ToastService.error(getLocaleString("toast_upload_invalid_live_document"));
    }
  };

  const handleChangeFile = (file) => {
    try {
      if (
        !file ||
        (!file.type.startsWith("application/pdf") &&
          !file.type.startsWith("image/"))
      ) {
        throw new Error(getLocaleString("toast_upload_invalid_live_document"));
      }

      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = async () => {
        const existingFileBytes = fileReader.result;

        // If the file is a PDF
        if (file.type.startsWith("application/pdf")) {
          const pdfDoc = await PDFDocument.load(existingFileBytes);
          const pageCount = pdfDoc.getPageCount();

          setFile(file);
          form.setFieldValue("pagesCount", pageCount);
        }
        // If the file is an image
        else if (file.type.startsWith("image/")) {
          const img = new Image();
          img.src = URL.createObjectURL(file);

          img.onload = () => {
            setFile(file);
            form.setFieldValue("pagesCount", 1);
          };
        }

        form.setFieldValue("fileName", file.name);
      };

      fileReader.onerror = () => {
        ToastService.error(
          getLocaleString("toast_upload_live_document_failed"),
        );
      };
    } catch (err) {
      ToastService.error(getLocaleString("common_network_error"));
    }
  };

  useEffect(() => {
    if (!open) {
      form.resetForm();
      setFile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const form = useFormik({
    validationSchema,
    initialValues: {
      title: "",
      printVolume: 0,
      pagesCount: 0,
      note: "This is manual print request",
      stage: 0,
      status: PrintRequestStatus.PENDING,
      documentId: "",
      section: "",
      subSection: "",
      paperSize: "",
      fileName: "",
      planId: null,
    },
    onSubmit: handleSubmit,
  });

  const isChanged = useMemo(
    () =>
      form.values.title !== "" ||
      form.values.printVolume !== 0 ||
      form.values.note !== "This is manual print request" ||
      form.values.paperSize !== "" ||
      form.values.fileName !== ""
    , [form.values]
  );

  return (
    <Modal open={open} onClose={close}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
      >
        <FormContainer>
          <Typography variant="h6" mb={2}>
            {getLocaleString("document_modal_file_upload")}
          </Typography>
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

          <form onSubmit={form.handleSubmit}>
            <FormBox>
              <Box mb={2}>
                <TextField
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
              </Box>
              <Box mb={2}>
                <TextField
                  fullWidth
                  label={getLocaleString("common_table_note")}
                  placeholder={getLocaleString("modal_note_placeholder")}
                  {...form.getFieldProps("note")}
                  helperText={getLocaleString(
                    form.errors.note && form.touched.note
                      ? form.errors.note
                      : "",
                  )}
                  error={Boolean(
                    form.errors.note && form.touched.note
                      ? form.errors.note
                      : "",
                  )}
                />
              </Box>
              <Box mb={2}>
                <TextField
                  fullWidth
                  label={getLocaleString("common_table_print_volume")}
                  placeholder={getLocaleString(
                    "modal_print_volume_placeholder",
                  )}
                  {...form.getFieldProps("printVolume")}
                  helperText={getLocaleString(
                    form.errors.printVolume && form.touched.printVolume
                      ? form.errors.printVolume
                      : "",
                  )}
                  error={Boolean(
                    form.errors.printVolume && form.touched.printVolume
                      ? form.errors.printVolume
                      : "",
                  )}
                />
              </Box>
              <CustomFormControl fullWidth>
                <InputLabel id="paperSize-label">
                  {getLocaleString("common_table_paper_size")}
                </InputLabel>
                <Select
                  labelId="paperSize-label"
                  id="paperSize-select"
                  label={getLocaleString("common_table_paper_size")}
                  MenuProps={MenuProps}
                  {...form.getFieldProps("paperSize")}
                  onChange={(e) =>
                    form.setFieldValue("paperSize", e.target.value)
                  }
                >
                  {paperSizes?.map((paperSize, index) => (
                    <MenuItem key={index} value={paperSize.name}>
                      {paperSize?.name}
                    </MenuItem>
                  ))}
                </Select>
                {Boolean(form.errors.paperSize && form.touched.paperSize) && (
                  <FormErrorText>
                    {getLocaleString("modal_paper_size_required")}
                  </FormErrorText>
                )}
              </CustomFormControl>
            </FormBox>

            <SubmitButton type="submit" variant="contained" color="primary" disabled={!isChanged}>
              {getLocaleString("common_create")}
            </SubmitButton>
          </form>
          <CloseButtonBox>
            <CloseIcon onClick={close} />
          </CloseButtonBox>
        </FormContainer>
      </Box>
    </Modal>
  );
};

export default CreatePrintRequestModal;
