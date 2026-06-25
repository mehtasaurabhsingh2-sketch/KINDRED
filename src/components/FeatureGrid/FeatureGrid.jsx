import React from 'react';
import ModeCard from '../ModeCard/ModeCard';
import { modes } from '../../data/modes';
import './FeatureGrid.css';

const FeatureGrid = () => {
  return (
    <section id="modes" className="feature-grid-section">
      <div className="feature-grid-header">
        <h2 className="feature-grid-title">Discover Your Companion</h2>
        <p className="feature-grid-subtitle">
          Choose from 8 distinct personalities designed to support you in every aspect of your life.
        </p>
      </div>
      
      <div className="feature-grid">
        {modes.map((mode) => (
          <ModeCard key={mode.id} mode={mode} />
        ))}
      </div>
    </section>
  );
};

export default FeatureGrid;
