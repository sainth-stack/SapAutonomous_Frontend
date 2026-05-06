import React, { useState, useMemo, useEffect, useCallback } from "react";
import { RiArrowDownSLine, RiArrowRightSLine } from "react-icons/ri";
import {
  MdDashboard,
  MdAccessTime,
  MdWarning,
  MdBarChart,
  MdPeople,
  MdBuild,
  MdTrendingUp,
  MdSmartToy,
  MdCheckCircle,
  MdStorage,
  MdSpeed,
  MdTimer,
  MdVisibility,
  MdPercent,
  MdRefresh,
  MdCategory,
  MdAutoAwesome,
  MdQueue,
  MdAccessTimeFilled,
  MdLightbulb,
  MdSearch,
  MdSecurity,
  MdSelfImprovement,
  MdEventNote,
  MdHistory,
  MdAdminPanelSettings,
  MdManageAccounts,
  MdAssignmentInd,
  MdNotifications,
  MdUploadFile,
  MdUnfoldLess,
  MdUnfoldMore,
} from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { getAllowedPaths } from "../../utils/permissions";
import { getStoredUser } from "../../utils/authSession";
import "./styles.css";

/** Nested groups under BAInocular (not the root BAInocular toggle). Collapse-all targets these only. */
const NESTED_SECTION_KEYS = [
  "dataSourceGroup",
  "sla",
  "incidentManagement",
  "troubleshooting",
  "batchPerformance",
  "resourceEffectiveness",
  "areasOfImprovement",
  "continuousImprovements",
  "effectivenessOfMeasures",
  "admin",
];

const INITIAL_EXPANDED = {
  amsProEn: false,
  admin: false,
  sla: false,
  incidentManagement: false,
  troubleshooting: false,
  batchPerformance: false,
  backgroundJobMonitoring: false,
  resourceEffectiveness: false,
  areasOfImprovement: false,
  continuousImprovements: false,
  effectivenessOfMeasures: false,
  dataSourceGroup: false,
};

