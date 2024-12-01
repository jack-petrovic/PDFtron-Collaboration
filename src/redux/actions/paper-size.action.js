import { PAPER_SIZE_ACTIONS } from "../action-types";

export const setPaperSizes = (paperSizes) => {
  return {
    type: PAPER_SIZE_ACTIONS.SET_PAPER_SIZES,
    payload: {
      paperSizes,
    },
  };
};

export const addPaperSize = (paperSize) => {
  return {
    type: PAPER_SIZE_ACTIONS.ADD_PAPER_SIZE,
    payload: {
      paperSize,
    },
  };
};

export const removePaperSize = (id) => {
  return {
    type: PAPER_SIZE_ACTIONS.DELETE_PAPER_SIZE,
    payload: {
      id,
    },
  };
};

export const editPaperSize = (paperSize) => {
  return {
    type: PAPER_SIZE_ACTIONS.EDIT_PAPER_SIZE,
    payload: {
      paperSize,
    },
  };
};
