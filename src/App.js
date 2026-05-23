import "./App.css";
import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import IncidentManagement from "./pages/incident-management";
import KEDB from "./pages/kedb";
import DataSource from "./pages/data-source";
import { AdminLayout } from './layout';
import { Login } from "./pages/Login";
import { MainPages } from "./pages/data";
import SlaExportPage from "./pages/sla-export";
import ComingSoon from "./pages/ComingSoon";
import SLACombined from "./pages/sla-combined";
import ResourceEffectivenessConsultant from "./pages/resource-effectiveness-consultant";
import SystemMonitoring from "./pages/system-monitoring";
import BatchMonitor from "./pages/batch-monitor";
import JobConfiguration from "./pages/batch-monitor/JobConfiguration";
import WebSuggestedActions from "./pages/web-suggested-actions";
import SelfServiceActions from "./pages/self-service-actions";
import AdminRoles from "./pages/admin/Roles";
import AdminUsers from "./pages/admin/Users";
import { migrateLegacyAuthSession } from "./utils/authSession";

function App() {
  useEffect(() => {
    migrateLegacyAuthSession();
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/sla-export" element={<SlaExportPage />} />
          <Route element={<AdminLayout />}>
            <Route path="/" element={<DataSource />} />
            <Route path="/data-source" element={<DataSource />} />
            <Route path="/self-monitoring" element={<MainPages />} />
            <Route path="/incident-management" element={<IncidentManagement />} />
            <Route path="/kedb" element={<KEDB />} />

            {/* SLA Section */}
            <Route path="/sla-resolution-response-time" element={<SLACombined />} />

            {/* Incident Management Section */}
            <Route path="/incidents-percent" element={<ComingSoon />} />
            <Route path="/incidents-recurring" element={<ComingSoon />} />
            <Route path="/incidents-auto-assignment" element={<ComingSoon />} />

            {/* Performance Monitoring Section - Background Job Monitoring */}
            <Route path="/process-monitor/thanksgiving/configuration" element={<JobConfiguration />} />
            <Route path="/process-monitor/thanksgiving" element={<BatchMonitor />} />
            <Route path="/system-monitoring" element={<SystemMonitoring />} />
            <Route path="/system-monitoring/sap-system" element={<ComingSoon />} />

            {/* Resource Effectiveness Section */}
            <Route path="/resource-queue-length" element={<ComingSoon />} />
            <Route path="/resource-incidents-resolved" element={<ResourceEffectivenessConsultant />} />
            <Route path="/resource-time-per-resolution" element={<ComingSoon />} />

            {/* Troubleshooting Assistance Section */}
            <Route path="/suggested-actions-depository" element={<ComingSoon />} />
            <Route path="/web-suggested-actions" element={<WebSuggestedActions />} />

            {/* Value Creation Section */}
            <Route path="/preventive-measures" element={<ComingSoon />} />
            <Route path="/self-service-actions" element={<SelfServiceActions />} />

            {/* Continuous Improvements */}
            <Route path="/automation-target-areas" element={<ComingSoon pageTitle="Potential Automation" />} />
            <Route path="/automation-preventive-alerts" element={<ComingSoon pageTitle="Proactive Alerts" />} />
            <Route path="/continuous-improvements/self-diagnosis" element={<ComingSoon pageTitle="Self Diagnosis" />} />
            <Route path="/continuous-improvements/improvise-mttr" element={<ComingSoon pageTitle="Improvise MTTR" />} />

            {/* Effectiveness of Measures Section */}
            <Route path="/effectiveness-occurrence" element={<ComingSoon />} />
            <Route path="/effectiveness-resolution-time" element={<ComingSoon />} />


            {/* Admin - super admin only enforced in layout */}
            <Route path="/admin/roles" element={<AdminRoles />} />
            <Route path="/admin/users" element={<AdminUsers />} />

            {/* 404 fallback */}
            <Route path="*" element={<ComingSoon />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;


