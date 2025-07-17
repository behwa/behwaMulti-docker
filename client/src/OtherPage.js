import React from "react";
import { Link } from 'react-router-dom';

const OtherPage = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>You're on another page</h1>
      <p>This is just a placeholder page.</p>
      <Link to="/" style={{ color: '#007bff', textDecoration: 'underline' }}>
        ← Go back home
      </Link>
    </div>
  );
};

export default OtherPage;
