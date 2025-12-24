import React from 'react';

interface StaticEffectProps {
  opacity?: number;
}

const StaticEffect: React.FC<StaticEffectProps> = ({ opacity = 0.15 }) => {
  return (
    <>
      <div className="scanlines pointer-events-none" />
      <div className="noise pointer-events-none" style={{ opacity }} />
    </>
  );
};

export default StaticEffect;