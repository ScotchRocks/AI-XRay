import React from 'react';

export default function Header({ onShowInfo }) {
  return (
    <header style={{
      borderBottom: '1px solid #1e293b',
      padding: '0.75rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(8, 13, 26, 0.9)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <svg width="18" height="18" viewBox="0 0 512 512">
          <circle cx="256" cy="256" r="220" fill="none" stroke="url(#g)" strokeWidth="8"/>
          <circle cx="256" cy="200" r="40" fill="url(#g)" opacity="0.9"/>
          <line x1="256" y1="240" x2="180" y2="320" stroke="url(#g)" strokeWidth="4" strokeLinecap="round" opacity="0.7"/>
          <line x1="256" y1="240" x2="332" y2="320" stroke="url(#g)" strokeWidth="4" strokeLinecap="round" opacity="0.7"/>
          <line x1="256" y1="240" x2="256" y2="330" stroke="url(#g)" strokeWidth="4" strokeLinecap="round" opacity="0.5"/>
          <circle cx="180" cy="320" r="16" fill="#22d3ee" opacity="0.6"/>
          <circle cx="332" cy="320" r="16" fill="#a78bfa" opacity="0.6"/>
          <circle cx="256" cy="330" r="16" fill="#f472b6" opacity="0.6"/>
          <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#a78bfa"/></linearGradient></defs>
        </svg>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
          <span className="gradient-text">AI X-Ray</span>
        </h1>
        <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 500 }}>
          Reasoning Visualizer
        </span>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <a href="/help" style={{ color: '#64748b', fontSize: '0.8rem', textDecoration: 'none' }}>Help</a>
        <button
          onClick={onShowInfo}
          style={{
            background: '#1e293b', border: '1px solid #334155',
            color: '#94a3b8', padding: '0.3rem 0.75rem',
            borderRadius: '0.375rem', fontSize: '0.75rem',
            cursor: 'pointer',
          }}
        >
          How It Works
        </button>
      </div>
    </header>
  );
}