// src/routes/allroutes.tsx
import type { ReactNode } from "react";
import PageNotFound from "../pages/PageNotFound";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";

export type AppRoute = {
  path: string;
  component: ReactNode;
  roles?: string[];
};

const authProtectedRoutes: AppRoute[] = [
  // Example:
  // {
  //   path: '/jobs/map/:job_id',
  //   component: <JobMappingPage />,
  //   roles: ['Admin', 'Manager']
  // }
  { path: '/dashboard', component: <Dashboard />}
];

const publicRoutes: AppRoute[] = [
  // Example:
  // {
  //   path: '/login',
  //   component: <LoginPage />
  // }
  { path: '/page-not-found', component: <PageNotFound />},
  { path: '/login', component: <Login />}
];

export { authProtectedRoutes, publicRoutes };
