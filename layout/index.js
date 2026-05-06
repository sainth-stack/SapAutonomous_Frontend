import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "./style.css";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { canAccessPath, getDefaultPathForUser } from "../utils/permissions";
import { sendAppLog, getLogMetaFromPath, isAdminRoutePath } from "../utils/logger";
import { getStoredUser, isAuthenticatedSession } from "../utils/authSession";

export function AdminLayout() {
  const location = useLocation();
  const user = getStoredUser();
  const isAuthenticated = !!isAuthenticatedSession();
  const isSuperAdmin = !!(user?.isSuperAdmin);
  const allowedPaths = user?.allowedPaths ?? null;
  const path = location.pathname;
  const pathAllowed = isAuthenticated && canAccessPath(path, isSuperAdmin, allowedPaths);

  useEffect(() => {
    if (!isAuthenticated || !pathAllowed) return;
    if (isAdminRoutePath(path)) return;
    const { moduleName } = getLogMetaFromPath(path);
    sendAppLog({
      pathname: path,
      logType: "Page Opened",
      content: `${moduleName} — page opened (${path})`
    });
  }, [path, isAuthenticated, pathAllowed, isSuperAdmin, allowedPaths]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!pathAllowed) {
    const defaultPath = getDefaultPathForUser(isSuperAdmin, allowedPaths);
    return <Navigate to={defaultPath} replace />;
  }

  return (
    <div className="row p-0 m-0">
      <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 p-0 m-0">
        <Navbar />
        <div className="d-flex justify-content-between">
          <div className={""}>
            <Sidebar />
          </div>
          <div className="p-0 w-100 main-content2">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
