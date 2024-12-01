export const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 200,
    },
  },
};

export const weekLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const dayLabels = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31,
];

export const UserRoles = {
  SUPERADMIN: "Super Admin",
  ADMIN: "Admin",
  SUPERMASTER: "Super Master",
  MASTER: "Master",
  SUBMASTER: "Sub Master",
  EDITOR: "Editor",
  CHECKER: "Checker",
  PLANNER: "Planner",
  PRINTER: "Printer",
  CORRECTOR: "Corrector",
};

export const StageMode = {
  PRESCRIPTIONMODE: "Prescription Mode",
};

export const PrintRequestStatus = {
  PENDING: "Pending",
  PROGRESS: "In progress",
  DONE: "Done",
};

export const TABLE_FIELDS = [
  {
    label: "Date",
    key: "date",
    maxWidth: 100,
  },
  {
    label: "Type1",
    key: "type1",
  },
  {
    label: "Type2",
    key: "type2",
  },
  {
    label: "Type3",
    key: "type3",
  },
  {
    label: "Type4",
    key: "type4",
  },
];
