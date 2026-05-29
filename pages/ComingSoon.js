import React from 'react';

const ComingSoon = ({ pageTitle }) => (
  <div
    style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
    }}
  >
    {pageTitle ? (
      <h2 style={{ fontSize: '1.25rem', color: '#4B5563', marginBottom: '0.75rem', fontWeight: 600 }}>
        {pageTitle}
      </h2>
    ) : null}
    <h1 style={{ fontSize: '2rem', color: '#374151', marginBottom: '1rem' }}>Coming Soon</h1>
    <p style={{ color: '#6B7280', fontSize: '1.1rem', textAlign: 'center', maxWidth: '32rem' }}>
      This page is under construction. Please check back later!
    </p>
  </div>
);

export default ComingSoon;


