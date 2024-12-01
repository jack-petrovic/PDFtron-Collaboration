import { SUBSECTION_ACTIONS } from "../action-types";

const initialState = {
  subSections: [],
};

const subSectionReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case SUBSECTION_ACTIONS.SET_SUBSECTIONS:
      return {
        ...state,
        subSections: payload.subSections,
      };

    case SUBSECTION_ACTIONS.ADD_SUBSECTIONS:
      return {
        ...state,
        subSections: [...state.subSections, payload.subSection],
      };

    case SUBSECTION_ACTIONS.DELETE_SUBSECTIONS:
      return {
        ...state,
        subSections: state.subSections.filter(
          (subSection) => subSection.id !== payload.id,
        ),
      };

    case SUBSECTION_ACTIONS.EDIT_SUBSECTIONS:
      return {
        ...state,
        subSections: state.subSections.map((subSection) => {
          if (subSection.id === payload.subSection.id) {
            subSection = payload.subSection;
          }
          return subSection;
        }),
      };
    default:
      return state;
  }
};

export default subSectionReducer;
