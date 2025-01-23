import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Draggable, Droppable, DragDropContext } from "react-beautiful-dnd";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Modal, Paper, Typography, Button } from "@mui/material";
import { CloseButtonBox, FormContainer } from "../style";
import { StageMode } from "../../../constants";

const ArrangeOrderModal = ({ open, close, onChange, data }) => {
  const { t } = useTranslation();
  const [stages, setStages] = useState([]);
  const getLocaleString = (key) => t(key);

  useEffect(() => {
    // Create a sorted copy of data to avoid mutating the original
    const sortedStages = [...data].sort((a, b) =>
      a.stageMode === "Prescription Mode" ? -1 : 1,
    );
    setStages(sortedStages);
  }, [data]);

  const handleDragEnd = ({ source, destination }) => {
    if (!destination || destination.index === 0) return; // Prevent moving to first position

    const updatedStages = Array.from(stages);
    const [movedItem] = updatedStages.splice(source.index, 1);
    updatedStages.splice(destination.index, 0, movedItem);

    setStages(updatedStages);
  };

  const handleOK = () => {
    onChange(stages);
    close();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      aria-labelledby="arrange-order-modal"
      aria-describedby="modal-to-arrange-order"
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
      >
        <DragDropContext onDragEnd={handleDragEnd}>
          <FormContainer sx={{ width: "30% !important" }}>
            <Typography variant="h5" textAlign="center" mb={2} color="primary">
              {getLocaleString("common_table_arrange_order")}
            </Typography>
            <Typography className="text-center text-lg my-1">
              {getLocaleString("toast_order_rearrange_description")}
            </Typography>
            <Droppable droppableId="droppable">
              {(droppableProvided) => (
                <Box
                  {...droppableProvided.droppableProps}
                  ref={droppableProvided.innerRef}
                >
                  {stages.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                      isDragDisabled={
                        item.stageMode === StageMode.PRESCRIPTIONMODE
                      }
                    >
                      {(draggableProvided) => (
                        <Paper
                          sx={{
                            padding: "0.5rem",
                            marginTop: "0.5rem",
                            cursor: "pointer",
                            backgroundColor:
                              item.stageMode === StageMode.PRESCRIPTIONMODE
                                ? "#d1d5db"
                                : "white",
                          }}
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          {...draggableProvided.dragHandleProps}
                        >
                          {index + 1}. {item.stageMode}
                        </Paper>
                      )}
                    </Draggable>
                  ))}
                  {droppableProvided.placeholder}
                </Box>
              )}
            </Droppable>
            <CloseButtonBox>
              <CloseIcon
                onClick={close}
                role="button"
                aria-label={getLocaleString("common_close")}
              />
            </CloseButtonBox>
            <Box display="flex" justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                onClick={handleOK}
                sx={{ marginTop: "1rem", width: "100%" }}
              >
                {getLocaleString("common_save")}
              </Button>
            </Box>
          </FormContainer>
        </DragDropContext>
      </Box>
    </Modal>
  );
};

export default ArrangeOrderModal;
