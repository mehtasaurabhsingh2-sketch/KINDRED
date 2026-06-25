import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import './ModeCard.css';

const ModeCard = ({ mode }) => {
  const IconComponent = Icons[mode.icon] || Icons.Smile;

  return (
    <Link to={`/chat?mode=${mode.id}`} className="mode-card">
      <div className="mode-icon-container" style={{ color: mode.color }}>
        <IconComponent size={24} />
      </div>
      <h3 className="mode-title">{mode.name}</h3>
      <p className="mode-desc">{mode.description}</p>
    </Link>
  );
};

export default ModeCard;
