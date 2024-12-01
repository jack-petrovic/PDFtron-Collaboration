import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as Yup from "yup";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
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
import { CloseButtonBox, FormContainer } from "../style";
import CheckIcon from "@mui/icons-material/Check";

const validationSchema = Yup.object().shape({
  title: Yup.string().required("modal_title_required"),
  content: Yup.string().required("modal_content_required"),
  approvalStatus: Yup.string().required("modal_status_required"),
});

const CreatePrescriptionModal = ({ data, open, close, create, update }) => {
  const { t } = useTranslation();
  const editing = !!data;
  const id = data?.id;
  const { account } = useAuthState();
  const [text, setText] = useState("");
  const [html, setHtml] = useState("");
  const [content, setContent] = useState({});
  const [masterStatus, setMasterStatus] = useState();
  const [subMasterStatus, setSubMasterStatus] = useState();
  const [disabled, setDisabled] = useState(false);
  const getLocaleString = (key) => t(key);

  const handleSubmit = async (data) => {
    if (disabled) return;
    if (!editing) {
      create(data);
    } else {
      update(id, data);
    }
    form.resetForm();
    setHtml("");
    setText("");
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
    if (data) {
      form.setValues({
        title: data.title,
        content: data.content,
        comment: data.comment || "",
        approvalStatus: data.approvalStatus,
      });
      setContent(JSON.parse(data.content || "{}"));
      setHtml(JSON.parse(data.content)["updated"]?.html || "{}");
      setText(JSON.parse(data.content)["updated"]?.text || "{}");
    } else {
      form.setValues({
        title: "",
        content: "",
        comment: "",
        approvalStatus: "{}",
      });
      setContent(JSON.parse("{}"));
      setHtml("");
      setText("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    const saveData = {};
    const finalData = content;
    saveData["text"] = text;
    saveData["html"] = html;
    if (account.role.name) {
      finalData[account.role.name] = saveData;
    }
    finalData["updated"] = saveData;
    setContent(finalData);
    form.setFieldValue(
      "content",
      JSON.stringify(finalData).replace('"undefined":{},', ""),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, text]);

  const connectionRef = useRef(null);

  useEffect(() => {
    connectionRef.current = new WebSocket(URL_WEB_SOCKET);
    return () => {
      connectionRef.current.close();
    };
  }, []);

  const handleReject = () => {
    const currentStatus = JSON.parse(form.values.approvalStatus || "{}");
    const newStatus = {
      ...currentStatus,
    };
    newStatus[account.role.name] = -1;
    form.setFieldValue("approvalStatus", JSON.stringify(newStatus));
    sendNotification(
      connectionRef.current,
      account.id,
      "notification",
      {
        key: "toast_notification_reject_prescription",
        data: {
          user: account.name,
          prescription: form.getFieldProps("title").value,
        },
      },
      "prescription",
    );
  };

  const handleApprove = () => {
    const currentStatus = JSON.parse(form.values.approvalStatus || "{}");
    const newStatus = {
      ...currentStatus,
    };
    newStatus[account.role.name] = 1;
    form.setFieldValue("approvalStatus", JSON.stringify(newStatus));
    sendNotification(
      connectionRef.current,
      account.id,
      "notification",
      {
        key: "toast_notification_approve_prescription",
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
    const currentComment = form.values.comment;
    const newComment = JSON.parse(currentComment || "{}");
    newComment[account.role.name] = e.target.value;
    form.setFieldValue("comment", JSON.stringify(newComment));
  };

  const handleChangeStatus = (e) => {
    if (e.target.checked) {
      handleApprove();
    } else {
      handleReject();
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
                        <Box mr={1}>Master:</Box>
                        {masterStatus === 1 ? (
                          <CheckIcon sx={{ fontSize: 16 }} />
                        ) : (
                          <CloseIcon sx={{ fontSize: 16 }} />
                        )}
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Box mr={1}>Submaster:</Box>
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
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={disabled}
                  sx={{ textTransform: "capitalize", marginTop: "1rem" }}
                >
                  {editing
                    ? getLocaleString("common_save")
                    : getLocaleString("common_create")}
                </Button>
              )}
            </Box>
          </form>
        </FormContainer>
      </Box>
    </Modal>
  );
};

export default CreatePrescriptionModal;
