import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Settings, Users } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
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
        <button className="sidebar-link" style={{ width: '100%', textAlign: 'left' }}>
          <Settings size={20} className="sidebar-link-icon" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
