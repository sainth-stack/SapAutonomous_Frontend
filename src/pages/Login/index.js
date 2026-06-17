import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { getDefaultPathForUser } from "../../utils/permissions";
import { baseURL, adminResetPasswordURL, DEFAULT_USER_PASSWORD } from "../../const";
import { sendAppLog, getLogMetaFromPath } from "../../utils/logger";
import { getStoredUser, isAuthenticatedSession, setAuthSession } from "../../utils/authSession";
import "./index.css";

async function loginWithCredentials(email, password) {
  const apiRes = await fetch(`${baseURL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });

  if (!apiRes.ok) {
    return { ok: false };
  }

  const data = await apiRes.json();
  return { ok: true, data };
}

export function Login() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();

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

  const completeLogin = (data) => {
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
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (password === DEFAULT_USER_PASSWORD) {
        const result = await loginWithCredentials(email, password);
        if (!result.ok) {
          message.error("Invalid email or password. Please check your credentials.");
          setLoading(false);
          return;
        }
        setShowResetModal(true);
        setNewPassword("");
        setConfirmPassword("");
        setLoading(false);
        return;
      }

      const result = await loginWithCredentials(email, password);
      if (result.ok) {
        completeLogin(result.data);
      } else {
        message.error("Invalid email or password. Please check your credentials.");
      }
    } catch (_) {
      message.error("Unable to connect to server. Please try again.");
    }

    setLoading(false);
  };

  const closeResetModal = () => {
    if (resetLoading) return;
    setShowResetModal(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!newPassword.trim()) {
      message.error("Please enter a new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      message.error("Passwords do not match. Please try again.");
      return;
    }

    if (newPassword === DEFAULT_USER_PASSWORD) {
      message.error("Please choose a password different from the default password.");
      return;
    }

    setResetLoading(true);

    try {
      const apiRes = await fetch(adminResetPasswordURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: newPassword,
        }),
      });

      if (!apiRes.ok) {
        const errData = await apiRes.json().catch(() => ({}));
        const errMsg =
          typeof errData?.detail === "string"
            ? errData.detail
            : "Failed to reset password. Please try again.";
        message.error(errMsg);
        setResetLoading(false);
        return;
      }

      message.success("Password updated successfully. Signing you in...");
      setShowResetModal(false);
      setPassword(newPassword);

      const loginResult = await loginWithCredentials(email, newPassword);
      if (loginResult.ok) {
        completeLogin(loginResult.data);
      } else {
        message.info("Password updated. Please sign in with your new password.");
        setPassword("");
      }
    } catch (_) {
      message.error("Unable to connect to server. Please try again.");
    }

    setResetLoading(false);
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

      {showResetModal && (
        <div className="login-reset-overlay" onClick={closeResetModal}>
          <div
            className="login-reset-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-password-title"
          >
            <button
              type="button"
              className="login-reset-close"
              onClick={closeResetModal}
              disabled={resetLoading}
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="login-reset-icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <h2 id="reset-password-title" className="login-reset-title">
              Reset Your Password
            </h2>
            <p className="login-reset-subtitle">
              This is your first sign-in with the default password. Please set a new password to continue.
            </p>

            <form className="login-reset-form" onSubmit={handleResetPassword}>
              <div className="login-reset-field">
                <label className="login-reset-label" htmlFor="new-password">
                  New Password
                </label>
                <div className="login-reset-password-wrap">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="login-reset-input"
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="login-reset-eye"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label="Toggle new password visibility"
                  >
                    {showNewPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                  </button>
                </div>
              </div>

              <div className="login-reset-field">
                <label className="login-reset-label" htmlFor="confirm-password">
                  Confirm Password
                </label>
                <div className="login-reset-password-wrap">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="login-reset-input"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="login-reset-eye"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                  </button>
                </div>
              </div>

              <div className="login-reset-actions">
                <button
                  type="button"
                  className="login-reset-cancel-btn"
                  onClick={closeResetModal}
                  disabled={resetLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`login-reset-submit-btn ${resetLoading ? "loading" : ""}`}
                  disabled={resetLoading}
                >
                  {resetLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
