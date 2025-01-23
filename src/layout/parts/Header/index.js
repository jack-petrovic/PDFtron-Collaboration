import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { setNotifications, setSearch } from "../../../redux/actions";
import { useAuthState, useLogout } from "../../../hooks/redux";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  MenuItem,
  Menu,
  Badge,
  Button,
  Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MoreIcon from "@mui/icons-material/MoreVert";
import { NotificationsActive, Notifications } from "@mui/icons-material";
import debounce from "lodash/debounce";
import Sidebar from "../Sidebar";
import {
  clearAllNotifications,
  getCountNotifications,
  getNotifications,
  markAllAsRead,
  readNotification,
  ToastService,
} from "../../../services";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
  AccountMenu,
} from "./style";
import moment from "moment";
import DetailMessageModal from "../../../components/Modal/DetailMessageModal";

const languages = {
  en: {
    title: "English",
    flag: "/assets/img/gb.png",
  },
  de: {
    title: "German",
    flag: "/assets/img/de.png",
  },
  fr: {
    title: "French",
    flag: "/assets/img/fr.png",
  },
};

const Header = () => {
  const dispatch = useDispatch();
  const { account } = useAuthState();
  const logout = useLogout();
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [languageMenuAnchorEl, setLanguageMenuAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [count, setCount] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const isLanguageMenuOpen = Boolean(languageMenuAnchorEl);
  const isNotificationMenuOpen = Boolean(notificationAnchorEl);
  const [searchParams, setSearchParams] = useSearchParams();
  const notifications = useSelector(
    (state) => state.notificationReducer.notifications,
  );
  const navigate = useNavigate();
  const getLocaleString = (key) => t(key);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleLanguageMenuOpen = (event) => {
    setLanguageMenuAnchorEl(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLanguageMenuAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleChangeSearch = (e) => {
    setSearchParams({ key: e.target.value });
    dispatch(setSearch(e.target.value, "contains"));
    saveSearchKeyHandler(e.target.value);
  };

  const saveSearchKeyHandler = (value) => {
    const search = localStorage.getItem("searchKey");
    if (search) {
      const previousKeywords = JSON.parse(search);
      value.length > 0 &&
        !previousKeywords.includes(value) &&
        previousKeywords.push(value);
      value.length > 0 &&
        !searchHistory.includes(value) &&
        setSearchHistory([...searchHistory, value]);
      localStorage.setItem("searchKey", JSON.stringify(previousKeywords));
    } else {
      localStorage.setItem("searchKey", JSON.stringify([`${value}`]));
      setSearchHistory([value]);
    }
  };

  useEffect(() => {
    getNotifications({
      pageSize: 10,
      page: 0,
    })
      .then((res) => {
        dispatch(setNotifications(res.rows));
      })
      .catch((err) => {
        console.log("err=>", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getCountNotifications()
      .then((res) => {
        setCount(res.count);
      })
      .catch((err) => {
        console.log("err=>", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const search = localStorage.getItem("searchKey");
    if (search) {
      setSearchHistory([...JSON.parse(search)]);
    }
  }, []);

  const handleDebounceChangeSearch = debounce(handleChangeSearch, 700);

  useEffect(() => {
    const key = searchParams.get("key");
    if (key) {
      dispatch(setSearch(key, "contains"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gotoProfile = () => {
    navigate("/profile");
    setAnchorEl(null);
  };

  const setLanguage = (lang) => {
    i18n.changeLanguage(lang);
    handleLanguageMenuClose();
  };

  const handleOpenModal = (item) => {
    handleMarkAsRead(item);
    setOpenModal(true);
    setActiveItem(item);
    handleClose();
    handleNotificationMenuClose();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead().then((res) => {
      ToastService.success(getLocaleString(res.message));
    });
    await getNotifications({
      pageSize: 10,
      page: 0,
    }).then((res) => {
      dispatch(setNotifications(res.rows));
    });
    handleNotificationMenuClose();
  };

  const handleClearAll = async () => {
    await clearAllNotifications().then((res) => {
      ToastService.success(getLocaleString(res.message));
    });
    await getNotifications({
      pageSize: 10,
      page: 0,
    }).then((res) => {
      dispatch(setNotifications(res.rows));
    });
    handleNotificationMenuClose();
  };

  const handleViewAll = () => {
    navigate("/notification");
    handleNotificationMenuClose();
  };

  const handleMarkAsRead = async (row) => {
    let query = notifications;
    readNotification(row.id)
      .then(() => {
        query.filter((item) => item.id.includes(row.id))[0].unread = false;
        dispatch(setNotifications([...query]));
      })
      .catch((err) => {
        console.log("err=>", err);
      });
    handleClose();
  };

  const handleLogout = () => {
    navigate("/");
    logout();
  };

  const handleGoToHome = () => {
    navigate("/");
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={gotoProfile} key="profile">
        {getLocaleString("header_profile")}
      </MenuItem>
      <MenuItem onClick={handleLogout} key="log">
        {getLocaleString("header_log_out")}
      </MenuItem>
    </Menu>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
          sx={{
            padding: 0,
            paddingRight: "0.5rem !important",
          }}
        >
          <AccountCircle />
        </IconButton>
        <Typography>{account.name}</Typography>
      </MenuItem>
    </Menu>
  );

  const languageMenuId = "primary-language-menu";
  const renderLanguageMenu = (
    <Menu
      anchorEl={languageMenuAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={languageMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isLanguageMenuOpen}
      onClose={handleLanguageMenuClose}
    >
      {Object.keys(languages).map((language, index) => {
        return (
          <MenuItem
            sx={{
              display: "flex",
              alignItems: "center",
            }}
            key={index}
            onClick={() => setLanguage(language)}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "1.5rem",
                height: "1.5rem",
                marginRight: "0.5rem",
              }}
            >
              <img src={languages[language]?.flag} alt="flag" />
            </Box>
            {languages[language]?.title}
          </MenuItem>
        );
      })}
    </Menu>
  );

  const notificationMenuId = "primary-notification-menu";
  const renderNotificationMenu = (
    <Menu
      anchorEl={notificationAnchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      id={notificationMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      open={isNotificationMenuOpen}
      onClose={handleNotificationMenuClose}
      sx={{ display: "block" }}
    >
      {notifications.length ? (
        <React.Fragment>
          <div className="flex justify-between px-2">
            <Button onClick={handleClearAll}>{getLocaleString("clear")}</Button>
            <Button onClick={handleMarkAllAsRead}>
              {getLocaleString("mark_all_as_read")}
            </Button>
          </div>
          {notifications.map((item, index) => (
            <MenuItem
              key={`menu-${index}`}
              onClick={() => handleOpenModal(item)}
              sx={{
                position: "relative",
                minWidth: "350px",
                maxWidth: "450px",
                paddingX: "12px",
                borderBottom:
                  index === notifications.length - 1
                    ? "none"
                    : "1px solid lightgray",
              }}
            >
              <div className="grid w-full justify-items-stretch">
                <div className="mt-5 justify-self-start">
                  <span
                    id="notification_content"
                    style={{ fontWeight: item.unread ? "bolder" : "lighter" }}
                    title={getLocaleString(JSON.parse(item.content)?.key)}
                  >
                    {t(
                      JSON.parse(item?.content).key,
                      JSON.parse(item?.content).data,
                    )}
                  </span>
                </div>
                <div className="justify-self-end">
                  <span className="text-red-600 text-xs">
                    {moment(item.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                  </span>
                </div>
              </div>
            </MenuItem>
          ))}
          <div className="grid justify-items-stretch px-2">
            <Button onClick={handleViewAll} className="justify-self-end">
              {getLocaleString("view_all")}
            </Button>
          </div>
        </React.Fragment>
      ) : (
        <MenuItem
          sx={{
            position: "relative",
            minWidth: "350px",
            maxWidth: "450px",
            paddingX: "12px",
          }}
          key={notifications.index}
        >
          <div className="grid w-full justify-items-stretch">
            <div className="justify-self-start">
              <span id="notification_content">
                {getLocaleString("common_table_no_message")}
              </span>
            </div>
          </div>
        </MenuItem>
      )}
    </Menu>
  );

  return (
    <Box>
      <AppBar component="nav">
        <Toolbar>
          <Sidebar />
          <Typography
            variant="h6"
            noWrap
            component="div"
            ml={2}
            onClick={handleGoToHome}
            className="hidden sm:block cursor-pointer"
          >
            {getLocaleString("header_title")}
          </Typography>
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder={getLocaleString("header_search")}
                inputProps={{ "aria-label": "search" }}
                onChange={handleDebounceChangeSearch}
              />
            </Search>
          </Box>
          <AccountMenu onClick={handleNotificationMenuOpen} mr={2}>
            <Badge color="secondary" badgeContent={count} max={999}>
              {notifications.length ? (
                <NotificationsActive color="whtie" />
              ) : (
                <Notifications color="white" />
              )}
            </Badge>
          </AccountMenu>
          <AccountMenu onClick={handleLanguageMenuOpen}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "1.5rem",
                height: "1.5rem",
                marginRight: "1rem",
              }}
            >
              <img
                src={languages[i18n.language.substring(0, 2)]?.flag}
                width="100%"
                alt="language"
              />
            </Box>
          </AccountMenu>
          <AccountMenu onClick={handleProfileMenuOpen}>
            <Avatar
              alt={account.name}
              src={process.env.REACT_APP_API_SERVER.replace(
                "api",
                account.avatarUrl,
              )}
              className="mr-2"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              color="inherit"
            />
            <Typography
              sx={{
                display: { xs: "none", md: "flex" },
              }}
            >
              <strong>{account.name}</strong>
            </Typography>
          </AccountMenu>
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
      {renderLanguageMenu}
      {renderNotificationMenu}
      {openModal && (
        <DetailMessageModal
          data={activeItem}
          open={openModal}
          close={handleCloseModal}
        />
      )}
    </Box>
  );
};

export default Header;
