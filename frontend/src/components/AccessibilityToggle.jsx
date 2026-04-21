import React, { useEffect, useState } from 'react';

const AccessibilityToggle = ({ className = '' }) => {
  const [reduced, setReduced] = useState(() => localStorage.getItem('reduced-motion') === 'true');

  useEffect(() => {
    localStorage.setItem('reduced-motion', String(reduced));
    const body = document.body;
    if (reduced) body.setAttribute('data-reduced-motion', 'true');
    else body.removeAttribute('data-reduced-motion');
  }, [reduced]);

  return (
    <button
      type="button"
      onClick={() => setReduced((v) => !v)}
      className={`px-3 py-2 rounded-lg bg-white/80 border border-gray-300 text-sm ${className}`}
      title={reduced ? 'Enable animations' : 'Reduce motion'}
    >
      {reduced ? '🚫 Motion' : '✨ Motion'}
    </button>
  );
};

export default AccessibilityToggle;
