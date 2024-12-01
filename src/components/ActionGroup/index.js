import React from "react";
import axios from "axios";
import { Box } from "@mui/material";

const ActionGroup = ({ instance, data = {} }) => {
  const buttonStyle = {
    padding: 0,
    border: 0,
    backgroundColor: "transparent",
    margin: "0 12px",
    cursor: "pointer",
    color: "var(--faded-text)",
    whiteSpace: "nowrap",
    lineHeight: 0,
  };
  const approve = (index) => {
    if (data[`approved${index + 1}`]) return;
    const updatedData = {
      ...data,
      [`approved${index + 1}`]: true,
    };
    axios
      .put(
        `http://localhost:3333/api/live-documents/${data?.documentId}`,
        updatedData,
      )
      .then(() => {
        instance.UI.setHeaderItems((header) => {
          header.pop();
          header.push({
            type: "customElement",
            render: () => (
              <ActionGroup instance={instance} data={updatedData} />
            ),
          });
        });
      })
      .catch((error) => {
        console.error("Error updating approval:", error);
        // Optionally, show a notification to the user
      });
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--ribbons-background)",
        borderRadius: 4,
        height: 28,
        marginLeft: 10,
      }}
    >
      {new Array(4).fill(0).map((_, index) => (
        <button
          key={`button-${index}`}
          onClick={() => approve(index)}
          style={buttonStyle}
          aria-pressed={data[`approved${index + 1}`]}
          tabIndex={0}
        >
          {data[`approved${index + 1}`] ? (
            <svg fill="#868e96" width="18px" height="18px" viewBox="0 0 46 46">
              <g>
                <g>
                  <path d="M23,6c9.374,0,17,7.627,17,17c0,9.375-7.626,17-17,17S6,32.375,6,23C6,13.627,13.626,6,23,6 M23,0C10.298,0,0,10.298,0,23c0,12.703,10.298,23,23,23s23-10.297,23-23C46,10.298,35.702,0,23,0L23,0z" />
                  <g>
                    <path d="M20.887,32.482c-0.609,0.608-1.437,0.951-2.298,0.951c-0.861,0-1.689-0.343-2.298-0.951l-7.122-7.123c-1.269-1.269-1.269-3.327,0-4.596c1.27-1.27,3.327-1.27,4.597,0l4.243,4.242c0.321,0.32,0.84,0.32,1.161,0l11.489-11.489     c1.271-1.27,3.327-1.27,4.597,0c1.27,1.27,1.27,3.327,0,4.597L20.887,32.482z" />
                  </g>
                </g>
              </g>
            </svg>
          ) : (
            "Approve"
          )}
        </button>
      ))}
    </Box>
  );
};

export default ActionGroup;
