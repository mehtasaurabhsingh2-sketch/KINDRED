import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, Sparkles } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="logo" onClick={closeMenu}>
        <Sparkles className="logo-icon" size={28} />
        <span>Kindred</span>
      </Link>

      {/* Desktop Navigation */}
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Home
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Dashboard
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Chat
        </NavLink>
      </div>

      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-btn" 
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <NavLink to="/" className="nav-link" onClick={closeMenu}>
          Home
        </NavLink>
        <NavLink to="/dashboard" className="nav-link" onClick={closeMenu}>
          Dashboard
        </NavLink>
        <NavLink to="/chat" className="nav-link" onClick={closeMenu}>
          Chat
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
