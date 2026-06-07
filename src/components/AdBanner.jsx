import React from 'react';

export default function AdBanner({ compact = false }) {
  if (compact) {
    return (
      <div style={{
        width: '100%', maxWidth: '468px', margin: '1rem auto',
        padding: '0.3rem 0.75rem', background: '#1e293b',
        border: '1px solid #334155', borderRadius: '0.375rem',
        position: 'relative', minHeight: '50px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ position: 'absolute', top: '0.15rem', left: '0.4rem', fontSize: '0.5rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>Ad</span>
        <div style={{ textAlign: 'center', color: '#475569', fontSize: '0.7rem' }}>
          <span style={{ opacity: 0.5, marginRight: '0.3rem' }}>📢</span>
          Sponsor
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%', maxWidth: '200px', margin: '1rem auto',
      padding: '0.5rem', background: '#1e293b',
      border: '1px solid #334155', borderRadius: '0.375rem',
      position: 'relative', minHeight: '120px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ position: 'absolute', top: '0.2rem', left: '0.4rem', fontSize: '0.5rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>Ad</span>
      <div style={{ textAlign: 'center', color: '#475569', fontSize: '0.7rem' }}>
        <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem', opacity: 0.5 }}>📢</div>
        <div>Ad Space</div>
      </div>
    </div>
  );
}