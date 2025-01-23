import styled from "@emotion/styled";
import {
  Box,
  MenuItem,
  Button,
  TextField,
  FormHelperText,
  Chip,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export const ActionMenuButtonWrapper = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

export const ActionMenuItem = styled(MenuItem)(() => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  padding: "8px 16px",
}));

export const ContentWrapper = styled(Box)(() => ({
  height: "100%",
  backgroundColor: "#f8fafc",
  padding: "2rem 2rem 0 2rem",
}));

export const ContentHeader = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "1.5rem",
}));

export const MenuItemButton = styled(Button)`
  padding-top: 0.2rem;
  padding-bottom: 0.2rem;
  margin: 0.2rem auto;
`;

export const FormTextField = styled(TextField)`
  margin-bottom: 1.5rem;
`;

export const FormErrorText = styled(FormHelperText)`
  color: red;
`;

export const ArchivedIcon = styled(WarningAmberIcon)`
  font-size: 16px;
`;

export const ArchivedChip = styled(Chip)`
  margin-left: 0.5rem;
`;

export const MoreActionsIcon = styled(MoreVertIcon)`
  color: grey;
`;
