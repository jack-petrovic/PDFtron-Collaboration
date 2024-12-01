import React from "react";
import { useSelector } from "react-redux";
import { Stack } from "@mui/material";
import { ToastItem } from "../ToastItem";

export const ToastContainer = () => {
  const toastOptions = useSelector((state) => state.toastReducer.toastOptions);

  return (
    <Stack>
      {toastOptions.map((toast, index) => (
        <ToastItem key={toast.id} index={index} item={toast} />
      ))}
    </Stack>
  );
};
