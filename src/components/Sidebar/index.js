import React, { useState } from "react";
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
  MdAssignment,
  MdSpeed,
  MdTimer,
  MdVisibility,
  MdPercent,
  MdRefresh,
  MdCategory,
  MdAutoAwesome,
  MdError,
  MdSchedule,
  MdQueue,
  MdResolveIcon,
  MdAccessTimeFilled,
  MdLightbulb,
  MdSearch,
  MdSecurity,
  MdSelfImprovement,
  MdLocationOn,
  MdNotifications,
  MdEventNote,
  MdHistory
} from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import "./styles.css";

export default function Sidebar() {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    amsProEn: false,
    sla: false,
    incidentManagement: false,
    troubleshooting: false,
    batchPerformance: false,
    resourceEffectiveness: false,
    areasOfImprovement: false,
    potentialAutomation: false,
    effectivenessOfMeasures: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="main-container1">
      <nav className="sidebar">
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
                <span className="section-title" style={{textTransform: ''}}>AMS ProEn</span>
              </div>
              {expandedSections.amsProEn ? 
                <RiArrowDownSLine size={18} className="chevron-icon" /> : 
                <RiArrowRightSLine size={18} className="chevron-icon" />
              }
            </div>
            {expandedSections.amsProEn && (
              <div className="main-content">
                {/* Data Source Section */}
                <li className="sidebar-section data-source-section">
                  <ul className="subsection-list">
                    <li className={`sidebar-item subsection ${location.pathname === "/data-source" ? "active" : ""}`}>
                      <Link to="/data-source" className="sidebar-link">
                        <MdStorage size={16} className="link-icon" />
                        <span className="link-text">Data Source</span>
                      </Link>
                    </li>
                  </ul>
                </li>

                {/* SLA Section */}
                <li className="sidebar-section">
                  <div 
                    className="section-header" 
                    onClick={() => toggleSection('sla')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="header-content">
                      <MdAccessTime size={16} className="section-icon" />
                      <span className="section-title">SLA</span>
                    </div>
                    {expandedSections.sla ? 
                      <RiArrowDownSLine size={14} className="chevron-icon" /> : 
                      <RiArrowRightSLine size={14} className="chevron-icon" />
                    }
                  </div>
                  {expandedSections.sla && (
                    <ul className="subsection-list">
                      <li className={`sidebar-item subsection ${location.pathname === "/sla-resolution-response-time" ? "active" : ""}`}>
                        <Link to="/sla-resolution-response-time" className="sidebar-link">
                          <MdTimer size={14} className="link-icon" />
                          <span className="link-text">Resolution and Response Time</span>
                        </Link>
                      </li>
                      <li className={`sidebar-item subsection ${location.pathname === "/self-monitoring" ? "active" : ""}`}>
                        <Link to="/self-monitoring" className="sidebar-link">
                          <MdVisibility size={14} className="link-icon" />
                          <span className="link-text">Self Monitoring</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Incident Management Section */}
                <li className="sidebar-section">
                  <div 
                    className="section-header" 
                    onClick={() => toggleSection('incidentManagement')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="header-content">
                      <MdWarning size={16} className="section-icon" />
                      <span className="section-title">Incidents Management</span>
                    </div>
                    {expandedSections.incidentManagement ? 
                      <RiArrowDownSLine size={14} className="chevron-icon" /> : 
                      <RiArrowRightSLine size={14} className="chevron-icon" />
                    }
                  </div>
                  {expandedSections.incidentManagement && (
                    <ul className="subsection-list">
                      <li className={`sidebar-item subsection ${location.pathname === "/incidents-percent" ? "active" : ""}`}>
                        <Link to="/incidents-percent" className="sidebar-link">
                          <MdPercent size={14} className="link-icon" />
                          <span className="link-text">% of incidents and trend</span>
                        </Link>
                      </li>
                      <li className={`sidebar-item subsection ${location.pathname === "/incidents-recurring" ? "active" : ""}`}>
                        <Link to="/incidents-recurring" className="sidebar-link">
                          <MdRefresh size={14} className="link-icon" />
                          <span className="link-text">Recurring incidents and trend</span>
                        </Link>
                      </li>
                      <li className={`sidebar-item subsection ${location.pathname === "/incident-management" ? "active" : ""}`}>
                        <Link to="/incident-management" className="sidebar-link">
                          <MdCategory size={14} className="link-icon" />
                          <span className="link-text">Classification</span>
                        </Link>
                      </li>
                      <li className={`sidebar-item subsection ${location.pathname === "/incidents-auto-assignment" ? "active" : ""}`}>
                        <Link to="/incidents-auto-assignment" className="sidebar-link">
                          <MdAutoAwesome size={14} className="link-icon" />
                          <span className="link-text">Auto Assignment</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Performance Monitoring Section */}
                <li className="sidebar-section">
                  <div 
                    className="section-header" 
                    onClick={() => toggleSection('batchPerformance')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="header-content">
                      <MdBarChart size={16} className="section-icon" />
                      <span className="section-title">Performance Monitoring</span>
                    </div>
                    {expandedSections.batchPerformance ? 
                      <RiArrowDownSLine size={14} className="chevron-icon" /> : 
                      <RiArrowRightSLine size={14} className="chevron-icon" />
                    }
                  </div>
                  {expandedSections.batchPerformance && (
                    <ul className="subsection-list">
                      <li className={`sidebar-item subsection ${location.pathname === "/process-monitor/thanksgiving" ? "active" : ""}`}>
                        <Link to="/process-monitor/thanksgiving" className="sidebar-link">
                          <MdSpeed size={14} className="link-icon" />
                          <span className="link-text">Batch Monitoring</span>
                        </Link>
                      </li>
                      <li className={`sidebar-item subsection ${location.pathname === "/system-monitoring" ? "active" : ""}`}>
                        <Link to="/system-monitoring" className="sidebar-link">
                          <MdVisibility size={14} className="link-icon" />
                          <span className="link-text">System/Application Monitoring</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Resource Effectiveness Section */}
                <li className="sidebar-section">
                  <div 
                    className="section-header" 
                    onClick={() => toggleSection('resourceEffectiveness')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="header-content">
                      <MdPeople size={16} className="section-icon" />
                      <span className="section-title">Resource Effectiveness</span>
                    </div>
                    {expandedSections.resourceEffectiveness ? 
                      <RiArrowDownSLine size={14} className="chevron-icon" /> : 
                      <RiArrowRightSLine size={14} className="chevron-icon" />
                    }
                  </div>
                  {expandedSections.resourceEffectiveness && (
                    <ul className="subsection-list">
                      <li className={`sidebar-item subsection ${location.pathname === "/resource-queue-length" ? "active" : ""}`}>
                        <Link to="/resource-queue-length" className="sidebar-link">
                          <MdQueue size={14} className="link-icon" />
                          <span className="link-text">Queue Length and trend</span>
                        </Link>
                      </li>
                      <li className={`sidebar-item subsection ${location.pathname === "/resource-incidents-resolved" ? "active" : ""}`}>
                        <Link to="/resource-incidents-resolved" className="sidebar-link">
                          <MdCheckCircle size={14} className="link-icon" />
                          <span className="link-text">% of incidents resolved and trend</span>
                        </Link>
                      </li>
                      <li className={`sidebar-item subsection ${location.pathname === "/resource-time-per-resolution" ? "active" : ""}`}>
                        <Link to="/resource-time-per-resolution" className="sidebar-link">
                          <MdAccessTimeFilled size={14} className="link-icon" />
                          <span className="link-text">Time per resolution and trend</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Troubleshooting Assistance Section */}
                <li className="sidebar-section">
                  <div 
                    className="section-header" 
                    onClick={() => toggleSection('troubleshooting')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="header-content">
                      <MdBuild size={16} className="section-icon" />
                      <span className="section-title">Troubleshooting Assist...</span>
                    </div>
                    {expandedSections.troubleshooting ? 
                      <RiArrowDownSLine size={14} className="chevron-icon" /> : 
                      <RiArrowRightSLine size={14} className="chevron-icon" />
                    }
                  </div>
                  {expandedSections.troubleshooting && (
                    <ul className="subsection-list">
                      <li className={`sidebar-item subsection ${location.pathname === "/kedb" ? "active" : ""}`}>
                        <Link to="/kedb" className="sidebar-link">
                          <MdLightbulb size={14} className="link-icon" />
                          <span className="link-text">Suggested Actions - Knowledge Bank</span>
                        </Link>
                      </li>
                      <li className={`sidebar-item subsection ${location.pathname === "/web-suggested-actions" ? "active" : ""}`}>
                        <Link to="/web-suggested-actions" className="sidebar-link">
                          <MdSearch size={14} className="link-icon" />
                          <span className="link-text">Suggested Actions - Web Search</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Value Creation Section */}
                <li className="sidebar-section">
                  <div 
                    className="section-header" 
                    onClick={() => toggleSection('areasOfImprovement')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="header-content">
                      <MdTrendingUp size={16} className="section-icon" />
                      <span className="section-title">Value Creation</span>
                    </div>
                    {expandedSections.areasOfImprovement ? 
                      <RiArrowDownSLine size={14} className="chevron-icon" /> : 
                      <RiArrowRightSLine size={14} className="chevron-icon" />
                    }
                  </div>
                  {expandedSections.areasOfImprovement && (
                    <ul className="subsection-list">
                      <li className={`sidebar-item subsection ${location.pathname === "/preventive-measures" ? "active" : ""}`}>
                        <Link to="/preventive-measures" className="sidebar-link">
                          <MdSecurity size={14} className="link-icon" />
                          <span className="link-text">Preventive Measures</span>
                        </Link>
                      </li>
                      <li className={`sidebar-item subsection ${location.pathname === "/self-service-actions" ? "active" : ""}`}>
                        <Link to="/self-service-actions" className="sidebar-link">
                          <MdSelfImprovement size={14} className="link-icon" />
                          <span className="link-text">Self Service Actions</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Potential Automation Section */}
                <li className="sidebar-section">
                  <div 
                    className="section-header" 
                    onClick={() => toggleSection('potentialAutomation')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="header-content">
                      <MdSmartToy size={16} className="section-icon" />
                      <span className="section-title">Potential Automation</span>
                    </div>
                    {expandedSections.potentialAutomation ? 
                      <RiArrowDownSLine size={14} className="chevron-icon" /> : 
                      <RiArrowRightSLine size={14} className="chevron-icon" />
                    }
                  </div>
                  {expandedSections.potentialAutomation && (
                    <ul className="subsection-list">
                      <li className={`sidebar-item subsection ${location.pathname === "/automation-target-areas" ? "active" : ""}`}>
                        <Link to="/automation-target-areas" className="sidebar-link">
                          <MdLocationOn size={14} className="link-icon" />
                          <span className="link-text">Target Areas</span>
                        </Link>
                      </li>
                      <li className={`sidebar-item subsection ${location.pathname === "/automation-preventive-alerts" ? "active" : ""}`}>
                        <Link to="/automation-preventive-alerts" className="sidebar-link">
                          <MdNotifications size={14} className="link-icon" />
                          <span className="link-text">Preventive Alerts</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Effectiveness of Measures Section */}
                <li className="sidebar-section">
                  <div 
                    className="section-header" 
                    onClick={() => toggleSection('effectivenessOfMeasures')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="header-content">
                      <MdCheckCircle size={16} className="section-icon" />
                      <span className="section-title">Effectiveness of Measur...</span>
                    </div>
                    {expandedSections.effectivenessOfMeasures ? 
                      <RiArrowDownSLine size={14} className="chevron-icon" /> : 
                      <RiArrowRightSLine size={14} className="chevron-icon" />
                    }
                  </div>
                  {expandedSections.effectivenessOfMeasures && (
                    <ul className="subsection-list">
                      <li className={`sidebar-item subsection ${location.pathname === "/effectiveness-occurrence" ? "active" : ""}`}>
                        <Link to="/effectiveness-occurrence" className="sidebar-link">
                          <MdEventNote size={14} className="link-icon" />
                          <span className="link-text">Occurrence post implementation</span>
                        </Link>
                      </li>
                      <li className={`sidebar-item subsection ${location.pathname === "/effectiveness-resolution-time" ? "active" : ""}`}>
                        <Link to="/effectiveness-resolution-time" className="sidebar-link">
                          <MdHistory size={14} className="link-icon" />
                          <span className="link-text">Resolution time post implementation</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
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