import React, { lazy, Suspense, useEffect } from "react";
import { useRoutes, Navigate, useNavigate } from "react-router-dom";
import { useAuthState, useSetRedirectTo } from "../hooks/redux";
import { createTheme, ThemeProvider } from "@mui/material";
import AuthProvider from "../providers/AuthProvider";
import FullLayout from "../layout/FullLayout";
import AuthLayout from "../layout/AuthLayout";
import { ToastContainer } from "../components/ToastContainer";
import { SpinnerContainer } from "../components/SpinnerContainer";
import { UserRoles } from "../constants";

const HomePage = lazy(() =>
  import("../pages/Home").then((p) => ({ default: p.default })),
);
const UserPage = lazy(() =>
  import("../pages/Management/User").then((p) => ({ default: p.default })),
);
const DocumentPage = lazy(() =>
  import("../pages/Management/Document").then((p) => ({ default: p.default })),
);
const NotificationPage = lazy(() =>
  import("../pages/Notification").then((p) => ({ default: p.default })),
);
const DocumentDetailsPage = lazy(() =>
  import("../pages/Management/DocumentDetails").then((p) => ({
    default: p.default,
  })),
);
const ComparePage = lazy(() =>
  import("../pages/Compare").then((p) => ({ default: p.default })),
);
const SignaturePage = lazy(() =>
  import("../pages/Signature").then((p) => ({ default: p.default })),
);
const SectionPage = lazy(() =>
  import("../pages/Management/Section").then((p) => ({ default: p.default })),
);
const SubSectionPage = lazy(() =>
  import("../pages/Management/SubSection").then((p) => ({
    default: p.default,
  })),
);
const SignedDocumentPage = lazy(() =>
  import("../pages/Management/SignedDocument").then((p) => ({
    default: p.default,
  })),
);
const LoginPage = lazy(() =>
  import("../pages/Login").then((p) => ({ default: p.default })),
);
const RegisterPage = lazy(() =>
  import("../pages/Register").then((p) => ({ default: p.default })),
);
const TextComparePage = lazy(() =>
  import("../pages/TextCompare").then((p) => ({ default: p.default })),
);
const DemoPage = lazy(() =>
  import("../pages/Demo/Demo").then((p) => ({ default: p.default })),
);
const PlanPage = lazy(() =>
  import("../pages/Management/Plan").then((p) => ({ default: p.default })),
);
const FixedPlanPage = lazy(() =>
  import("../pages/Management/FixedPlan").then((p) => ({ default: p.default })),
);
const MainFlowPage = lazy(() =>
  import("../pages/MainFlow").then((p) => ({ default: p.default })),
);
const PlanStatus = lazy(() =>
  import("../pages/Management/PlanStatus").then((p) => ({
    default: p.default,
  })),
);
const StagePage = lazy(() =>
  import("../pages/Management/Stage").then((p) => ({ default: p.default })),
);
const PlanTypePage = lazy(() =>
  import("../pages/Management/PlanType").then((p) => ({ default: p.default })),
);
const GanttPage = lazy(() =>
  import("../pages/Management/Gantt").then((p) => ({ default: p.default })),
);
const GenerationLogsPage = lazy(() =>
  import("../pages/Management/GenerationLog").then((p) => ({
    default: p.default,
  })),
);
const UserRolePage = lazy(() =>
  import("../pages/Management/UserRole").then((p) => ({ default: p.default })),
);
const PrescriptionPage = lazy(() =>
  import("../pages/Management/Prescription").then((p) => ({
    default: p.default,
  })),
);
const DocumentComparePage = lazy(() =>
  import("../pages/Management/DocumentCompare").then((p) => ({
    default: p.default,
  })),
);
const PrintRequestPage = lazy(() =>
  import("../pages/Management/PrintRequest").then((p) => ({
    default: p.default,
  })),
);
const CollaborationPage = lazy(() =>
  import("../pages/Management/Collaboration").then((p) => ({
    default: p.default,
  })),
);
const ProhibitedWordPage = lazy(() =>
  import("../pages/Management/ProhibitedWords").then((p) => ({
    default: p.default,
  })),
);
const subPlanTypePage = lazy(() =>
  import("../pages/Management/SubPlanType").then((p) => ({
    default: p.default,
  })),
);
const PaperSizePage = lazy(() =>
  import("../pages/Management/PaperSize").then((p) => ({ default: p.default })),
);
const ProfilePage = lazy(() =>
  import("../pages/Profile").then((p) => ({ default: p.default })),
);
const PrintLogsPage = lazy(() =>
  import("../pages/Management/PrintLogs").then((p) => ({ default: p.default })),
);
const PaperManagementPage = lazy(() =>
  import("../pages/Management/PaperManagement").then((p) => ({
    default: p.default,
  })),
);
const PreviewDocumentPage = lazy(() =>
  import("../pages/Management/Preview").then((p) => ({ default: p.default })),
);

