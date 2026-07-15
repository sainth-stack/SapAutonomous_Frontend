import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { isAuthenticatedSession, setAuthSession, getStoredUser } from "../../utils/authSession";
import { getDefaultPathForUser } from "../../utils/permissions";
import authData from "../../auth.json";
import "./index.css";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/process-monitor/thanksgiving";

  // If already logged in, redirect
  useEffect(() => {
    if (isAuthenticatedSession()) {
      const user = getStoredUser();
      const defaultPath = getDefaultPathForUser(!!(user?.isSuperAdmin), user?.allowedPaths ?? null);
      navigate(defaultPath, { replace: true });
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const match = authData.users.find(
        (u) =>
          u.email.toLowerCase() === email.trim().toLowerCase() &&
          u.password === password
      );

      if (!match) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      setAuthSession({
        email: match.email,
        name: match.name,
        isAuthenticated: true,
        isSuperAdmin: match.isSuperAdmin ?? false,
        allowedPaths: match.allowedPaths ?? null,
        loginTime: new Date().toISOString(),
      });

      const defaultPath = getDefaultPathForUser(!!match.isSuperAdmin, match.allowedPaths ?? null);
      navigate(defaultPath, { replace: true });
    }, 500);
  };

  return (
    <div className="login-container-centered">
      <div className="login-form-panel-centered">
        <div className="login-form-wrapper">
          <div className="login-form">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to your account to continue</p>

            {error && <div className="login-error-msg">{error}</div>}

            <form onSubmit={handleLogin} noValidate>
              <div className="form-group">
                <label className="label2" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                  autoFocus
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <div
                    className="eye-icon-container"
                    onClick={() => setShowPassword((v) => !v)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setShowPassword((v) => !v)}
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

export default Login;
