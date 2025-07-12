import React from "react";
import ReactDOM from "react-dom/client";
import Router from "./routes";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import colorPalettes from "./themes/color_palettes";
import typography from "./themes/typography";
import Shadows from "./themes/shadow";
import { CustomToastProvider } from "./hooks/CustomToast/CustomToastProvider";

// Step 1: base theme
const tempTheme = createTheme({
  palette: colorPalettes("light"),
  typography,
});

const customShadows = Shadows(tempTheme);
const theme = createTheme(tempTheme, {
  customShadows,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CustomToastProvider>
        <Router />
      </CustomToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);
