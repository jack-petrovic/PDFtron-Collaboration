import styled from "@emotion/styled";
import { Box, Switch } from "@mui/material";

export const TextComposerContainer = styled(Box)`
  .loading-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 1.5rem;
  }

  .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding-bottom: 10px;

    button {
      text-transform: unset;
    }
  }

  .text-red {
    color: red;
  }

  .quill-container {
    position: relative;
  }

  .suggestion-dropdown {
    position: absolute;
    max-height: 150px;
    border-radius: 5px;
    overflow: auto;
    background: white;
    box-shadow:
      0 4px 6px -1px rgb(0 0 0 / 0.1),
      0 2px 4px -2px rgb(0 0 0 / 0.1);
    z-index: 100;

    &::-webkit-scrollbar {
      width: 6px;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-track {
      background-color: #e6e1e1;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 3px;
      background-color: #9e9e9e;
    }

    .dropdown-item {
      min-width: 80px;
      padding: 3px 12px;
      font-size: 12px;
      cursor: pointer;

      &.active {
        background: rgba(0, 0, 0, 0.1);
      }

      &:hover {
        background: rgba(0, 0, 0, 0.1);
      }
    }
  }
`;

export const ModalContainer = styled(Box)`
  position: relative;
  width: 40%;
  padding: 1rem 2rem 1rem;
  background-color: #f8fafc;
  border-radius: 1.5rem;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -2px rgb(0 0 0 / 0.1);

  &.sentiment-dialog {
    width: 400px;
    maxwidth: 100%;
  }

  &.grammar-check-dialog {
    width: 600px;
    maxwidth: 100%;

    .highlight {
      background-color: yellow;
    }
  }

  .title {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .spinner-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .actions {
    padding-top: 1rem;
    display: flex;
    justify-content: flex-end;
    gap: 8px;

    button {
      text-transform: unset;
    }
  }
`;

export const CloseButtonBox = styled(Box)`
  position: absolute;
  right: 1rem;
  top: 1rem;
  cursor: pointer;
`;

export const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 15,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(9px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(12px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: theme.palette.mode === "dark" ? "#177ddc" : "#1890ff",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(["width"], {
      duration: 200,
    }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255,255,255,.35)"
        : "rgba(0,0,0,.25)",
    boxSizing: "border-box",
  },
}));
