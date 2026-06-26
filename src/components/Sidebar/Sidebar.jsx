import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Settings, Users, LogOut } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-heading">Menu</h3>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"} end>
          <LayoutDashboard size={20} className="sidebar-link-icon" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <MessageSquare size={20} className="sidebar-link-icon" />
          <span>Recent Chats</span>
        </NavLink>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-heading">Explore</h3>
        <NavLink to="/dashboard#modes" className="sidebar-link">
          <Users size={20} className="sidebar-link-icon" />
          <span>Modes</span>
        </NavLink>
      </div>

      <div className="sidebar-section" style={{ marginTop: 'auto' }}>
        <NavLink to="/settings" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <Settings size={20} className="sidebar-link-icon" />
          <span>Settings</span>
        </NavLink>
        <button 
          className="sidebar-link" 
          style={{ width: '100%', textAlign: 'left', color: '#ef4444' }}
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut size={20} className="sidebar-link-icon" />
          <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
