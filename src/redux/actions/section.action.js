import { SECTION_ACTIONS } from "../action-types";

export const setSections = (sections) => {
  return {
    type: SECTION_ACTIONS.SET_SECTIONS,
    payload: {
      sections,
    },
  };
};

export const addSection = (section) => {
  return {
    type: SECTION_ACTIONS.ADD_SECTION,
    payload: {
      section,
    },
  };
};

export const removeSection = (id) => {
  return {
    type: SECTION_ACTIONS.DELETE_SECTION,
    payload: {
      id,
    },
  };
};

export const editSection = (section) => {
  return {
    type: SECTION_ACTIONS.EDIT_SECTION,
    payload: {
      section,
    },
  };
};
