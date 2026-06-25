import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Compass } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero animated-bg">
      <div className="hero-bg-elements">
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>
      </div>
      
      <div className="hero-content">
        <h1 className="hero-title">
          <span className="gradient-text">Kindred</span>
        </h1>
        <p className="hero-subtitle">
          Your AI Companion For Meaningful Conversations
        </p>
        
        <div className="hero-buttons">
          <Link to="/dashboard" className="btn-primary">
            <MessageCircle size={20} />
            Start Chat
          </Link>
          <a href="#modes" className="btn-secondary">
            <Compass size={20} />
            Explore Modes
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
