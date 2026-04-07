import { useState } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password.trim() || !role) {
      const message = 'Email, password, and role are required.';
      setError(message);
      toast.error(message);
      return;
    }

    try {
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      const { token, user } = response.data || {};

      if (!token || !user) {
        throw new Error('Invalid login response.');
      }

      if (user.role !== role) {
        const message = 'Selected role does not match your account role.';
        setError(message);
        toast.error(message);
        return;
      }

      setError('');
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('currentUserEmail', user.email || email.trim().toLowerCase());
      localStorage.setItem('userName', user.name || email.trim().split('@')[0]);
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (apiError) {
      const message =
        apiError?.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      toast.error(message);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Login</h1>
        <form className="auth-form" onSubmit={handleLogin}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <label className="field">
            <span>Role</span>
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="">Select role</option>
              <option value="Principal">Principal</option>
              <option value="HOD">HOD</option>
              <option value="Professor">Professor</option>
              <option value="Student">Student</option>
            </select>
          </label>
          {error ? <p className="form-message form-message--error">{error}</p> : null}
          <button type="submit" className="button button--primary">
            Login
          </button>
          <p>
            Need an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Login;

