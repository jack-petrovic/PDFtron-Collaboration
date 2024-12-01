import { Box, Modal, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import moment from "moment/moment";
import Divider from "@mui/material/Divider";

const DetailMessageModal = ({ data, open, close }) => {
  const { t } = useTranslation();
  const getLocaleString = (key) => t(key);
  return (
    <Modal
      open={open}
      onClose={close}
      className="justify-self-center content-center"
    >
      <Box
        display="block"
        justifyContent="center"
        className="bg-white w-96 rounded-2xl p-5"
      >
        <Typography style={{ fontSize: "24px" }}>
          {getLocaleString("message_modal_title")}
        </Typography>
        <Divider style={{ marginTop: "10px", marginBottom: "10px" }} />
        <div className="break-all">
          {t(
            JSON.parse(data?.content).key,
            JSON.parse(data?.content).data,
          )}
        </div>
        <div className="grid justify-items-stretch my-5">
          <div className="justify-self-end text-sm">
            {getLocaleString("created_date_label")}{" "}
            {moment(data.createdAt).format("YYYY-MM-DD HH:mm:ss")}
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default DetailMessageModal;
