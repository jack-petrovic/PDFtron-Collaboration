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

  const fetchData = async (fetchFunction, action) => {
    const res = await fetchFunction();
    if (res.rows) {
      dispatch(action(res.rows));
    } else {
      throw new Error(getLocaleString("common_network_error"));
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([
        fetchData(getSections, setSections),
        fetchData(getSubSections, setSubSections),
        fetchData(getTypes, setPlanTypes),
        fetchData(getPaperSizes, setPaperSizes),
        fetchData(getSubPlanTypes, setSubPlanTypes),
        fetchData(getRoles, setRoles),
        fetchData(getStages, setStages),
      ]);
    };

    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      const res = await getNotifications({ pageSize: 10, page: 0 });
      dispatch(setNotifications(res.rows));
    };

    fetchNotifications();

    const connection = new WebSocket(URL_WEB_SOCKET);
    connection.onmessage = async (message) => {
      if (message.data === "refresh") {
        await fetchNotifications();
      }
    };

    return () => {
      connection.close();
    };
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
