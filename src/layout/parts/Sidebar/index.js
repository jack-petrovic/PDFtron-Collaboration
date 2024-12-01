import React, { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import DescriptionIcon from "@mui/icons-material/Description";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AutoAwesomeMotionIcon from "@mui/icons-material/AutoAwesomeMotion";
import DvrIcon from "@mui/icons-material/Dvr";
import SendIcon from "@mui/icons-material/Send";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ListAltIcon from "@mui/icons-material/ListAlt";
import TableChart from "@mui/icons-material/TableChart";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import TimeLineIcon from "@mui/icons-material/Timeline";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import PrintIcon from "@mui/icons-material/Print";
import BlockIcon from "@mui/icons-material/Block";
import { useAuthState } from "../../../hooks/redux";
import { UserRoles } from "../../../constants";
import { GiPapers } from "react-icons/gi";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Functions, LocalPrintshop } from "@mui/icons-material";

export default function Sidebar() {
  const navigate = useNavigate();
  const [state, setState] = useState(false);
  const [openedMenu, setOpenedMenu] = useState(null);
  const { t } = useTranslation();
  const { account } = useAuthState();
  const getLocaleString = (key) => t(key);
  const allItems = [
    {
      href: "/",
      text: "sidebar_home",
      icon: <HomeIcon />,
      roles: [
        UserRoles.SUPERADMIN,
        UserRoles.ADMIN,
        UserRoles.SUPERMASTER,
        UserRoles.MASTER,
        UserRoles.SUBMASTER,
        UserRoles.EDITOR,
        UserRoles.CHECKER,
        UserRoles.PLANNER,
        UserRoles.CORRECTOR,
      ],
    },
    {
      href: "/main-flow",
      text: "sidebar_main_flow",
      icon: <SendIcon />,
      roles: [
        UserRoles.SUPERADMIN,
        UserRoles.ADMIN,
        UserRoles.SUPERMASTER,
        UserRoles.MASTER,
        UserRoles.SUBMASTER,
        UserRoles.EDITOR,
        UserRoles.CHECKER,
        UserRoles.PLANNER,
        UserRoles.CORRECTOR,
      ],
    },
    {
      href: "/result",
      text: "sidebar_documents",
      icon: <DescriptionIcon />,
      roles: [
        UserRoles.SUPERMASTER,
        UserRoles.MASTER,
        UserRoles.CHECKER,
        UserRoles.CORRECTOR,
      ],
    },
    {
      href: "/notification",
      text: "notification",
      icon: <NotificationsIcon />,
      roles: [
        UserRoles.SUPERADMIN,
        UserRoles.ADMIN,
        UserRoles.SUPERMASTER,
        UserRoles.MASTER,
        UserRoles.SUBMASTER,
        UserRoles.EDITOR,
        UserRoles.CHECKER,
        UserRoles.PLANNER,
        UserRoles.CORRECTOR,
        UserRoles.PRINTER,
      ],
    },
    {
      text: "sidebar_management",
      icon: <DvrIcon />,
      roles: [
        UserRoles.SUPERADMIN,
        UserRoles.ADMIN,
        UserRoles.SUPERMASTER,
        UserRoles.PLANNER,
        UserRoles.PRINTER,
      ],
      subItems: [
        {
          href: "/management/plan",
          text: "sidebar_plans",
          icon: <DesignServicesIcon />,
          roles: [
            UserRoles.SUPERADMIN,
            UserRoles.ADMIN,
            UserRoles.SUPERMASTER,
            UserRoles.PLANNER,
          ],
        },
        {
          href: "/management/fixed-plan",
          text: "sidebar_fixed_plans",
          icon: <AutoFixHighIcon />,
          roles: [
            UserRoles.SUPERADMIN,
            UserRoles.ADMIN,
            UserRoles.SUPERMASTER,
            UserRoles.PLANNER,
          ],
        },
        {
          href: "/management/paper-size",
          text: "sidebar_paper_size",
          icon: <GiPapers />,
          roles: [UserRoles.SUPERADMIN, UserRoles.ADMIN],
        },
        {
          href: "/management/section",
          text: "sidebar_sections",
          icon: <AutoAwesomeMotionIcon />,
          roles: [UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.SUPERMASTER],
        },
        {
          href: "/management/stage",
          text: "sidebar_stages",
          icon: <ListAltIcon />,
          roles: [
            UserRoles.SUPERADMIN,
            UserRoles.ADMIN,
            UserRoles.SUPERMASTER,
            UserRoles.PLANNER,
          ],
        },
        {
          href: "/management/plan-types",
          text: "sidebar_plan_types",
          icon: <AccountTreeIcon />,
          roles: [
            UserRoles.SUPERADMIN,
            UserRoles.ADMIN,
            UserRoles.SUPERMASTER,
            UserRoles.PLANNER,
          ],
        },
        {
          href: "/management/generation-logs",
          text: "common_generation_logs",
          icon: <TimeLineIcon />,
          roles: [
            UserRoles.SUPERADMIN,
            UserRoles.ADMIN,
            UserRoles.SUPERMASTER,
            UserRoles.PLANNER,
          ],
        },
        {
          href: "/management/users",
          text: "sidebar_users",
          icon: <GroupIcon />,
          roles: [UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.SUPERMASTER],
        },
        {
          href: "/management/user-roles",
          text: "sidebar_user_roles",
          icon: <VerifiedUserIcon />,
          roles: [UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.SUPERMASTER],
        },
        {
          href: "/management/print-request",
          text: "sidebar_print_request",
          icon: <PrintIcon />,
          roles: [UserRoles.PRINTER],
        },
        {
          href: "/management/print-logs",
          text: "sidebar_print_logs",
          icon: <LocalPrintshop />,
          roles: [
            UserRoles.SUPERADMIN,
            UserRoles.ADMIN,
            UserRoles.SUPERMASTER,
            UserRoles.MASTER,
            UserRoles.SUBMASTER,
            UserRoles.EDITOR,
            UserRoles.CHECKER,
            UserRoles.PLANNER,
            UserRoles.PRINTER,
            UserRoles.CORRECTOR,
          ],
        },
        {
          href: "/management/paper-consumption",
          text: "sidebar_paper_consumption",
          icon: <Functions />,
          roles: [
            UserRoles.SUPERADMIN,
            UserRoles.ADMIN,
            UserRoles.SUPERMASTER,
            UserRoles.MASTER,
            UserRoles.SUBMASTER,
            UserRoles.PRINTER,
          ],
        },
        {
          href: "/management/gantt",
          text: "sidebar_gantt_chart",
          icon: <TableChart />,
          roles: [
            UserRoles.SUPERADMIN,
            UserRoles.ADMIN,
            UserRoles.SUPERMASTER,
            UserRoles.PLANNER,
          ],
        },
        {
          href: "/management/prohibited-word",
          text: "sidebar_prohibited_words",
          icon: <BlockIcon />,
          roles: [
            UserRoles.SUPERADMIN,
            UserRoles.ADMIN,
            UserRoles.SUPERMASTER,
            UserRoles.PLANNER,
          ],
        },
        {
          href: "/management/signed-document",
          text: "sidebar_signed_documents",
          icon: <AssignmentIcon />,
          roles: [UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.SUPERMASTER],
        },
      ],
    },
  ];

  const userItems = account
    ? allItems
        .filter((item) => item.roles.includes(account.role?.name))
        .map((item) => {
          if (item.subItems) {
            item.subItems = item.subItems.filter((subItem) =>
              subItem.roles.includes(account.role?.name),
            );
          }
          return item;
        })
    : [];

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setState(open);
  };

  const handleClickMenuItem = (item, e) => {
    if (item.subItems) {
      e.preventDefault();
      e.stopPropagation();
      setOpenedMenu(openedMenu === item.text ? null : item.text);
    } else {
      navigate(item.href);
    }
  };

  const list = () => (
    <Box
      sx={{ width: 300 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {userItems.map((item, index) => (
          <Fragment key={`menu-item-${index}`}>
            <ListItem disablePadding>
              <ListItemButton onClick={(e) => handleClickMenuItem(item, e)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={getLocaleString(item.text)} />
                {item.subItems && (
                  <React.Fragment>
                    {openedMenu === item.text ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )}
                  </React.Fragment>
                )}
              </ListItemButton>
            </ListItem>

            {item.subItems && (
              <Collapse in={openedMenu === item.text} timeout="auto">
                {item.subItems.map((subItem, index) => (
                  <ListItem key={`list-item-${index}`} disablePadding>
                    <ListItemButton
                      onClick={() => handleClickMenuItem(subItem)}
                      sx={{ pl: 4 }}
                    >
                      <ListItemIcon> {subItem.icon}</ListItemIcon>
                      <ListItemText primary={getLocaleString(subItem.text)} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </Collapse>
            )}
          </Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <React.Fragment>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={toggleDrawer(true)}
        edge="start"
        sx={{ mr: 2, ...(state && { display: "none" }) }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer anchor="left" open={state} onClose={toggleDrawer(false)}>
        {list("left")}
      </Drawer>
    </React.Fragment>
  );
}
