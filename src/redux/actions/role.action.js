import { ROLE_ACTIONS } from "../action-types";

export const setRoles = (roles) => {
  return {
    type: ROLE_ACTIONS.SET_ROLES,
    payload: {
      roles,
    },
  };
};

export const addRole = (role) => {
  return {
    type: ROLE_ACTIONS.ADD_ROLE,
    payload: {
      role,
    },
  };
};

export const removeRole = (id) => {
  return {
    type: ROLE_ACTIONS.DELETE_ROLE,
    payload: {
      id,
    },
  };
};

export const editRole = (role) => {
  return {
    type: ROLE_ACTIONS.EDIT_ROLE,
    payload: {
      role,
    },
  };
};