const AppRoute = ({ component: Component }) => (
  <Suspense fallback={null}>
    <Component />
  </Suspense>
);

const theme = createTheme({
  typography: {
    fontFamily: "sans-serif",
  },
});

const AppRoutes = () => {
  const { account, redirectTo } = useAuthState();

  const allRoutes = [
    {
      path: "/",
      element: <AppRoute component={HomePage} />,
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
      path: "/result",
      element: <AppRoute component={DocumentPage} />,
      roles: [
        UserRoles.SUPERMASTER,
        UserRoles.MASTER,
        UserRoles.CHECKER,
        UserRoles.CORRECTOR,
      ],
    },
    {
      path: "/result/:documentId",
      element: <AppRoute component={DocumentDetailsPage} />,
      roles: [
        UserRoles.SUPERMASTER,
        UserRoles.MASTER,
        UserRoles.EDITOR,
        UserRoles.CHECKER,
        UserRoles.CORRECTOR,
      ],
    },
    {
      path: "/main-flow",
      element: <AppRoute component={MainFlowPage} />,
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
      path: "/main-flow/plan/:id",
      element: <AppRoute component={PlanStatus} />,
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
      path: "/notification",
      element: <AppRoute component={NotificationPage} />,
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
      path: "/collaborate/:documentId",
      element: <AppRoute component={CollaborationPage} />,
      roles: [
        UserRoles.SUPERADMIN,
        UserRoles.ADMIN,
        UserRoles.SUPERMASTER,
        UserRoles.MASTER,
        UserRoles.SUBMASTER,
        UserRoles.EDITOR,
        UserRoles.CHECKER,
        UserRoles.CORRECTOR,
        UserRoles.PRINTER,
      ],
    },
    {
      path: "/preview/:documentId",
      element: <AppRoute component={PreviewDocumentPage} />,
      roles: [UserRoles.PRINTER],
    },
    {
      path: "/management/users",
      element: <AppRoute component={UserPage} />,
      roles: [UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.SUPERMASTER],
    },
    {
      path: "/management/paper-size",
      element: <AppRoute component={PaperSizePage} />,
      roles: [UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.SUPERMASTER],
    },
    {
      path: "/management/section",
      element: <AppRoute component={SectionPage} />,
      roles: [UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.SUPERMASTER],
    },
    {
      path: "/management/section/:id",
      element: <AppRoute component={SubSectionPage} />,
      roles: [UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.SUPERMASTER],
    },
    {
      path: "/management/signed-document",
      element: <AppRoute component={SignedDocumentPage} />,
      roles: [UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.SUPERMASTER],
    },
    {
      path: "/compare",
      element: <AppRoute component={ComparePage} />,
      roles: [UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.SUPERMASTER],
    },
    {
      path: "/signature",
      element: <AppRoute component={SignaturePage} />,
      roles: [UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.SUPERMASTER],
    },
    {
      path: "/login",
      element: <Navigate to="/" replace />,
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
      path: "/demo",
      element: <AppRoute component={DemoPage} />,
      roles: [UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.SUPERMASTER],
    },
    {
      path: "/text-compare",
      element: <AppRoute component={TextComparePage} />,
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
      path: "/management/plan",
      element: <AppRoute component={PlanPage} />,
      roles: [
        UserRoles.SUPERADMIN,
        UserRoles.ADMIN,
        UserRoles.SUPERMASTER,
        UserRoles.PLANNER,
      ],
    },
    {
      path: "/management/plan-types/:id",
      element: <AppRoute component={subPlanTypePage} />,
      roles: [
        UserRoles.SUPERADMIN,
        UserRoles.ADMIN,
        UserRoles.SUPERMASTER,
        UserRoles.PLANNER,
      ],
    },
    {
      path: "/management/fixed-plan",
      element: <AppRoute component={FixedPlanPage} />,
      roles: [
        UserRoles.SUPERADMIN,
        UserRoles.ADMIN,
        UserRoles.SUPERMASTER,
        UserRoles.PLANNER,
      ],
    },
    {
      path: "/management/stage",
      element: <AppRoute component={StagePage} />,
      roles: [
        UserRoles.SUPERADMIN,
        UserRoles.ADMIN,
        UserRoles.SUPERMASTER,
        UserRoles.PLANNER,
      ],
    },
    {
      path: "/management/plan-types",
      element: <AppRoute component={PlanTypePage} />,
      roles: [
        UserRoles.SUPERADMIN,
        UserRoles.ADMIN,
        UserRoles.SUPERMASTER,
        UserRoles.PLANNER,
      ],
    },
    {
      path: "/management/generation-logs",
      element: <AppRoute component={GenerationLogsPage} />,
      roles: [
        UserRoles.SUPERADMIN,
        UserRoles.ADMIN,
        UserRoles.SUPERMASTER,
        UserRoles.PLANNER,
      ],
    },
    {
      path: "/management/user-roles",
      element: <AppRoute component={UserRolePage} />,
      roles: [UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.SUPERMASTER],
    },
    {
      path: "/management/print-request",
      element: <AppRoute component={PrintRequestPage} />,
      roles: [UserRoles.PRINTER],
    },
    {
      path: "/management/print-logs",
      element: <AppRoute component={PrintLogsPage} />,
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
      path: "management/paper-consumption",
      element: <AppRoute component={PaperManagementPage} />,
      roles: [UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.PRINTER],
    },
    {
      path: "/main-flow/plan/:id/prescriptions",
      element: <AppRoute component={PrescriptionPage} />,
      roles: [
        UserRoles.SUPERADMIN,
        UserRoles.ADMIN,
        UserRoles.SUPERMASTER,
        UserRoles.MASTER,
        UserRoles.SUBMASTER,
        UserRoles.EDITOR,
      ],
    },
    {
      path: "/main-flow/plan/:id/compare/:documentId",
      element: <AppRoute component={DocumentComparePage} />,
      roles: [
        UserRoles.SUPERADMIN,
        UserRoles.ADMIN,
        UserRoles.SUPERMASTER,
        UserRoles.PLANNER,
      ],
    },
    {
      path: "/management/gantt",
      element: <AppRoute component={GanttPage} />,
      roles: [
        UserRoles.SUPERADMIN,
        UserRoles.ADMIN,
        UserRoles.SUPERMASTER,
        UserRoles.PLANNER,
      ],
    },
    {
      path: "/management/prohibited-word",
      element: <AppRoute component={ProhibitedWordPage} />,
      roles: [
        UserRoles.SUPERADMIN,
        UserRoles.ADMIN,
        UserRoles.SUPERMASTER,
        UserRoles.PLANNER,
      ],
    },
    {
      path: "/main-flow/plan/:planId/prescriptions/:prescriptionId/compare",
      element: <AppRoute component={TextComparePage} />,
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
      path: "/profile",
      element: <AppRoute component={ProfilePage} />,
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
  ];

  const userRoutes = useRoutes(
    account
      ? allRoutes.filter((route) => route.roles.includes(account.role?.name))
      : [],
  );

  const authRoutes = useRoutes([
    {
      path: "/login",
      element: <AppRoute component={LoginPage} />,
    },
    {
      path: "/register",
      element: <AppRoute component={RegisterPage} />,
    },
    {
      path: "*",
      element: <Navigate to="/login" replace />,
    },
  ]);

  const navigate = useNavigate();
  const setRedirectTo = useSetRedirectTo();

  useEffect(() => {
    if (account && redirectTo && redirectTo !== "/login") {
      setRedirectTo("");
      navigate(redirectTo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, redirectTo]);

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        {account !== undefined && (
          <React.Fragment>
            {account ? (
              <FullLayout>{userRoutes}</FullLayout>
            ) : (
              <AuthLayout>{authRoutes}</AuthLayout>
            )}
          </React.Fragment>
        )}
      </AuthProvider>
      <ToastContainer />
      <SpinnerContainer />
    </ThemeProvider>
  );
};

export default AppRoutes;
