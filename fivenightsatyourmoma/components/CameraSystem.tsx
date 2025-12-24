import React, { useState, useEffect } from 'react';
import { CameraId, AnimatronicState, AnimatronicId } from '../types';
import { CAMERA_IMAGES, MAP_IMAGE, CAM_2B_SPLIT, STAGE_IMAGES, CAM_4B_IMAGES, CAM_1B_IMAGES } from '../constants';
import StaticEffect from './StaticEffect';

interface CameraSystemProps {
  active: boolean;
  currentCam: CameraId;
  onSwitchCam: (cam: CameraId) => void;
  animatronics: Record<AnimatronicId, AnimatronicState>;
  onClose: () => void;
  doorToggleCount?: number;
}

const CameraSystem: React.FC<CameraSystemProps> = ({ 
  active, 
  currentCam, 
  onSwitchCam, 
  animatronics,
  onClose,
  doorToggleCount = 0
}) => {
  const [staticOpacity, setStaticOpacity] = useState(0.3);

  // Simulate static bump when switching cameras
  useEffect(() => {
    setStaticOpacity(0.8);
    const t = setTimeout(() => setStaticOpacity(0.15), 300);
    return () => clearTimeout(t);
  }, [currentCam]);

  if (!active) return null;

  const currentImg = CAMERA_IMAGES[currentCam];

  // Map Button Component with stacked text (CAM on top, ID on bottom)
  const MapButton = ({ id, top, left, label, size = "w-11 h-7" }: { id: CameraId, top: string, left: string, label: string, size?: string }) => (
    <button
      onClick={() => onSwitchCam(id)}
      className={`absolute ${size} border-[1px] ${currentCam === id ? 'bg-green-400/50 border-green-400' : 'bg-gray-800/80 border-gray-500'} text-[10px] leading-none font-bold text-white flex flex-col items-center justify-center hover:bg-white/20 transition-colors z-50 shadow-black shadow-sm`}
      style={{ top, left }}
    >
      <span className="text-[8px] opacity-80">CAM</span>
      <span>{label}</span>
    </button>
  );

  // Render content based on Camera ID
  const renderCameraContent = () => {
    // Logic for Stage 1A (Switching Individual Images)
    if (currentCam === CameraId.CAM_1A) {
      const bonnieHere = animatronics[AnimatronicId.BONNIE].location === CameraId.CAM_1A;
      const chicaHere = animatronics[AnimatronicId.CHICA].location === CameraId.CAM_1A;
      const freddyHere = animatronics[AnimatronicId.FREDDY].location === CameraId.CAM_1A;

      let stageImageSrc = STAGE_IMAGES.EMPTY;

      if (freddyHere) {
        if (bonnieHere && chicaHere) {
           // All 3 (19.png)
           stageImageSrc = STAGE_IMAGES.ALL;
        } else if (!bonnieHere && chicaHere) {
           // Bonnie Gone (Freddy & Chica) (68.png)
           stageImageSrc = STAGE_IMAGES.NO_BONNIE;
        } else if (bonnieHere && !chicaHere) {
           // Chica Gone (Freddy & Bonnie) (223.png)
           stageImageSrc = STAGE_IMAGES.NO_CHICA;
        } else {
           // Only Freddy (224.png)
           stageImageSrc = STAGE_IMAGES.FREDDY_ONLY;
        }
      } else {
        // Empty (226.png)
        stageImageSrc = STAGE_IMAGES.EMPTY;
      }
      
      // Safety Fallback: If for some reason we end up with undefined, show Freddy Only or Empty
      if (!stageImageSrc) {
          stageImageSrc = freddyHere ? STAGE_IMAGES.FREDDY_ONLY : STAGE_IMAGES.EMPTY;
      }

      return (
         <img 
            src={stageImageSrc} 
            alt="Show Stage"
            className="w-full h-full object-fill opacity-70"
        />
      );
    }

    // Special Case: CAM 1B (Dining Area - Split View)
    if (currentCam === CameraId.CAM_1B) {
        const bonnieHere = animatronics[AnimatronicId.BONNIE].location === CameraId.CAM_1B;
        const chicaHere = animatronics[AnimatronicId.CHICA].location === CameraId.CAM_1B;

        if (bonnieHere && chicaHere) {
            // Split Screen with Smooth Transition
            return (
                <div className="w-full h-full relative">
                    {/* Base Layer: Bonnie (Visible on Right/Everything) */}
                    <img 
                        src={CAM_1B_IMAGES.BONNIE}
                        alt="Bonnie"
                        className="absolute inset-0 w-full h-full object-fill opacity-70"
                    />

                    {/* Overlay Layer: Chica (Masked to Left Side) */}
                    {/* Gradient mask transitions smoothly from 35% to 45% */}
                    <img 
                        src={CAM_1B_IMAGES.CHICA}
                        alt="Chica"
                        className="absolute inset-0 w-full h-full object-fill opacity-70"
                        style={{ 
                            WebkitMaskImage: 'linear-gradient(to right, black 35%, transparent 45%)',
                            maskImage: 'linear-gradient(to right, black 35%, transparent 45%)'
                        }}
                    />
                </div>
            );
        } else if (bonnieHere) {
            return <img src={CAM_1B_IMAGES.BONNIE} alt="Bonnie 1B" className="w-full h-full object-fill opacity-70" />;
        } else if (chicaHere) {
            return <img src={CAM_1B_IMAGES.CHICA} alt="Chica 1B" className="w-full h-full object-fill opacity-70" />;
        } else {
            return <img src={CAM_1B_IMAGES.EMPTY} alt="Empty 1B" className="w-full h-full object-fill opacity-70" />;
        }
    }

    // Special Case: CAM 2B (Split Image - Bonnie)
    if (currentCam === CameraId.CAM_2B) {
      const isBonnieHere = animatronics[AnimatronicId.BONNIE].location === CameraId.CAM_2B;
      // Image is split vertically: Top = Without Bonnie, Bottom = With Bonnie
      const bgPos = isBonnieHere ? '0 100%' : '0 0';
      
      return (
        <div 
           className="w-full h-full relative"
           style={{
             backgroundImage: `url(${CAM_2B_SPLIT})`,
             backgroundSize: '100% 200%', // Height is 200% to show only one half vertically
             backgroundPosition: bgPos,
             backgroundRepeat: 'no-repeat'
           }}
        />
      );
    }

    // Special Case: CAM 4B (Chica)
    if (currentCam === CameraId.CAM_4B) {
      const isChicaHere = animatronics[AnimatronicId.CHICA].location === CameraId.CAM_4B;
      // Note: If Freddy is here, currently handled as Empty because we don't have a Freddy 4B texture yet.
      // But we should ensure it returns *something* (Empty) rather than null/black.
      const imgSrc = isChicaHere ? CAM_4B_IMAGES.CHICA : CAM_4B_IMAGES.EMPTY;
      
      return (
         <img 
            src={imgSrc} 
            alt={`Camera ${currentCam}`}
            className="w-full h-full object-fill opacity-70"
        />
      );
    }

    // Default Case (Restrooms, Backstage, Pirate Cove, etc)
    if (currentImg) {
      return (
         <img 
            src={currentImg} 
            alt={`Camera ${currentCam}`}
            className="w-full h-full object-fill opacity-70"
            onError={(e) => { 
                // Fallback if image fails to load even after preloading
                e.currentTarget.style.display = 'none'; 
            }}
        />
      );
    }

    // Audio Only Case (Kitchen 6)
    return (
        <div className="w-full h-full flex items-center justify-center bg-black text-gray-600 font-mono">
            <div className="text-center">
                <p className="text-4xl mb-4">AUDIO ONLY</p>
                <p className="text-sm">CAMERA DISABLED</p>
            </div>
        </div>
    );
  };

  const content = renderCameraContent();

  return (
    <div className="absolute inset-0 z-40 bg-black flex flex-col text-white">
      {/* Viewport */}
      <div className="relative flex-grow w-full h-full overflow-hidden border-t-4 border-b-4 border-gray-800">
        <div className="absolute top-8 left-8 text-xl animate-pulse z-50 font-vt323 tracking-widest">🔴 RECORDING</div>
        <div className="absolute top-8 right-8 text-2xl font-bold z-50 font-vt323">{currentCam}</div>
        
        {/* The Camera Feed */}
        <div className="w-full h-full relative">
            {content}
            
            {/* Fallback Text when logic returns null/undefined or for CAM 6 */}
            {!content && currentCam !== CameraId.CAM_6 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-gray-800 opacity-20 text-9xl font-bold">NO SIGNAL</span>
                </div>
            )}
        </div>

        {/* Debug/Gameplay: Show who is here */}
        <div className="absolute bottom-4 left-4 text-xs text-white font-mono opacity-50">
           {Object.values(animatronics).map((a: AnimatronicState) => {
             if (a.location === currentCam) return <div key={a.id}>{a.id}</div>
             return null;
           })}
        </div>

        <StaticEffect opacity={staticOpacity} />
      </div>

      {/* Map Overlay - Positioned to the right */}
      <div className="absolute bottom-4 right-4 w-72 h-64">
        <div className="relative w-full h-full">
            {/* Actual Map Texture */}
            <img 
                src={MAP_IMAGE} 
                alt="Map" 
                className="absolute inset-0 w-full h-full object-contain opacity-90"
                style={{ transform: 'translate(34px, -11px)' }}
            />
            
            {/* Map Buttons - Exact FNaF 1 Layout Positions */}
            
            {/* CAM 1A (Show Stage) - Top Center (Highest point) */}
            <MapButton id={CameraId.CAM_1A} top="6%" left="54%" label="1A" size="w-12 h-8" />
            
            {/* CAM 1B (Dining Area) - Below 1A, slightly left */}
            <MapButton id={CameraId.CAM_1B} top="20%" left="46%" label="1B" size="w-12 h-8" />

            {/* CAM 5 (Backstage) - Top Left */}
            <MapButton id={CameraId.CAM_5} top="18%" left="18%" label="5" />

            {/* CAM 7 (Restrooms) - Top Right */}
            <MapButton id={CameraId.CAM_7} top="18%" left="80%" label="7" />

            {/* CAM 1C (Pirate Cove) - Middle Left (Below 1B/5 area) */}
            <MapButton id={CameraId.CAM_1C} top="36%" left="28%" label="1C" />

            {/* CAM 6 (Kitchen) - Middle Right (Below 7 area) */}
            <MapButton id={CameraId.CAM_6} top="50%" left="80%" label="6" />

            {/* CAM 3 (Supply Closet) - Bottom Left (Isolated) */}
            <MapButton id={CameraId.CAM_3} top="52%" left="12%" label="3" />

            {/* WEST HALL (Left Column) */}
            {/* CAM 2A (Upper) */}
            <MapButton id={CameraId.CAM_2A} top="52%" left="38%" label="2A" />
            {/* CAM 2B (Lower) */}
            <MapButton id={CameraId.CAM_2B} top="70%" left="38%" label="2B" />
            
            {/* EAST HALL (Right Column) */}
            {/* CAM 4A (Upper) */}
            <MapButton id={CameraId.CAM_4A} top="52%" left="62%" label="4A" />
            {/* CAM 4B (Lower) */}
            <MapButton id={CameraId.CAM_4B} top="70%" left="62%" label="4B" />
            
        </div>
      </div>

      {/* Close Camera Button */}
      <div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64 h-16 cursor-pointer flex items-center justify-center group z-50 border-2 border-gray-600 bg-gray-900/80 text-white font-bold tracking-widest hover:bg-white hover:text-black transition-all"
        onClick={onClose}
      >
         CLOSE MONITOR
      </div>
    </div>
  );
};

export default CameraSystem;