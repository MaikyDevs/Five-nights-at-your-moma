import React, { useState, useRef } from 'react';
import { OFFICE_IMAGES, SOUNDS } from '../constants';
import { AnimatronicState, AnimatronicId } from '../types';

interface OfficeViewProps {
  doors: { left: boolean; right: boolean };
  lights: { left: boolean; right: boolean };
  power: number;
  toggleDoor: (side: 'left' | 'right') => void;
  toggleLight: (side: 'left' | 'right') => void;
  onOpenCameras: () => void;
  animatronics: Record<AnimatronicId, AnimatronicState>;
}

// Helper for overlapping sounds
const playAudio = (url: string) => {
  const audio = new Audio(url);
  audio.play().catch(e => console.error("Audio play failed", e));
};

const OfficeView: React.FC<OfficeViewProps> = ({
  doors,
  lights,
  power,
  toggleDoor,
  toggleLight,
  onOpenCameras,
  animatronics
}) => {
  const [panX, setPanX] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX } = e;
    const { innerWidth } = window;
    const percentage = (clientX / innerWidth);
    setPanX(percentage * 100);
  };

  const handleInteraction = (action: () => void) => {
    if (power <= 0) {
      playAudio(SOUNDS.ERROR);
      return;
    }
    action();
  };

  const handleDoorToggle = (side: 'left' | 'right') => {
    handleInteraction(() => {
        toggleDoor(side);
        playAudio(SOUNDS.DOOR_CLOSE);
    });
  };

  const bonnieAtDoor = animatronics[AnimatronicId.BONNIE].location === 'DOOR_LEFT';
  const chicaAtDoor = animatronics[AnimatronicId.CHICA].location === 'DOOR_RIGHT';

  const handleLightToggle = (side: 'left' | 'right') => {
      handleInteraction(() => {
          toggleLight(side);
          
          // Logic: If turning light ON and animatronic is there -> Play Window Scare Sound
          // Note: lights[side] is the OLD state. So if it was false (off), it is now turning true (on).
          const isTurningOn = !lights[side];
          
          if (isTurningOn) {
              const isMonsterThere = (side === 'left' && bonnieAtDoor) || (side === 'right' && chicaAtDoor);
              if (isMonsterThere) {
                  playAudio(SOUNDS.WINDOW_SCARE);
              }
          }
      });
  };

  // Determine Background Logic
  const leftActive = lights.left && power > 0;
  const rightActive = lights.right && power > 0;
  
  let leftImage = OFFICE_IMAGES.LEFT_LIGHT;
  if (bonnieAtDoor) leftImage = OFFICE_IMAGES.BONNIE_DOOR;

  let rightImage = OFFICE_IMAGES.RIGHT_LIGHT;
  if (chicaAtDoor) rightImage = OFFICE_IMAGES.CHICA_DOOR;

  let defaultImage = OFFICE_IMAGES.NORMAL;
  let brightness = 0.6; // Default dark brightness

  if (leftActive || rightActive) {
      brightness = 1.0;
  }

  // If one is strictly active without the other, we can set defaultImage for fallback
  if (leftActive && !rightActive) defaultImage = leftImage;
  if (!leftActive && rightActive) defaultImage = rightImage;

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-black cursor-crosshair"
      onMouseMove={handleMouseMove}
      ref={containerRef}
    >
      <div 
        className="absolute top-0 h-full will-change-transform"
        style={{
          width: '120%', 
          height: '100%',
          left: 0,
          transform: `translateX(-${panX * 0.16}%)`, 
        }}
      >
        {/* BACKGROUND RENDERING */}
        {/* Case 1: Both Lights On - Split View with Smooth Gradient Mask */}
        {leftActive && rightActive ? (
            <>
                {/* Base Layer: Right Side Image (Full Width) */}
                <div 
                    className="absolute inset-0 bg-no-repeat bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${rightImage})`,
                        filter: `brightness(${brightness})`,
                    }}
                />
                {/* Overlay Layer: Left Side Image (Masked to fade out towards the right) */}
                <div 
                    className="absolute inset-0 bg-no-repeat bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${leftImage})`,
                        filter: `brightness(${brightness})`,
                        // Create a smooth transition around the center (45% to 55%)
                        WebkitMaskImage: 'linear-gradient(to right, black 45%, transparent 55%)',
                        maskImage: 'linear-gradient(to right, black 45%, transparent 55%)'
                    }}
                />
            </>
        ) : (
            // Case 2: Standard Single View (Left, Right, or Off)
            <div 
                className="absolute inset-0 bg-no-repeat bg-cover bg-center transition-all duration-100"
                style={{
                    backgroundImage: `url(${defaultImage})`,
                    filter: `brightness(${brightness})`
                }}
            />
        )}

        {/* --- LEFT WALL BUTTONS --- */}
        <div className="absolute top-[45%] left-[5%] flex flex-col gap-4 z-30">
             <button
               onClick={(e) => { e.stopPropagation(); handleDoorToggle('left'); }}
               className={`w-12 h-12 rounded-lg border-4 shadow-xl transition-all ${doors.left && power > 0 ? 'bg-red-600 border-red-900 shadow-red-500/50 scale-95' : 'bg-gray-300 border-gray-500 shadow-black'}`}
             >
                <div className="w-full h-full bg-gradient-to-br from-white/20 to-black/20" />
             </button>
             
             <button
               onClick={(e) => { e.stopPropagation(); handleLightToggle('left'); }}
               className={`w-12 h-12 rounded-lg border-4 shadow-xl transition-all ${lights.left && power > 0 ? 'bg-blue-100 border-blue-300 shadow-blue-400/80 scale-95' : 'bg-gray-300 border-gray-500 shadow-black'}`}
             >
                <div className="w-full h-full bg-gradient-to-br from-white/20 to-black/20" />
             </button>
        </div>

        {/* --- RIGHT WALL BUTTONS --- */}
        <div className="absolute top-[45%] right-[5%] flex flex-col gap-4 z-30 items-end">
             <button
               onClick={(e) => { e.stopPropagation(); handleDoorToggle('right'); }}
               className={`w-12 h-12 rounded-lg border-4 shadow-xl transition-all ${doors.right && power > 0 ? 'bg-red-600 border-red-900 shadow-red-500/50 scale-95' : 'bg-gray-300 border-gray-500 shadow-black'}`}
             >
               <div className="w-full h-full bg-gradient-to-br from-white/20 to-black/20" />
             </button>
             
             <button
               onClick={(e) => { e.stopPropagation(); handleLightToggle('right'); }}
               className={`w-12 h-12 rounded-lg border-4 shadow-xl transition-all ${lights.right && power > 0 ? 'bg-blue-100 border-blue-300 shadow-blue-400/80 scale-95' : 'bg-gray-300 border-gray-500 shadow-black'}`}
             >
               <div className="w-full h-full bg-gradient-to-br from-white/20 to-black/20" />
             </button>
        </div>

        {/* Doors */}
        <div 
            className={`absolute top-0 left-[2%] w-[15%] h-full bg-gray-900 border-r-8 border-gray-800 transition-transform duration-200 ease-linear z-10 ${doors.left && power > 0 ? 'translate-y-0' : '-translate-y-[85%]'}`}
        />
        <div 
            className={`absolute top-0 right-[2%] w-[15%] h-full bg-gray-900 border-l-8 border-gray-800 transition-transform duration-200 ease-linear z-10 ${doors.right && power > 0 ? 'translate-y-0' : '-translate-y-[85%]'}`}
        />

      </div>

      <div 
        className="absolute bottom-4 left-[20%] right-[20%] h-16 opacity-0 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center z-40 group"
        onMouseEnter={() => { if(power > 0) onOpenCameras(); }}
      >
        <div className="w-[80%] h-12 bg-gray-800/90 rounded border-2 border-gray-500 flex items-center justify-center text-white font-bold tracking-widest shadow-lg shadow-blue-500/20">
            OPEN MONITOR 🔼
        </div>
      </div>
    </div>
  );
};

export default OfficeView;