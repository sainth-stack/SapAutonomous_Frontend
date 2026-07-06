import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import './AppLayout.css';

export function AppLayout() {
  const navigate = useNavigate();

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
      </div>
      <div className="app-layout-content">
        <Outlet />
      </div>
    </div>
  );
}
