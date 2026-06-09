import React from 'react';

export default function Header({ onShowInfo }) {
  return (
    <header style={{
      borderBottom: '1px solid rgba(30, 41, 59, 0.8)',
      padding: '0.7rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(7, 11, 21, 0.9)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 100,
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <svg width="20" height="20" viewBox="0 0 512 512">
          <circle cx="256" cy="256" r="220" fill="none" stroke="url(#g)" strokeWidth="6"/>
          <circle cx="256" cy="200" r="40" fill="url(#g)" opacity="0.9"/>
          <line x1="256" y1="240" x2="180" y2="320" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
          <line x1="256" y1="240" x2="332" y2="320" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
          <line x1="256" y1="240" x2="256" y2="330" stroke="#f472b6" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
          <circle cx="180" cy="320" r="16" fill="#22d3ee" opacity="0.5"/>
          <circle cx="332" cy="320" r="16" fill="#a78bfa" opacity="0.5"/>
          <circle cx="256" cy="330" r="16" fill="#f472b6" opacity="0.4"/>
          <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#a78bfa"/></linearGradient></defs>
        </svg>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
          <span className="gradient-text">AI X-Ray</span>
        </h1>
        <span style={{ color: '#334155', fontSize: '0.75rem', fontWeight: 500, fontStyle: 'italic' }}>
          See how AI thinks
        </span>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button
          onClick={onShowInfo}
          style={{
            background: 'transparent', border: '1px solid #1e293b',
            color: '#64748b', padding: '0.35rem 0.75rem',
            borderRadius: '0.375rem', fontSize: '0.75rem',
            cursor: 'pointer', transition: '0.2s',
          }}
          onMouseOver={e => { e.target.style.background = '#1e293b'; e.target.style.color = '#e2e8f0'; }}
          onMouseOut={e => { e.target.style.background = 'transparent'; e.target.style.color = '#64748b'; }}
        >
          How It Works
        </button>
      </div>
    </header>
  );
}