import React from 'react';

interface HUDProps {
  time: number;
  power: number;
  usage: number;
}

const HUD: React.FC<HUDProps> = ({ time, power, usage }) => {
  const formatTime = (t: number) => {
    if (t === 0) return '12 AM';
    return `${t} AM`;
  };

  return (
    <div className="absolute top-0 left-0 w-full p-6 pointer-events-none z-30 text-white font-mono flex justify-between">
      <div className="text-3xl font-bold shadow-black drop-shadow-md">
        {formatTime(time)}
      </div>
      
      <div className="flex flex-col items-end">
        <div className="text-2xl font-bold mb-2">Power left: {Math.floor(power)}%</div>
        <div className="flex items-center gap-1">
          <span className="text-xl">Usage:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div 
                key={i} 
                className={`w-4 h-6 border ${i <= usage ? (usage > 3 ? 'bg-red-500' : 'bg-green-500') : 'bg-transparent border-gray-500'}`} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HUD;