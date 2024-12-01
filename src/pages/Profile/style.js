import styled from "@emotion/styled";
import { Grid } from "@mui/material";

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
