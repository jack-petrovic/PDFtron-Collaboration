import React from "react";
import { Box, Button, Tooltip } from "@mui/material";
import { differenceInDays } from "date-fns";
import moment from "moment";
import { useTranslation } from "react-i18next";

const PlanGanttTable = ({ plans }) => {
  const { t } = useTranslation();
  const getLocaleString = (key) => t(key);
  const includeDate = (start, end, date) => {
    return (
      differenceInDays(new Date(date), new Date(start)) >= 0 &&
      differenceInDays(new Date(end), new Date(date)) >= 0
    );
  };

  return (
    <Box>
      <Box
        sx={{
          border: "2px solid gray",
          padding: "0",
        }}
      >
        {plans.map((plan, index) => (
          <Box key={index}>
            <Box
              sx={{
                display: "flex",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  width: "10rem",
                  overflow: "hidden",
                  borderRight: "1px solid gray",
                  borderBottom: index !== plans.length - 1 && "1px solid gray",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {plan?.title}
              </Box>
              <Box
                sx={{
                  flexGrow: "1",
                  display: "grid",
                  gridTemplateColumns: "1fr repeat(31, 1fr)",
                }}
              >
                {new Array(31).fill("").map((_, day) => (
                  <Box
                    key={day}
                    sx={{
                      borderRight: "1px solid gray",
                      borderBottom:
                        index !== plans.length - 1 && "1px solid gray",
                      position: "relative",
                    }}
                  >
                    {includeDate(
                      moment(plan?.startDate).format("YYYY-MM-DD").toString(),
                      moment(plan?.endDate).format("YYYY-MM-DD").toString(),
                      moment(`2023-08-${day + 1}`)
                        .format("YYYY-MM-DD")
                        .toString(),
                    ) && (
                      <Tooltip
                        title={`From: ${moment(plan?.startDate).format("YYYY-MM-DD").toString()}
                               To: ${moment(plan?.endDate).format("YYYY-MM-DD").toString()}`}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "102%",
                            height: "50%",
                            backgroundColor: "#1976d2",
                          }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                ))}
                <Box
                  sx={{
                    padding: "0.2rem",
                    borderBottom:
                      index !== plans.length - 1 && "1px solid gray",
                  }}
                >
                  <Button variant="contained" color="primary" size="small">
                    {getLocaleString("common_start")}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          display: "flex",
          width: "100%",
        }}
      >
        <Box
          sx={{
            width: "8rem",
          }}
        />
        <Box
          sx={{
            flexGrow: "1",
            display: "grid",
            gridTemplateColumns: "1fr repeat(31, 1fr)",
          }}
        >
          {new Array(31).fill("").map((_, day) => (
            <Box key={day}>{day + 1}</Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default PlanGanttTable;
