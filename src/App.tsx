import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import './App.css';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return isLogin ? (
      <Login onSwitchToRegister={() => setIsLogin(false)} />
    ) : (
      <Register onSwitchToLogin={() => setIsLogin(true)} />
    );
  }

  // Check if user needs to complete onboarding
  if (user && !user.is_onboarding_complete) {
    return <Onboarding onComplete={() => {}} />;
  }

  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
