import React, { useEffect } from 'react';
import './styles.css';
import lg1Logo from '../../assets/lg1.png';
import lg2Logo from '../../assets/lg2.png';

const Navbar = () => {
  useEffect(() => {
    console.log('Navbar component mounted');
    console.log('lg1Logo path:', lg1Logo);
    console.log('lg2Logo path:', lg2Logo);
    
    // Check if images loaded successfully
    const img1 = new Image();
    const img2 = new Image();
    
    img1.onload = () => console.log('lg1 logo loaded successfully');
    img1.onerror = () => console.error('Failed to load lg1 logo');
    img1.src = lg1Logo;
    
    img2.onload = () => console.log('lg2 logo loaded successfully');
    img2.onerror = () => console.error('Failed to load lg2 logo');
    img2.src = lg2Logo;
  }, []);

  return (
    <nav className="top-navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <img src={lg1Logo} alt="Logo 1" className="navbar-logo-left" />
        </div>
        <div className="navbar-center">
          <span className="navbar-title">AMS ProEn</span>
        </div>
        <div className="navbar-right">
          <img src={lg2Logo} alt="Logo 2" className="navbar-logo-right" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;