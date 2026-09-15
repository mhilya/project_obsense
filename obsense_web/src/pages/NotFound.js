import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <h2>Halaman Tidak Ditemukan</h2>
      <p>Halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
      <Link to="/dashboard" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
        Kembali ke Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
