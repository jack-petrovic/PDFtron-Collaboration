import styled from "@emotion/styled";
import { Grid, IconButton, TextField } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

export const ProfileContainer = styled(Grid)(() => ({
  flex: 1,

  ".avatar-section": {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRight: "1px solid #dddddd",
    padding: "30px",

    ".avatar": {
      width: 150,
      height: 150,
      backgroundColor: '#D9D9D9',
      cursor: 'pointer',
    },

    ".name": {
      fontWeight: "bold",
      marginTop: 10,
    },

    ".email": {
      color: "#868e96",
    },

    ".user-id": {
      fontWeight: "bold",
    },
  },

  ".content": {
    padding: "40px 25px",

    ".title": {
      fontSize: 34,
      fontWeight: "medium",
      marginBottom: 20,
    },

    ".actions": {
      display: "flex",
      justifyContent: "flex-end",
    },
  },
}));

export const FormTextField = styled(TextField)`
  margin-bottom: 1.5rem;
`;

export const ImageRemoveButton = styled(IconButton)`
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  width: 2rem;
  height: 2rem;
  border-radius: 2rem;
  background-color: white;
  color: lightgrey;
  border: 3px solid lightgrey;
  
  &:focus, :hover {
    background-color: white;
  };
`;

export const ImageSaveButton = styled(LoadingButton)`
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  width: 2rem;
  height: 2rem;
  border-radius: 2rem;
  padding: 2px 1px 2px 2px;
  min-width: 0;
  background-color: white;
  color: lightgrey;
  border: 3px solid lightgrey;

  &:focus, :hover {
    background-color: white;
  };
`;
