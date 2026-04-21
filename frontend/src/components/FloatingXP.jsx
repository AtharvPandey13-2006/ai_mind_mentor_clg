import React, { useState, useEffect } from 'react';

const FloatingXP = ({ amount, position, onComplete }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onComplete && onComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <div
      className="fixed text-2xl font-bold text-yellow-400 pointer-events-none xp-float z-50"
      style={{
        left: position.x,
        top: position.y,
        textShadow: '0 0 10px rgba(250, 204, 21, 0.8), 0 0 20px rgba(250, 204, 21, 0.6)',
      }}
    >
      +{amount} XP ⚡
    </div>
  );
};

export default FloatingXP;
