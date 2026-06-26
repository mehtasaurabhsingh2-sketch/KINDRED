import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = false }) => {
  const containerStyle = fullScreen ? {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: 'var(--color-bg)',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999
  } : {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem'
  };

  return (
    <div style={containerStyle}>
      <Loader2 
        size={40} 
        color="var(--color-primary)" 
        style={{ animation: 'spin 1s linear infinite' }} 
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
