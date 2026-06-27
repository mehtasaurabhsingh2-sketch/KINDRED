import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import AppRoutes from './routes/AppRoutes';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import StyleSwitcher from './components/StyleSwitcher/StyleSwitcher';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ThemeProvider>
          <Router>
            <StyleSwitcher />
            <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <div style={{ flex: 1 }}>
                <AppRoutes />
              </div>
              <Footer />
            </div>
          </Router>
        </ThemeProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
