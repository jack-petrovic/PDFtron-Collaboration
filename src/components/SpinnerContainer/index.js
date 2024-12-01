import React from "react";
import { useSelector } from "react-redux";
import { CircularProgress } from "@mui/material";
import { SpinnerBox } from "./style";

export const SpinnerContainer = () => {
  const loadingCount = useSelector(
    (state) => state.spinnerReducer.loadingCount,
  );

  return (
    <React.Fragment>
      {loadingCount > 0 && (
        <SpinnerBox>
          <CircularProgress sx={{ color: "#0B1C34" }} />
        </SpinnerBox>
      )}
    </React.Fragment>
  );
};
