import { ROLE_ACTIONS } from "../action-types";

const initialState = {
  roles: [],
};

const roleReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case ROLE_ACTIONS.SET_ROLES:
      return {
        ...state,
        roles: payload.roles,
      };

    case ROLE_ACTIONS.ADD_ROLE:
      return {
        ...state,
        roles: [...state.roles, payload.role],
      };

    case ROLE_ACTIONS.DELETE_ROLE:
      return {
        ...state,
        roles: state.roles.filter((role) => role.id !== payload.id),
      };

    case ROLE_ACTIONS.EDIT_ROLE:
      return {
        ...state,
        roles: state.roles.map((role) => {
          if (role.id === payload.role.id) {
            role = payload.role;
          }
          return role;
        }),
      };

    default:
      return state;
  }
};

export default roleReducer;
