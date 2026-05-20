import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdPerson, MdLogout } from 'react-icons/md';
import { RiArrowDownSLine as ChevronDown } from 'react-icons/ri';
import './styles.css';
import lg1Logo from '../../assets/lg1.png';
import lg2Logo from '../../assets/lg2.png';
import { getStoredUser, clearAuthSession } from '../../utils/authSession';

const Navbar = () => {
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const user = getStoredUser();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setUserMenuOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <nav className="top-navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <img src={lg1Logo} alt="Logo 1" className="navbar-logo-left" />
        </div>
        <div className="navbar-center">
          {/* <span className="navbar-title">AMS ProEn</span> */}
        </div>
        <div className="navbar-right">
        <img src={lg2Logo} alt="Logo 2" className="navbar-logo-right" />
          {user && (
            <div className="navbar-user-menu" ref={menuRef}>
              <button
                type="button"
                className="navbar-user-trigger"
                onClick={() => setUserMenuOpen((o) => !o)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label="User menu"
              >
                <span className="navbar-user-avatar">
                  <MdPerson size={20} />
                </span>
                <span className="navbar-user-name">{user.name}</span>
                <ChevronDown size={18} className={`navbar-user-chevron ${userMenuOpen ? 'open' : ''}`} />
              </button>
              {userMenuOpen && (
                <div className="navbar-user-dropdown">
                  <div className="navbar-user-dropdown-header">
                    <span className="navbar-user-dropdown-email">{user.email}</span>
                  </div>
                  <button type="button" className="navbar-user-dropdown-item logout" onClick={handleLogout}>
                    <MdLogout size={18} />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;