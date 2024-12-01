import { get, post, put, remove } from "./http.service";
import { v4 as uuidv4 } from "uuid";

export const uploadDocument = (data, showSpinner = true) => {
  const form = new FormData();
  form.append("documentId", uuidv4());
  form.append("file", data.file);
  return post("/document/upload", form, {}, showSpinner);
};

export const createDocument = (data, showSpinner = true) => {
  const form = new FormData();
  form.append("documentId", uuidv4());
  form.append("fileName", data.fileName);
  form.append("planId", data.planId);
  form.append("stage", data.stage);
  form.append("owner", data.owner);
  form.append("approvalStatus", data.approvalStatus);
  form.append("file", data.file);
  form.append("type", data.type);
  form.append("pagesCount", data.pagesCount);
  return post("/document/create", form, {}, showSpinner);
};

export const updateDocument = (id, data, showSpinner = true) => {
  return put(`/document/${id}`, data, {}, showSpinner);
};

export const getDocuments = (query = {}, showSpinner = true) => {
  return get("/document", query, {}, showSpinner);
};

export const getDocumentUrl = (id, showSpinner = true) => {
  return get(`/document/url/${id}`, {}, showSpinner);
};

export const getDocument = (id, showSpinner = true) => {
  return get(`/document/${id}`, {}, showSpinner);
};

export const getAnnotationsByDocument = (id, showSpinner = true) => {
  return get(`/document/${id}/annotations`, {}, showSpinner);
};

export const getDocumentDownload = (id, showSpinner = true) => {
  return get(`/document/${id}/download`, {}, showSpinner);
};

export const getDocumentByPlanStage = (planId, stage, showSpinner = true) => {
  return get(`/document/${planId}/${stage}`, {}, showSpinner);
};

export const deleteDocument = (id, showSpinner = true) => {
  return remove(`/document/${id}`, {}, showSpinner);
};
