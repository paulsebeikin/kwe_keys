import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login({ inline = false, onSuccess = null }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) throw new Error('Invalid credentials');
      
      const { token, firstName, lastName } = await response.json();
      login(token, { firstName, lastName });
      if (onSuccess) onSuccess();
      if (!inline) navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}
      <div className="form-control">
        <input
          type="text"
          required
          className="input input-bordered w-full"
          placeholder="Username"
          value={credentials.username}
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
        />
      </div>
      <div className="form-control">
        <input
          type="password"
          required
          className="input input-bordered w-full"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        />
      </div>
      <button type="submit" className="btn btn-primary w-full">
        Sign in
      </button>
    </form>
  );

  if (inline) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {formContent}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center min-h-screen bg-base-200">
      <div className="card bg-base-100 shadow-xl w-96">
        <div className="card-body">
          <h2 className="card-title justify-center mb-4">Sign in to your account</h2>
          {formContent}
        </div>
      </div>
    </div>
  );
}

export default Login;
