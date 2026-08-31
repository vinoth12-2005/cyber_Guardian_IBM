import React from 'react';

export const SkeletonLoader: React.FC = () => {
  const pulse = {
    background: 'var(--surface-2)',
    border: '1px solid var(--border-subtle)',
  };

  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-36 rounded-3xl" style={pulse} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="h-72 rounded-3xl" style={pulse} />
        <div className="h-72 rounded-3xl lg:col-span-2" style={pulse} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl" style={pulse} />
        ))}
      </div>

      <div className="h-32 rounded-3xl" style={pulse} />
      <div className="h-64 rounded-3xl" style={pulse} />
    </div>
  );
};
