import { createContext } from "react";

export type ToastSeverity = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  message: string;
  severity?: ToastSeverity;
  duration?: number;
}

export interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);