export default function Sidebar() {
  const location = useLocation();
  const user = useMemo(getStoredUser, []);
  const isSuperAdmin = !!(user && user.isSuperAdmin);
  const allowedPaths = getAllowedPaths(isSuperAdmin, user?.allowedPaths);

  const canShow = (path) => allowedPaths === null || (allowedPaths && allowedPaths.includes(path));
  const canShowAdmin = isSuperAdmin;

  const [expandedSections, setExpandedSections] = useState(() => ({ ...INITIAL_EXPANDED }));

  useEffect(() => {
    const p = location.pathname;
    if (p === "/data-source" || p === "/sla-export") {
      setExpandedSections((prev) => ({
        ...prev,
        amsProEn: true,
        dataSourceGroup: true,
      }));
    }
  }, [location.pathname]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const hasAnyNestedOpen = useMemo(
    () => NESTED_SECTION_KEYS.some((key) => expandedSections[key]),
    [expandedSections]
  );

  const hasAnyNestedClosed = useMemo(
    () => NESTED_SECTION_KEYS.some((key) => !expandedSections[key]),
    [expandedSections]
  );

  /** Closes every nested submenu under BAInocular. */
  const collapseAllSubmenus = useCallback(() => {
    setExpandedSections((prev) => {
      const next = { ...prev };
      NESTED_SECTION_KEYS.forEach((key) => {
        next[key] = false;
      });
      return next;
    });
  }, []);

  /** Opens every nested submenu under BAInocular. */
  const expandAllSubmenus = useCallback(() => {
    setExpandedSections((prev) => {
      const next = { ...prev };
      NESTED_SECTION_KEYS.forEach((key) => {
        next[key] = true;
      });
      return next;
    });
  }, []);

  const handleBulkToggleFromHeader = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasAnyNestedOpen) {
      collapseAllSubmenus();
      return;
    }

    expandAllSubmenus();
  }, [hasAnyNestedOpen, collapseAllSubmenus, expandAllSubmenus]);

  return (
    <div className="main-container1">
      <nav className="sidebar" aria-label="Main navigation">
        <ul className="sidebar-list">
          {/* AMS ProEn Main Section */}
          <li className="sidebar-section main-section">
            <div 
              className="section-header main-header" 
              onClick={() => toggleSection('amsProEn')}
              role="button"
              tabIndex={0}
            >
              <div className="header-content">
                <MdDashboard size={18} className="section-icon" />
                <span className="section-title" style={{textTransform: ''}}>BAInocular</span>
              </div>
              <div className="main-header-actions">
                {expandedSections.amsProEn && (
                  <button
                    type="button"
                    className="main-header-action-btn"
                    onClick={handleBulkToggleFromHeader}
                    disabled={!hasAnyNestedOpen && !hasAnyNestedClosed}
                    title={hasAnyNestedOpen ? "Collapse all submenus" : "Expand all submenus"}
                    aria-label={hasAnyNestedOpen ? "Collapse all submenus" : "Expand all submenus"}
                  >
                    {hasAnyNestedOpen ? (
                      <MdUnfoldLess size={18} aria-hidden />
                    ) : (
                      <MdUnfoldMore size={18} aria-hidden />
                    )}
                  </button>
                )}
                {expandedSections.amsProEn ? 
                  <RiArrowDownSLine size={18} className="chevron-icon" /> : 
                  <RiArrowRightSLine size={18} className="chevron-icon" />
                }
              </div>
            </div>
            {expandedSections.amsProEn && (
              <div className="main-content">
                {/* Data Source — parent with children: SLA Input File, Export output file */}
                {(canShow("/data-source") || canShow("/sla-export")) && (
                  <li className="sidebar-section">
                    <div
                      className="section-header"
                      onClick={() => toggleSection("dataSourceGroup")}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="header-content">
                        <MdStorage size={16} className="section-icon" />
                        <span className="section-title">Data Source</span>
                      </div>
                      {expandedSections.dataSourceGroup ? (
                        <RiArrowDownSLine size={14} className="chevron-icon" />
                      ) : (
                        <RiArrowRightSLine size={14} className="chevron-icon" />
                      )}
                    </div>
                    {expandedSections.dataSourceGroup && (
                      <ul className="subsection-list">
                           {/* {(canShow("/sla-export") || canShow("/data-source")) && (
                          <li
                            className={`sidebar-item subsection ${
                              location.pathname === "/sla-export" ? "active" : ""
                            }`}
                          >
                            <Link to="/sla-export" className="sidebar-link">
                              <MdDownload size={14} className="link-icon" />
                              <span className="link-text">Export output file</span>
                            </Link>
                          </li>
                        )} */}
                        {canShow("/data-source") && (
                          <li
                            className={`sidebar-item subsection ${
                              location.pathname === "/data-source" ? "active" : ""
                            }`}
                          >
                            <Link to="/data-source" className="sidebar-link">
                              <MdUploadFile size={14} className="link-icon" />
                              <span className="link-text">SLA Input File</span>
                            </Link>
                          </li>
                        )}
                     
                      </ul>
                    )}
                  </li>
                )}

                {/* SLA Section */}
                {(canShow("/sla-resolution-response-time") || canShow("/self-monitoring")) && (
                  <li className="sidebar-section">
                    <div
                      className="section-header"
                      onClick={() => toggleSection("sla")}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="header-content">
                        <MdAccessTime size={16} className="section-icon" />
                        <span className="section-title">SLA</span>
                      </div>
                      {expandedSections.sla ? (
                        <RiArrowDownSLine size={14} className="chevron-icon" />
                      ) : (
                        <RiArrowRightSLine size={14} className="chevron-icon" />
                      )}
                    </div>
                    {expandedSections.sla && (
                      <ul className="subsection-list">
                        {canShow("/sla-resolution-response-time") && (
                          <li className={`sidebar-item subsection ${location.pathname === "/sla-resolution-response-time" ? "active" : ""}`}>
                            <Link to="/sla-resolution-response-time" className="sidebar-link">
                              <MdTimer size={14} className="link-icon" />
                              <span className="link-text">Resolution and Response Time</span>
                            </Link>
                          </li>
                        )}
                        {canShow("/self-monitoring") && (
                          <li className={`sidebar-item subsection ${location.pathname === "/self-monitoring" ? "active" : ""}`}>
                            <Link to="/self-monitoring" className="sidebar-link">
                              <MdVisibility size={14} className="link-icon" />
                              <span className="link-text">Manage Queue</span>
                            </Link>
                          </li>
                        )}
                      </ul>
                    )}
                  </li>
                )}

                {/* Incident Management Section */}
                {(canShow("/incidents-percent") || canShow("/incidents-recurring") || canShow("/incident-management") || canShow("/incidents-auto-assignment")) && (
                  <li className="sidebar-section">
                    <div
                      className="section-header"
                      onClick={() => toggleSection("incidentManagement")}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="header-content">
                        <MdWarning size={16} className="section-icon" />
                        <span className="section-title">Incidents Management</span>
                      </div>
                      {expandedSections.incidentManagement ? (
                        <RiArrowDownSLine size={14} className="chevron-icon" />
                      ) : (
                        <RiArrowRightSLine size={14} className="chevron-icon" />
                      )}
                    </div>
                    {expandedSections.incidentManagement && (
                      <ul className="subsection-list">
                        {canShow("/incidents-percent") && (
                          <li className={`sidebar-item subsection ${location.pathname === "/incidents-percent" ? "active" : ""}`}>
                            <Link to="/incidents-percent" className="sidebar-link">
                              <MdPercent size={14} className="link-icon" />
                              <span className="link-text">% of incidents and trend</span>
                            </Link>
                          </li>
                        )}
                        {canShow("/incidents-recurring") && (
                          <li className={`sidebar-item subsection ${location.pathname === "/incidents-recurring" ? "active" : ""}`}>
                            <Link to="/incidents-recurring" className="sidebar-link">
                              <MdRefresh size={14} className="link-icon" />
                              <span className="link-text">Recurring incidents and trend</span>
                            </Link>
                          </li>
                        )}
                        {canShow("/incident-management") && (
                          <li className={`sidebar-item subsection ${location.pathname === "/incident-management" ? "active" : ""}`}>
                            <Link to="/incident-management" className="sidebar-link">
                              <MdCategory size={14} className="link-icon" />
                              <span className="link-text">Classification</span>
                            </Link>
                          </li>
                        )}
                        {canShow("/incidents-auto-assignment") && (
                          <li className={`sidebar-item subsection ${location.pathname === "/incidents-auto-assignment" ? "active" : ""}`}>
                            <Link to="/incidents-auto-assignment" className="sidebar-link">
                              <MdAutoAwesome size={14} className="link-icon" />
                              <span className="link-text">Auto Assignment</span>
                            </Link>
                          </li>
                        )}
                      </ul>
                    )}
                  </li>
                )}

                {/* Performance Monitoring Section - three items, no children */}
                {(canShow("/process-monitor/thanksgiving/configuration") || canShow("/process-monitor/thanksgiving") || canShow("/system-monitoring")) && (
                  <li className="sidebar-section">
                    <div
                      className="section-header"
                      onClick={() => toggleSection("batchPerformance")}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="header-content">
                        <MdBarChart size={16} className="section-icon" />
                        <span className="section-title">Performance Monitoring</span>
                      </div>
                      {expandedSections.batchPerformance ? (
                        <RiArrowDownSLine size={14} className="chevron-icon" />
                      ) : (
                        <RiArrowRightSLine size={14} className="chevron-icon" />
                      )}
                    </div>
                    {expandedSections.batchPerformance && (
                      <ul className="subsection-list">
                        {canShow("/process-monitor/thanksgiving/configuration") && (
                          <li className={`sidebar-item subsection ${location.pathname === "/process-monitor/thanksgiving/configuration" ? "active" : ""}`}>
                            <Link to="/process-monitor/thanksgiving/configuration" className="sidebar-link">
                              <MdBuild size={14} className="link-icon" />
                              <span className="link-text">Configuration</span>
                            </Link>
                          </li>
                        )}
                        {canShow("/process-monitor/thanksgiving") && (
                          <li className={`sidebar-item subsection ${location.pathname === "/process-monitor/thanksgiving" ? "active" : ""}`}>
                            <Link to="/process-monitor/thanksgiving" className="sidebar-link">
                              <MdSpeed size={14} className="link-icon" />
                              <span className="link-text">Background Job Monitoring</span>
                            </Link>
                          </li>
                        )}
                        {canShow("/system-monitoring") && (
                          <li className={`sidebar-item subsection ${location.pathname === "/system-monitoring" ? "active" : ""}`}>
                            <Link to="/system-monitoring" className="sidebar-link">
                              <MdVisibility size={14} className="link-icon" />
                              <span className="link-text">System/Application Monitoring</span>
                            </Link>
                          </li>
                        )}
                      </ul>
                    )}
                  </li>
                )}

                {/* Resource Effectiveness Section */}
                {(canShow("/resource-queue-length") || canShow("/resource-incidents-resolved") || canShow("/resource-time-per-resolution")) && (
                  <li className="sidebar-section">
                    <div
                      className="section-header"
                      onClick={() => toggleSection("resourceEffectiveness")}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="header-content">
                        <MdPeople size={16} className="section-icon" />
                        <span className="section-title">Resource Effectiveness</span>
                      </div>
                      {expandedSections.resourceEffectiveness ? (
                        <RiArrowDownSLine size={14} className="chevron-icon" />
                      ) : (
                        <RiArrowRightSLine size={14} className="chevron-icon" />
                      )}
                    </div>
                    {expandedSections.resourceEffectiveness && (
                      <ul className="subsection-list">
                        {canShow("/resource-queue-length") && (
                          <li className={`sidebar-item subsection ${location.pathname === "/resource-queue-length" ? "active" : ""}`}>
                            <Link to="/resource-queue-length" className="sidebar-link">
                              <MdQueue size={14} className="link-icon" />
                              <span className="link-text">Queue Length and trend</span>
                            </Link>
                          </li>
                        )}
                        {canShow("/resource-incidents-resolved") && (
                          <li className={`sidebar-item subsection ${location.pathname === "/resource-incidents-resolved" ? "active" : ""}`}>
                            <Link to="/resource-incidents-resolved" className="sidebar-link">
                              <MdCheckCircle size={14} className="link-icon" />
                              <span className="link-text">% of incidents resolved and trend</span>
                            </Link>
                          </li>
                        )}
                        {canShow("/resource-time-per-resolution") && (
                          <li className={`sidebar-item subsection ${location.pathname === "/resource-time-per-resolution" ? "active" : ""}`}>
                            <Link to="/resource-time-per-resolution" className="sidebar-link">
                              <MdAccessTimeFilled size={14} className="link-icon" />
                              <span className="link-text">Time per resolution and trend</span>
                            </Link>
                          </li>
                        )}
                      </ul>
                    )}
                  </li>
                )}

                {/* Troubleshooting Assistance Section - visible for limited users (kedb + web-suggested-actions) */}
                {(canShow("/kedb") || canShow("/web-suggested-actions") || canShow("/suggested-actions-depository")) && (
                  <li className="sidebar-section">
                    <div
                      className="section-header"
                      onClick={() => toggleSection("troubleshooting")}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="header-content">
                        <MdBuild size={16} className="section-icon" />
                        <span className="section-title">Troubleshooting Assistance</span>
                      </div>
                      {expandedSections.troubleshooting ? (
                        <RiArrowDownSLine size={14} className="chevron-icon" />
                      ) : (
                        <RiArrowRightSLine size={14} className="chevron-icon" />
                      )}
                    </div>
                    {expandedSections.troubleshooting && (
                      <ul className="subsection-list">
                        {canShow("/kedb") && (
                          <li className={`sidebar-item subsection ${location.pathname === "/kedb" ? "active" : ""}`}>
                            <Link to="/kedb" className="sidebar-link">
                              <MdLightbulb size={14} className="link-icon" />
                              <span className="link-text">AI Context Lookup</span>
                            </Link>
                          </li>
                        )}
                        {/* {canShow("/suggested-actions-depository") && (
                          <li className={`sidebar-item subsection ${location.pathname === "/suggested-actions-depository" ? "active" : ""}`}>
                            <Link to="/suggested-actions-depository" className="sidebar-link">
                              <MdStorage size={14} className="link-icon" />
                              <span className="link-text">Suggested Actions - Repository</span>
                            </Link>
                          </li>
                        )} */}
                        {canShow("/web-suggested-actions") && (
                          <li className={`sidebar-item subsection ${location.pathname === "/web-suggested-actions" ? "active" : ""}`}>
                            <Link to="/web-suggested-actions" className="sidebar-link">
                              <MdSearch size={14} className="link-icon" />
                              <span className="link-text">AI Power Search</span>
                            </Link>
                          </li>
                        )}
                      </ul>
                    )}
                  </li>
                )}

                {/* Value Creation Section */}
                {(canShow("/preventive-measures") || canShow("/self-service-actions")) && (
                  <li className="sidebar-section">
                    <div
                      className="section-header"
                      onClick={() => toggleSection("areasOfImprovement")}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="header-content">
                        <MdTrendingUp size={16} className="section-icon" />
                        <span className="section-title">Value Creation</span>
                      </div>
                      {expandedSections.areasOfImprovement ? (
                        <RiArrowDownSLine size={14} className="chevron-icon" />
                      ) : (
                        <RiArrowRightSLine size={14} className="chevron-icon" />
                      )}
                    </div>
                    {expandedSections.areasOfImprovement && (
                      <ul className="subsection-list">
                        {canShow("/preventive-measures") && (
                          <li className={`sidebar-item subsection ${location.pathname === "/preventive-measures" ? "active" : ""}`}>
                            <Link to="/preventive-measures" className="sidebar-link">
                              <MdSecurity size={14} className="link-icon" />
                              <span className="link-text">Preventive Measures</span>
                            </Link>
                          </li>
                        )}
                        {canShow("/self-service-actions") && (
                          <li className={`sidebar-item subsection ${location.pathname === "/self-service-actions" ? "active" : ""}`}>
                            <Link to="/self-service-actions" className="sidebar-link">
                              <MdSelfImprovement size={14} className="link-icon" />
                              <span className="link-text">Self Service Actions</span>
                            </Link>
                          </li>
                        )}
                      </ul>
                    )}
                  </li>
                )}

                {/* Continuous Improvements */}
                {(canShow("/automation-target-areas") ||
                  canShow("/automation-preventive-alerts") ||
                  canShow("/continuous-improvements/self-diagnosis") ||
                  canShow("/continuous-improvements/improvise-mttr")) && (
                  <li className="sidebar-section">
                    <div
                      className="section-header"
                      onClick={() => toggleSection("continuousImprovements")}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="header-content">
                        <MdSmartToy size={16} className="section-icon" />
                        <span className="section-title">Continuous Improvements</span>
                      </div>
                      {expandedSections.continuousImprovements ? (
                        <RiArrowDownSLine size={14} className="chevron-icon" />
                      ) : (
                        <RiArrowRightSLine size={14} className="chevron-icon" />
                      )}
                    </div>
                    {expandedSections.continuousImprovements && (
                      <ul className="subsection-list">
                        {canShow("/automation-target-areas") && (
                          <li
                            className={`sidebar-item subsection ${location.pathname === "/automation-target-areas" ? "active" : ""}`}
                          >
                            <Link to="/automation-target-areas" className="sidebar-link">
                              <MdAutoAwesome size={14} className="link-icon" />
                              <span className="link-text">Potential Automation</span>
                            </Link>
                          </li>
                        )}
                        {canShow("/automation-preventive-alerts") && (
                          <li
                            className={`sidebar-item subsection ${location.pathname === "/automation-preventive-alerts" ? "active" : ""}`}
                          >
                            <Link to="/automation-preventive-alerts" className="sidebar-link">
                              <MdNotifications size={14} className="link-icon" />
                              <span className="link-text">Proactive Alerts</span>
                            </Link>
                          </li>
                        )}
                        {canShow("/continuous-improvements/self-diagnosis") && (
                          <li
                            className={`sidebar-item subsection ${location.pathname === "/continuous-improvements/self-diagnosis" ? "active" : ""}`}
                          >
                            <Link to="/continuous-improvements/self-diagnosis" className="sidebar-link">
                              <MdSearch size={14} className="link-icon" />
                              <span className="link-text">Self Diagnosis</span>
                            </Link>
                          </li>
                        )}
                        {canShow("/continuous-improvements/improvise-mttr") && (
                          <li
                            className={`sidebar-item subsection ${location.pathname === "/continuous-improvements/improvise-mttr" ? "active" : ""}`}
                          >
                            <Link to="/continuous-improvements/improvise-mttr" className="sidebar-link">
                              <MdTimer size={14} className="link-icon" />
                              <span className="link-text">Improvise MTTR</span>
                            </Link>
                          </li>
                        )}
                      </ul>
                    )}
                  </li>
                )}

                {/* Effectiveness of Measures Section */}
                {(canShow("/effectiveness-occurrence") || canShow("/effectiveness-resolution-time")) && (
                  <li className="sidebar-section">
                    <div
                      className="section-header"
                      onClick={() => toggleSection("effectivenessOfMeasures")}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="header-content">
                        <MdCheckCircle size={16} className="section-icon" />
                        <span className="section-title">Effectiveness of Measur...</span>
                      </div>
                      {expandedSections.effectivenessOfMeasures ? (
                        <RiArrowDownSLine size={14} className="chevron-icon" />
                      ) : (
                        <RiArrowRightSLine size={14} className="chevron-icon" />
                      )}
                    </div>
                    {expandedSections.effectivenessOfMeasures && (
                      <ul className="subsection-list">
                        {canShow("/effectiveness-occurrence") && (
                          <li className={`sidebar-item subsection ${location.pathname === "/effectiveness-occurrence" ? "active" : ""}`}>
                            <Link to="/effectiveness-occurrence" className="sidebar-link">
                              <MdEventNote size={14} className="link-icon" />
                              <span className="link-text">Occurrence post implementation</span>
                            </Link>
                          </li>
                        )}
                        {canShow("/effectiveness-resolution-time") && (
                          <li className={`sidebar-item subsection ${location.pathname === "/effectiveness-resolution-time" ? "active" : ""}`}>
                            <Link to="/effectiveness-resolution-time" className="sidebar-link">
                              <MdHistory size={14} className="link-icon" />
                              <span className="link-text">Resolution time post implementation</span>
                            </Link>
                          </li>
                        )}
                      </ul>
                    )}
                  </li>
                )}

                {/* Admin Section - only for super admin, at bottom */}
                {canShowAdmin && (
                  <li className="sidebar-section">
                    <div
                      className="section-header"
                      onClick={() => toggleSection("admin")}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="header-content">
                        <MdAdminPanelSettings size={16} className="section-icon" />
                        <span className="section-title">Admin</span>
                      </div>
                      {expandedSections.admin ? (
                        <RiArrowDownSLine size={14} className="chevron-icon" />
                      ) : (
                        <RiArrowRightSLine size={14} className="chevron-icon" />
                      )}
                    </div>
                    {expandedSections.admin && (
                      <ul className="subsection-list">
                        <li className={`sidebar-item subsection ${location.pathname === "/admin/roles" ? "active" : ""}`}>
                          <Link to="/admin/roles" className="sidebar-link">
                            <MdAssignmentInd size={14} className="link-icon" />
                            <span className="link-text">Roles</span>
                          </Link>
                        </li>
                        <li className={`sidebar-item subsection ${location.pathname === "/admin/users" ? "active" : ""}`}>
                          <Link to="/admin/users" className="sidebar-link">
                            <MdManageAccounts size={14} className="link-icon" />
                            <span className="link-text">Users</span>
                          </Link>
                        </li>
                      </ul>
                    )}
                  </li>
                )}
                {/* <li className="sidebar-section">
                  <div className="section-header">
                    <Link to="/bi-report" className="sidebar-link">
                      <div className="header-content">
                      <MdBarChart size={16} className="section-icon" />
                      <span className="section-title">BI Report</span>
                    </div>
                    </Link>
                  </div>
                </li> */}
              </div>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
}