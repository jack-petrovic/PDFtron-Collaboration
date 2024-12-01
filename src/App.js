import "./App.css";
import AppRoutes from "./routes";
import { Box } from "@mui/material";

function App() {
  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        overflowX: "hidden",
      }}
    >
      <AppRoutes />
    </Box>
  );
}

export default App;
