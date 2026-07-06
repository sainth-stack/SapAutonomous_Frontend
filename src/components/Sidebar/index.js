import React, { useState, useMemo } from "react";
import {
  MdSpeed,
  MdSmartToy,
  MdErrorOutline,
  MdAdminPanelSettings,
  MdManageAccounts,
  MdAssignmentInd,
  MdSettings,
  MdHistory,
} from "react-icons/md";
import { RiArrowDownSLine, RiArrowRightSLine } from "react-icons/ri";
import { Link, useLocation } from "react-router-dom";
import { getAllowedPaths } from "../../utils/permissions";
import { getStoredUser } from "../../utils/authSession";
import "./styles.css";

const NAV_ITEMS = [
  { path: "/process-monitor/thanksgiving", label: "SAP job monitoring", Icon: MdSpeed },
  { path: "/self-service-actions", label: "SAP Joule", Icon: MdSmartToy },
  { path: "/process-monitor/failed-idocs", label: "Failed IDocs", Icon: MdErrorOutline },
];

export default function Sidebar() {
  const location = useLocation();
  const user = useMemo(getStoredUser, []);
  const isSuperAdmin = !!(user && user.isSuperAdmin);
  const allowedPaths = getAllowedPaths(isSuperAdmin, user?.allowedPaths);

  const [adminOpen, setAdminOpen] = useState(
    location.pathname.startsWith("/admin")
  );

  const canShow = (path) =>
    allowedPaths === null || (allowedPaths && allowedPaths.includes(path));

  const ADMIN_ITEMS = [
    { path: "/admin/users",         label: "Users",         Icon: MdManageAccounts },
    { path: "/admin/roles",         label: "Roles",         Icon: MdAssignmentInd  },
    { path: "/admin/configuration", label: "Configuration", Icon: MdSettings       },
    { path: "/admin/logs",          label: "Logs",          Icon: MdHistory        },
  ];

  return (
    <div className="main-container1">
      <nav className="sidebar" aria-label="Main navigation">
        <ul className="sidebar-list" style={{ padding: "8px 0" }}>
          {/* Regular nav items */}
          {NAV_ITEMS.filter((item) => canShow(item.path)).map(({ path, label, Icon }) => {
            const isActive = location.pathname === path;
            return (
              <li
                key={path}
                className={`sidebar-item${isActive ? " active" : ""}`}
                style={{ margin: "2px 0" }}
              >
                <Link to={path} className="sidebar-link">
                  <Icon size={18} className="link-icon" />
                  <span className="link-text">{label}</span>
                </Link>
              </li>
            );
          })}

          {/* Admin section — Users/Roles/Configuration are super-admin-only;
              Logs is role-assignable so show section if either applies */}
          {(isSuperAdmin || canShow("/admin/logs")) && (
            <li className="sidebar-section">
              <div
                className="section-header"
                onClick={() => setAdminOpen((v) => !v)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setAdminOpen((v) => !v)}
              >
                <div className="header-content">
                  <MdAdminPanelSettings size={16} className="section-icon" />
                  <span className="section-title">Admin</span>
                </div>
                {adminOpen
                  ? <RiArrowDownSLine size={14} className="chevron-icon" />
                  : <RiArrowRightSLine size={14} className="chevron-icon" />
                }
              </div>
              {adminOpen && (
                <ul className="subsection-list">
                  {isSuperAdmin && ADMIN_ITEMS.filter((i) => i.path !== "/admin/logs").map(({ path, label, Icon }) => (
                    <li
                      key={path}
                      className={`sidebar-item subsection${location.pathname === path ? " active" : ""}`}
                    >
                      <Link to={path} className="sidebar-link">
                        <Icon size={14} className="link-icon" />
                        <span className="link-text">{label}</span>
                      </Link>
                    </li>
                  ))}
                  {canShow("/admin/logs") && (
                    <li className={`sidebar-item subsection${location.pathname === "/admin/logs" ? " active" : ""}`}>
                      <Link to="/admin/logs" className="sidebar-link">
                        <MdHistory size={14} className="link-icon" />
                        <span className="link-text">Logs</span>
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}
