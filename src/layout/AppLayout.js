import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdLogout } from 'react-icons/md';
import { clearAuthSession, getStoredUser } from '../utils/authSession';
import './AppLayout.css';

export function AppLayout() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-layout">
      <div className="app-layout-topbar">
        <button
          type="button"
          className="app-layout-back"
          onClick={() => navigate('/')}
          aria-label="Back to home"
        >
          <MdArrowBack size={18} />
          <span>Back</span>
        </button>

        <div className="app-layout-topbar-right">
          {user?.name && (
            <span className="app-layout-user">{user.name}</span>
          )}
          <button
            type="button"
            className="app-layout-logout"
            onClick={handleLogout}
            aria-label="Sign out"
          >
            <MdLogout size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </div>
      <div className="app-layout-content">
        <Outlet />
      </div>
    </div>
  );
}
