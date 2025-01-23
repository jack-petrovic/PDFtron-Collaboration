import { Suspense } from "react";
import "./App.css";
import AppRoutes from "./routes";
import { Box } from "@mui/material";

const App = () => {
  return (
    <Suspense>
      <Box className="route-container">
        <AppRoutes />
      </Box>
    </Suspense>
  );
};

export default App;
