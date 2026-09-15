import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { User, Mail, Lock, UserPlus, AlertCircle } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        navigate('/login');
      } else {
        setError(result.message || 'Registrasi gagal.');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form-wrapper">
      <h2>Buat Akun Baru</h2>
      <p className="auth-subtitle">Daftarkan akun baru untuk mulai mengakses sistem</p>

      {error && (
        <div className="alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="name">Nama Lengkap</label>
          <div className="input-with-icon">
            <User size={18} className="input-icon" />
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <div className="input-with-icon">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-with-icon">
            <Lock size={18} className="input-icon" />
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Konfirmasi Password</label>
          <div className="input-with-icon">
            <Lock size={18} className="input-icon" />
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          <UserPlus size={18} />
          <span>{isSubmitting ? 'Mendaftarkan...' : 'Daftar Sekarang'}</span>
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Sudah punya akun? <Link to="/login">Masuk disini</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
