import { useContext } from "react";
import { ToastContext } from "./ToastContext";

export const useCustomToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useCustomToast must be used within a CustomToastProvider");
  }
  return context;
};
