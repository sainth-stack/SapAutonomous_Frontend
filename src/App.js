import "./App.css";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import SelfMonitoring from "./pages/self-monitoring";
import IncidentManagement from "./pages/incident-management";
import KEDB from "./pages/kedb";
import DataSource from "./pages/data-source";
import {AdminLayout} from './layout'
import { MainPages } from "./pages/data";
import ComingSoon from "./pages/ComingSoon";
import BIReport from "./pages/bi-report";
import SLACombined from "./pages/sla-combined";
import ResourceEffectivenessConsultant from "./pages/resource-effectiveness-consultant";
import SystemMonitoring from "./pages/system-monitoring";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
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

            {/* Performance Monitoring Section */}
            <Route path="/process-monitor/thanksgiving" element={<ComingSoon />} />
            <Route path="/system-monitoring" element={<SystemMonitoring />} />
            <Route path="/system-monitoring/sap-system" element={<ComingSoon />} />

            {/* Resource Effectiveness Section */}
            <Route path="/resource-queue-length" element={<ComingSoon />} />
            <Route path="/resource-incidents-resolved" element={<ResourceEffectivenessConsultant />} />
            <Route path="/resource-time-per-resolution" element={<ComingSoon />} />

            {/* Troubleshooting Assistance Section */}
            <Route path="/web-suggested-actions" element={<ComingSoon />} />

            {/* Value Creation Section */}
            <Route path="/preventive-measures" element={<ComingSoon />} />
            <Route path="/self-service-actions" element={<ComingSoon />} />

            {/* Potential Automation Section */}
            <Route path="/automation-target-areas" element={<ComingSoon />} />
            <Route path="/automation-preventive-alerts" element={<ComingSoon />} />

            {/* Effectiveness of Measures Section */}
            <Route path="/effectiveness-occurrence" element={<ComingSoon />} />
            <Route path="/effectiveness-resolution-time" element={<ComingSoon />} />

            {/* BI Report */}
            <Route path="/bi-report" element={<BIReport />} />

            {/* 404 fallback */}
            <Route path="*" element={<ComingSoon />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;


