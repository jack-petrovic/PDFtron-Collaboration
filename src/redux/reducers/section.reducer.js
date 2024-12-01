import { SECTION_ACTIONS } from "../action-types";

const initialState = {
  sections: [],
};

const sectionReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case SECTION_ACTIONS.SET_SECTIONS:
      return {
        ...state,
        sections: payload.sections,
      };

    case SECTION_ACTIONS.ADD_SECTION:
      return {
        ...state,
        sections: [...state.sections, payload.section],
      };

    case SECTION_ACTIONS.DELETE_SECTION:
      return {
        ...state,
        sections: state.sections.filter((section) => section.id !== payload.id),
      };

    case SECTION_ACTIONS.EDIT_SECTION:
      return {
        ...state,
        sections: state.sections.map((section) => {
          if (section.id === payload.section.id) {
            section = payload.section;
          }
          return section;
        }),
      };

    default:
      return state;
  }
};

export default sectionReducer;
