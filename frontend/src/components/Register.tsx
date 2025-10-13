import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { RegisterData } from '../types';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    password_confirm: '',
    name: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div>
          <h2 className="auth-title gradient-text">
            Join Rise
          </h2>
          <p className="auth-subtitle">
            Start your journey to better productivity
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="form-input"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="form-input"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password_confirm" className="form-label">
              Confirm Password
            </label>
            <input
              id="password_confirm"
              name="password_confirm"
              type="password"
              required
              className="form-input"
              placeholder="Confirm your password"
              value={formData.password_confirm}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="loading-spinner mr-2"></span>
                  Creating account...
                </span>
              ) : (
                'Sign up'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="auth-link"
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
