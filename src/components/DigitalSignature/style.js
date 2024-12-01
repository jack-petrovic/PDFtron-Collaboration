import styled from "@emotion/styled";
import { Box, Button } from "@mui/material";

export const DigitalSignatureSidebar = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 400px;
  border-right: 1px solid #cfd4da;
  background-color: white;
  color: #485056;
`;

export const FileUploadButton = styled(Button)`
  display: flex;
  flex-grow: 1;
  justify-content: center;
  background-color: #e7ebee;
  width: 50%;
  max-width: 50%;
  height: 36px;
  padding: 0 0.5rem;
  font-size: 14px;
  color: #1a4971;
  line-height: 36px;
  cursor: pointer;
  border: none;
  text-transform: capitalize;
  &:hover {
    background-color: #cfd8e0;
    border: none;
  }
`;

export const FileSaveButton = styled(Button)`
  display: flex;
  flex-grow: 1;
  justify-content: center;
  background-color: #3183c8;
  width: 50%;
  max-width: 50%;
  height: 36px;
  padding: 0 0.5rem;
  font-size: 14px;
  color: white;
  line-height: 36px;
  cursor: pointer;
  border: none;
  border-radius: 0;
  text-transform: capitalize;
  &:hover {
    background-color: #1a4971;
    border: none;
  }
`;

export const GetDocumentComponent = styled(Box)`
  padding: 1.25rem;
  padding-top: 0 !important;
  overflow-y: auto;
  height: calc(100vh - 144px);
  ::-webkit-scrollbar {
    width: 6px;
  }
`;
