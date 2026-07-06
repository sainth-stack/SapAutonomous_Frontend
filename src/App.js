import "./App.css";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AppLayout } from './layout/AppLayout';
import Home from "./pages/home";
import BatchMonitor from "./pages/batch-monitor";
import FailedIdocMonitoring from "./pages/failed-idoc-monitoring";
import SapJoule from "./pages/self-service-actions";
import AdminLogs from "./pages/admin/Logs";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route element={<AppLayout />}>
            <Route path="/process-monitor/thanksgiving" element={<BatchMonitor />} />
            <Route path="/process-monitor/failed-idocs" element={<FailedIdocMonitoring />} />
            <Route path="/self-service-actions" element={<SapJoule />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
