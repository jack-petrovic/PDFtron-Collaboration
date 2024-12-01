import { PAPER_SIZE_ACTIONS } from "../action-types";

const initialState = {
  paperSizes: [],
};

const paperSizeReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case PAPER_SIZE_ACTIONS.SET_PAPER_SIZES:
      return {
        ...state,
        paperSizes: payload.paperSizes,
      };

    case PAPER_SIZE_ACTIONS.ADD_PAPER_SIZE:
      return {
        ...state,
        paperSizes: [...state.paperSizes, payload.paperSize],
      };

    case PAPER_SIZE_ACTIONS.DELETE_PAPER_SIZE:
      return {
        ...state,
        paperSizes: state.paperSizes.filter(
          (paperSize) => paperSize.id !== payload.id,
        ),
      };

    case PAPER_SIZE_ACTIONS.EDIT_PAPER_SIZE:
      return {
        ...state,
        paperSizes: state.paperSizes.map((paperSize) => {
          if (paperSize.id === payload.paperSize.id) {
            paperSize = payload.paperSize;
          }
          return paperSize;
        }),
      };

    default:
      return state;
  }
};

export default paperSizeReducer;
