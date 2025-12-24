import React from 'react';

interface DebugMenuProps {
  onDrainPower: () => void;
  onBonnieDoor: () => void;
  onChicaDoor: () => void;
  onWinGame: () => void;
}

const DebugMenu: React.FC<DebugMenuProps> = ({ onDrainPower, onBonnieDoor, onChicaDoor, onWinGame }) => {
  return (
    <div className="absolute top-4 right-4 z-[60] bg-gray-900/80 border border-green-500 p-2 rounded text-green-500 font-mono text-xs flex flex-col gap-2">
      <div className="font-bold border-b border-green-500 mb-1">DEBUG MENU</div>
      <button onClick={onDrainPower} className="hover:bg-green-500/20 text-left px-2 py-1">⚠️ SET POWER 0%</button>
      <button onClick={onBonnieDoor} className="hover:bg-green-500/20 text-left px-2 py-1">🐰 BONNIE @ DOOR</button>
      <button onClick={onChicaDoor} className="hover:bg-green-500/20 text-left px-2 py-1">🐥 CHICA @ DOOR</button>
      <button onClick={onWinGame} className="hover:bg-green-500/20 text-left px-2 py-1">🏆 WIN GAME (6 AM)</button>
    </div>
  );
};

export default DebugMenu;