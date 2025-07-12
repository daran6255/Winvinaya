import React, { useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { ToastContext } from "./ToastContext";
import type { ToastSeverity, ToastOptions } from "./ToastContext";
import type { ReactNode } from "react";

export const CustomToastProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [severity, setSeverity] = useState<ToastSeverity>("info");
  const [duration, setDuration] = useState<number>(3000);

  const showToast = ({
    message,
    severity = "info",
    duration = 3000
  }: ToastOptions) => {
    setMessage(message);
    setSeverity(severity);
    setDuration(duration);
    setOpen(true);
  };

const handleClose = (
  _event?: React.SyntheticEvent | Event,
  reason?: string
) => {
  if (reason === "clickaway") {
    return;
  }
  setOpen(false);
};



  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          elevation={6}
          sx={{
            minWidth: 300,
            fontSize: "0.9rem",
            borderRadius: 2,
            boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
            "& .MuiAlert-message": {
              display: "flex",
              alignItems: "center"
            }
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};
