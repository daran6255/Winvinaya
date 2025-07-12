// src/routes/index.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";

import store from "../store";
import AuthProtected from "./protectedroutes";
import { authProtectedRoutes, publicRoutes } from './allroutes';

type RouteType = {
  path: string;
  component: React.ReactNode;
  roles?: string[];
};

const Index: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public Routes */}
          {publicRoutes.map((route: RouteType, idx: number) => (
            <Route
              path={route.path}
              element={route.component}
              key={idx}
            />
          ))}

          {/* Auth Protected Routes */}
          {authProtectedRoutes.map((route: RouteType, idx: number) => (
            <Route
              path={route.path}
              element={
                <AuthProtected roles={route.roles}>
                  {route.component}
                </AuthProtected>
              }
              key={idx}
            />
          ))}
        </Routes>
      </Router>
    </Provider>
  );
};

export default Index;
