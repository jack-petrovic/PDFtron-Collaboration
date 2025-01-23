import React from "react";
import axios from "axios";
import store from "../redux/store";
import { showToast } from "../redux/actions";
import { Box, Stack, Typography } from "@mui/material";

export class ToastService {
  static success(message, options) {
    ToastService.show({
      ...options,
      message,
      severity: "success",
    });
  }

  static info(message, options) {
    ToastService.show({
      ...options,
      message,
      severity: "info",
    });
  }

  static warning(message, options) {
    ToastService.show({
      ...options,
      message,
      severity: "warning",
    });
  }

  static error(message, options) {
    ToastService.show({
      ...options,
      message,
      severity: "error",
    });
  }

  static show(options) {
    store.dispatch(showToast(options));
  }

  static showHttpError(err, defaultMessage) {
    if (!axios.isAxiosError(err)) {
      ToastService.error(err?.message || defaultMessage);
      return;
    }

    const response = err?.response;
    const data = response?.data;

    if (!response) {
      ToastService.error("Network Error!");
      return;
    }

    if (!data) {
      ToastService.error(`${response.status} error - ${response.statusText}`);
      return;
    }

    if (typeof data !== "object") {
      ToastService.error(data);
      return;
    }

    if (data.message) {
      ToastService.error(data.message);
      return;
    }

    if (response.status === 400 && !data.message) {
      const message = (
        <Box>
          <Typography sx={{ fontWeight: "bold" }}>Bad Request!</Typography>
          {Object.entries(data).map(([key, value]) => (
            <Stack direction="row" alignItems="center" key={key}>
              {key !== "non_field_errors" && (
                <Typography
                  sx={{
                    fontWeight: "semibold",
                    flexShrink: 0,
                    marginRight: "4px",
                  }}
                >
                  {key}:
                </Typography>
              )}
              <Box>
                {Array.isArray(value) ? (
                  <React.Fragment>
                    {value.map((msg, index) => (
                      <Typography variant="body1" key={index}>
                        {msg}
                      </Typography>
                    ))}
                  </React.Fragment>
                ) : (
                  value
                )}
              </Box>
            </Stack>
          ))}
        </Box>
      );
      ToastService.error(message);
      return;
    }
    ToastService.error(defaultMessage);
  }
}
