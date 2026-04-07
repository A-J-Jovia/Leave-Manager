import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim() || !role) {
      setError('All fields are required.');
      setSuccess('');
      return;
    }

    try {
      const response = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });
      console.log('Register API response:', response.data);

      setError('');
      setSuccess('Account created. Waiting for approval.');
      toast.success('Registration submitted successfully.');

      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (apiError) {
      const message =
        apiError?.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      setSuccess('');
      toast.error(message);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Register</h1>
        <form className="auth-form" onSubmit={handleRegister}>
          <label className="field">
            <span>Name</span>
            <input
              type="text"
              placeholder="Enter full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
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
              <option value="HOD">HOD</option>
              <option value="Professor">Professor</option>
              <option value="Student">Student</option>
            </select>
          </label>

          {error ? <p className="form-message form-message--error">{error}</p> : null}
          {success ? <p className="form-message form-message--success">{success}</p> : null}

          <button type="submit" className="button button--primary">
            Register
          </button>
        </form>
      </section>
    </main>
  );
}

export default Register;
