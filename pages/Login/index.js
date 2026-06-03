import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { getDefaultPathForUser } from "../../utils/permissions";
import { baseURL } from "../../const";
import { sendAppLog, getLogMetaFromPath } from "../../utils/logger";
import { getStoredUser, isAuthenticatedSession, setAuthSession } from "../../utils/authSession";
import "./index.css";

export function Login() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // If already logged in, redirect to default path (same logic as post-login).
  useEffect(() => {
    const user = getStoredUser();
    if (isAuthenticatedSession() && user) {
      const defaultPath = getDefaultPathForUser(!!(user.isSuperAdmin), user.allowedPaths ?? null);
      navigate(defaultPath, { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const path = window.location.pathname;
    const { moduleName } = getLogMetaFromPath(path);
    sendAppLog({
      pathname: path,
      logType: "Page Opened",
      content: `${moduleName} — page opened (${path})`
    });
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const apiRes = await fetch(`${baseURL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      if (apiRes.ok) {
        const data = await apiRes.json();
        const userData = {
          email: data.email,
          name: data.name,
          isAuthenticated: true,
          isSuperAdmin: data.is_super_admin || false,
          accessAllData: data.access_all_data || false,
          allowedPaths: data.allowed_paths ?? null,
          loginTime: new Date().toISOString(),
        };
        setAuthSession(userData);
        message.success(`Welcome ${data.name}!`);
        const defaultPath = getDefaultPathForUser(!!data.is_super_admin, data.allowed_paths ?? null);
        setTimeout(() => navigate(defaultPath), 500);
      } else {
        message.error("Invalid email or password. Please check your credentials.");
      }
    } catch (_) {
      message.error("Unable to connect to server. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="login-container-centered">
      <div className="login-form-panel-centered">
        <div className="login-form-wrapper">
          <div className="login-form">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to your account to continue</p>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="label2" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your company email"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="label2" htmlFor="password">
                  Password
                </label>
                <div className="password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <div
                    className="eye-icon-container"
                    onClick={() => setShowPassword(!showPassword)}
                    onKeyDown={(e) => e.key === "Enter" && setShowPassword((v) => !v)}
                    role="button"
                    tabIndex={0}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <MdVisibilityOff className="eye3" size={18} />
                    ) : (
                      <MdVisibility className="eye3" size={18} />
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className={`login-button ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
