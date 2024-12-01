import { SUBSECTION_ACTIONS } from "../action-types";

export const setSubSections = (subSections) => {
  return {
    type: SUBSECTION_ACTIONS.SET_SUBSECTIONS,
    payload: {
      subSections,
    },
  };
};

export const addSubSection = (subSection) => {
  return {
    type: SUBSECTION_ACTIONS.ADD_SUBSECTIONS,
    payload: {
      subSection,
    },
  };
};

export const editSubSection = (subSection) => {
  return {
    type: SUBSECTION_ACTIONS.EDIT_SUBSECTIONS,
    payload: {
      subSection,
    },
  };
};

export const removeSubSection = (id) => {
  return {
    type: SUBSECTION_ACTIONS.DELETE_SUBSECTIONS,
    payload: {
      id,
    },
  };
};
