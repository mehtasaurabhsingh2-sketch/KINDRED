import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Shield, Users, Sparkles } from 'lucide-react';
import Hero from '../components/Hero/Hero';
import FeatureGrid from '../components/FeatureGrid/FeatureGrid';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <Hero />
      <FeatureGrid />
      
      <section className="benefits-section">
        <h2 className="benefits-title">Why Choose Kindred?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon-wrapper">
              <Clock className="benefit-icon" size={32} />
            </div>
            <h3 className="benefit-title">Available 24/7</h3>
            <p className="benefit-desc">Always here for you, anytime, anywhere. Your companion never sleeps.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon-wrapper">
              <Sparkles className="benefit-icon" size={32} />
            </div>
            <h3 className="benefit-title">Personalized Conversations</h3>
            <p className="benefit-desc">Interactions tailored specifically to your needs, mood, and personality.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon-wrapper">
              <Users className="benefit-icon" size={32} />
            </div>
            <h3 className="benefit-title">Multiple Personalities</h3>
            <p className="benefit-desc">Switch between mentors, friends, or coaches depending on what you need.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon-wrapper">
              <Shield className="benefit-icon" size={32} />
            </div>
            <h3 className="benefit-title">Private and Secure</h3>
            <p className="benefit-desc">Your conversations are yours alone. We prioritize your privacy above all.</p>
          </div>
        </div>
      </section>
      
      <section className="cta-section">
        <h2 className="cta-title">Start your first meaningful conversation today.</h2>
        <Link to="/dashboard" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
          Open Dashboard
        </Link>
      </section>
    </div>
  );
};

export default Home;
