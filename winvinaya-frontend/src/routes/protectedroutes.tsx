// src/routes/protectedroutes.tsx
import React, { useEffect } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Spinner from "../components/common/Spinner";
import { verifyToken } from "../store/slices/authSlice";
import { useCustomToast } from "../hooks/CustomToast/useCustomToast";
import type { RootState, AppDispatch } from "../store";

type AuthProtectedProps = {
  children: ReactNode;
  roles?: string[];
};

const AuthProtected: React.FC<AuthProtectedProps> = ({ children, roles }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, status, error } = useSelector(
    (state: RootState) => state.auth
  );
  const showToast = useCustomToast();

  useEffect(() => {
    if (token && status === "idle") {
      dispatch(verifyToken());
    }
  }, [token, status, dispatch]);

  useEffect(() => {
    if (status === "failed" && error) {
      showToast.showToast({
        message: error,
        severity: "error"
      });
    }
  }, [status, error, showToast]);

  if (status === "loading") {
    return <Spinner />;
  }

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/page-not-found" />;
  }

  return <>{children}</>;
};

export default AuthProtected;
