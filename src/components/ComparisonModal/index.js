import React from "react";
import { useTranslation } from "react-i18next";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "25%",
  height: "25%",
  backgroundColor: "white",
  border: "none",
  borderRadius: 4,
  boxShadow: 24,
  zIndex: 20,
};

const ComparisonModal = ({ open, data, closeModal }) => {
  const { t } = useTranslation();
  const getLocaleString = (key) => t(key);

  const modalContent = [
    { label: "comparison_modal_total", value: data.total || 0 },
    { label: "comparison_modal_insert", value: data.inserted || 0 },
    { label: "comparison_modal_edit", value: data.edited || 0 },
    { label: "comparison_modal_delete", value: data.deleted || 0 },
  ];

  return (
    <Box>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={closeModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <Typography
              variant="h5"
              sx={{
                textAlign: "center",
                padding: "1rem",
                borderBottom: "1px solid #36414F",
              }}
            >
              {getLocaleString("comparison_modal_title")}
            </Typography>
            {modalContent.map(({ label, value }) => (
              <Box display="flex" alignItems="center" px={6} pt={2} key={label}>
                <Typography>
                  {getLocaleString(label)}: {value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default ComparisonModal;
