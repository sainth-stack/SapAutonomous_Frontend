import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "./style.css";
import { Outlet, useLocation } from "react-router-dom";
import { isAdminRoutePath, sendAppLog, getLogMetaFromPath } from "../utils/logger";
export function AdminLayout() {
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    if (isAdminRoutePath(path)) return;
    const { moduleName } = getLogMetaFromPath(path);
    sendAppLog({
      pathname: path,
      logType: "Page Opened",
      content: `${moduleName} — page opened (${path})`
    });
  }, [path]);

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
