import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as Yup from "yup";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Divider,
  FormControlLabel,
  Modal,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import TextComposer from "../../TextComposer";
import { useAuthState } from "../../../hooks/redux";
import { sendNotification } from "../../../utils/helper";
import { URL_WEB_SOCKET, UserRoles } from "../../../constants";
import "react-quill/dist/quill.snow.css";
import { CloseButtonBox, FormContainer, SubmitButton } from "../style";
import CheckIcon from "@mui/icons-material/Check";

const validationSchema = Yup.object().shape({
  title: Yup.string().required("modal_title_required"),
  content: Yup.string().required("modal_content_required"),
  approvalStatus: Yup.string().required("modal_status_required"),
});

const CreatePrescriptionModal = ({ data, open, close, create, update }) => {
  const { t } = useTranslation();
  const editing = Boolean(data);
  const id = data?.id;
  const { account } = useAuthState();
  const [text, setText] = useState("");
  const [html, setHtml] = useState("");
  const [content, setContent] = useState({});
  const [masterStatus, setMasterStatus] = useState();
  const [subMasterStatus, setSubMasterStatus] = useState();
  const [disabled, setDisabled] = useState(false);
  const getLocaleString = (key) => t(key);

  const handleSubmit = async (formData) => {
    if (disabled) return;
    editing ? update(id, formData) : create(formData);
  };

  const form = useFormik({
    validationSchema,
    initialValues: {
      title: "",
      content: "",
      comment: "",
      approvalStatus: "{}",
    },
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    if (data && open) {
      const parsedContent = JSON.parse(data.content || "{}");
      form.setValues({
        title: data.title,
        content: data.content,
        comment: data.comment,
        approvalStatus: data.approvalStatus,
      });
      setContent(parsedContent);
      setHtml(parsedContent["updated"]?.html || "");
      setText(parsedContent["updated"]?.text || "");
    } else {
      form.resetForm();
      setContent({});
      setHtml("");
      setText("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, open]);

  useEffect(() => {
    const finalData = {
      ...content,
      updated: { text, html },
    };
    if (account.role.name) {
      finalData[account.role.name] = { text, html };
    }
    setContent(finalData);
    form.setFieldValue(
      "content",
      JSON.stringify(finalData).replace('"undefined":{},', ""),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, text]);

  const isChanged = useMemo(
    () =>
      (data && (
        form.values.title !== data?.title ||
        form.values.content !== data?.content ||
        form.values.approvalStatus !== data?.approvalStatus ||
        form.values.comment !== data?.comment
      )) || (!data && (
        form.values.title !== "" ||
        form.values.approvalStatus !== "{}" ||
        form.values.comment !== ""
      ))
    , [form.values, data]
  );

  const connectionRef = useRef(null);

  useEffect(() => {
    connectionRef.current = new WebSocket(URL_WEB_SOCKET);
    return () => {
      connectionRef.current.close();
    };
  }, []);

  const updateApprovalStatus = (status) => {
    const currentStatus = JSON.parse(form.values.approvalStatus || "{}");
    currentStatus[account.role.name] = status;
    form.setFieldValue("approvalStatus", JSON.stringify(currentStatus));
    sendNotification(
      connectionRef.current,
      account.id,
      "notification",
      {
        key:
          status === 1
            ? "toast_notification_approve_prescription"
            : "toast_notification_reject_prescription",
        data: {
          user: account.name,
          prescription: form.getFieldProps("title").value,
        },
      },
      "prescription",
    );
  };

  useEffect(() => {
    const status = JSON.parse(form.values.approvalStatus || "{}");
    setMasterStatus(status[UserRoles.MASTER]);
    setSubMasterStatus(status[UserRoles.SUBMASTER]);
  }, [form.values.approvalStatus]);

  const handleChangeComment = (e) => {
    const currentComment = JSON.parse(form.values.comment || "{}");
    currentComment[account.role.name] = e.target.value;
    form.setFieldValue("comment", JSON.stringify(currentComment));
  };

  const handleChangeStatus = (e) => {
    e.target.checked ? updateApprovalStatus(1) : updateApprovalStatus(-1);
  };

  return (
    <Modal open={open} onClose={close}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
      >
        <FormContainer sx={{ width: "75% !important" }}>
          <form onSubmit={form.handleSubmit}>
            <Box display="flex" flexDirection="column" gap="8px">
              <Box>
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
              <Box>
                <TextComposer
                  value={html}
                  onChange={setHtml}
                  text={text}
                  onChangeText={setText}
                  spellCheck
                  disable={false}
                  setDisabled={setDisabled}
                />
              </Box>
              {(account.role.name === UserRoles.MASTER ||
                account.role.name === UserRoles.SUBMASTER) && (
                <Box sx={{ width: "100%", marginTop: "8px" }}>
                  <TextField
                    fullWidth
                    label={getLocaleString("modal_comment_label")}
                    placeholder={getLocaleString("modal_comment_placeholder")}
                    onChange={handleChangeComment}
                    value={
                      JSON.parse(form.values.comment || "{}")[account.role.name]
                    }
                    helperText={getLocaleString(
                      form.errors.comment && form.touched.comment
                        ? form.errors.comment
                        : "",
                    )}
                    error={Boolean(
                      form.errors.comment && form.touched.comment
                        ? form.errors.comment
                        : "",
                    )}
                  />
                  <Box display="flex" alignItems="center" gap="0.5rem" mt={2}>
                    <FormControlLabel
                      control={<Switch />}
                      checked={
                        JSON.parse(form.values.approvalStatus || "{}")[
                          account.role.name
                        ] === 1
                      }
                      label={getLocaleString("document_modal_approve_button")}
                      onChange={handleChangeStatus}
                    />
                  </Box>
                  <Box mt={2}>
                    <Divider />
                    <Typography my="1rem" fontSize="1.5rem" color="primary">
                      {getLocaleString("document_approve_status")}
                    </Typography>
                    <Box>
                      <Box display="flex" alignItems="center">
                        <Box mr={1}>{getLocaleString("Master")}:</Box>
                        {masterStatus === 1 ? (
                          <CheckIcon sx={{ fontSize: 16 }} />
                        ) : (
                          <CloseIcon sx={{ fontSize: 16 }} />
                        )}
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Box mr={1}>{getLocaleString("Sub Master")}:</Box>
                        {subMasterStatus === 1 ? (
                          <CheckIcon sx={{ fontSize: 16 }} />
                        ) : (
                          <CloseIcon sx={{ fontSize: 16 }} />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}

              <CloseButtonBox>
                <CloseIcon onClick={close} />
              </CloseButtonBox>
              {(account.role.name === UserRoles.EDITOR ||
                account.role.name === UserRoles.MASTER ||
                account.role.name === UserRoles.SUBMASTER ||
                !editing) && (
                <SubmitButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={disabled || !isChanged}
                >
                  {getLocaleString("common_submit")}
                </SubmitButton>
              )}
            </Box>
          </form>
        </FormContainer>
      </Box>
    </Modal>
  );
};

export default CreatePrescriptionModal;
