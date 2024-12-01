import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  setNotifications,
  setPaperSizes,
  setPlanTypes,
  setRoles,
  setSections,
  setStages,
  setSubPlanTypes,
  setSubSections,
} from "../../redux/actions";
import {
  getRoles,
  getSections,
  getStages,
  getSubSections,
  getSubPlanTypes,
  getTypes,
  getNotifications,
  ToastService,
} from "../../services";
import Header from "../parts/Header";
import { URL_WEB_SOCKET } from "../../constants";
import { AppContainer } from "./style.js";
import { getPaperSizes } from "../../services/management/paperSize.service";
import { useTranslation } from "react-i18next";

const FullLayout = ({ children }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const getLocaleString = (key) => t(key);

  useEffect(() => {
    getSections()
      .then((res) => {
        dispatch(setSections(res.rows));
      })
      .catch((err) => {
        console.log("err=>", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getSubSections()
      .then((res) => {
        dispatch(setSubSections(res.rows));
      })
      .catch((err) => {
        console.log("err=>", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getTypes()
      .then((res) => {
        dispatch(setPlanTypes(res.rows));
      })
      .catch((err) => {
        console.log("err=>", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getPaperSizes()
      .then((res) => {
        dispatch(setPaperSizes(res.rows));
      })
      .catch((err) => {
        console.log("err=>", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getSubPlanTypes()
      .then((res) => {
        dispatch(setSubPlanTypes(res.rows));
      })
      .catch((err) => {
        console.log("err=>", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getStages()
      .then((res) => {
        dispatch(setStages(res.rows));
      })
      .catch((err) => {
        console.log("err=>", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getRoles()
      .then((res) => {
        dispatch(setRoles(res.rows));
      })
      .catch((err) => {
        console.log("err=>", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getNotifications({
      pageSize: 10,
      page: 1,
    })
      .then((res) => {
        dispatch(setNotifications(res.rows));
      })
      .catch((err) => {
        console.log("err=>", err);
        ToastService.error(
          getLocaleString(
            err.response?.data?.message || "common_network_error",
          ),
        );
      });

    const connection = new WebSocket(URL_WEB_SOCKET);
    connection.onmessage = async (message) => {
      if (message.data === "refresh") {
        await getNotifications({
          pageSize: 10,
          page: 1,
        })
          .then((res) => {
            dispatch(setNotifications(res.rows));
          })
          .catch((err) => {
            console.log("err=>", err);
            ToastService.error(
              getLocaleString(
                err.response?.data?.message || "common_network_error",
              ),
            );
          });
      }
    };
    return () => connection.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppContainer>
      <Header />
      {children}
    </AppContainer>
  );
};
export default FullLayout;
