import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <h1 className="not-found-code">404</h1>
      <h2 className="not-found-title">Page Not Found</h2>
      <p className="not-found-desc">
        Oops! It looks like the page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary">
        <Home size={20} />
        Return Home
      </Link>
    </div>
  );
};

export default NotFound;
