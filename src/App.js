import "./App.css";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { AppLayout } from './layout/AppLayout';
import Home from "./pages/home";
import BatchMonitor from "./pages/batch-monitor";
import FailedIdocMonitoring from "./pages/failed-idoc-monitoring";
import SapJoule from "./pages/self-service-actions";
import AdminLogs from "./pages/admin/Logs";
import { Login } from "./pages/Login";
import { isAuthenticatedSession } from "./utils/authSession";

function RequireAuth({ children }) {
  const location = useLocation();
  if (!isAuthenticatedSession()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          } />

          <Route element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }>
            <Route path="/process-monitor/thanksgiving" element={<BatchMonitor />} />
            <Route path="/process-monitor/failed-idocs" element={<FailedIdocMonitoring />} />
            <Route path="/self-service-actions" element={<SapJoule />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
