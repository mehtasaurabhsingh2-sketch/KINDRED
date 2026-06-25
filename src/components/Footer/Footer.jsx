import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <Link to="/" className="footer-logo">
        <Sparkles className="footer-icon" size={20} />
        <span>Kindred</span>
      </Link>
      
      <div className="footer-links">
        <Link to="/" className="footer-link">Home</Link>
        <Link to="/dashboard" className="footer-link">Dashboard</Link>
        <Link to="/chat" className="footer-link">Chat</Link>
      </div>
      
      <div className="footer-copy">
        &copy; {year} Kindred AI Companion. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
