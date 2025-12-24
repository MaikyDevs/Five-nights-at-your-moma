import React, { useState, useEffect, useRef } from 'react';
import { AnimatronicId } from '../types';
import { JUMPSCARE_IMAGES, BONNIE_JUMPSCARE_FRAMES, CHICA_JUMPSCARE_FRAMES, FREDDY_JUMPSCARE_FRAMES, SOUNDS, GAME_OVER_STATIC_FRAMES } from '../constants';

interface JumpscareProps {
  attacker: AnimatronicId;
  onRestart: () => void;
}

const Jumpscare: React.FC<JumpscareProps> = ({ attacker, onRestart }) => {
  const [frameIndex, setFrameIndex] = useState(0);
  const [staticFrameIndex, setStaticFrameIndex] = useState(0); 
  const [showStatic, setShowStatic] = useState(false);
  const screamRef = useRef<HTMLAudioElement>(new Audio(SOUNDS.SCREAM));
  const staticAudioRef = useRef<HTMLAudioElement>(new Audio(SOUNDS.STATIC_END));

  // Determine which frames to use for the jumpscare
  let activeJumpscareFrames: string[] = [];
  if (attacker === AnimatronicId.BONNIE) {
    activeJumpscareFrames = BONNIE_JUMPSCARE_FRAMES;
  } else if (attacker === AnimatronicId.CHICA) {
    activeJumpscareFrames = CHICA_JUMPSCARE_FRAMES;
  } else if (attacker === AnimatronicId.FREDDY) {
    activeJumpscareFrames = FREDDY_JUMPSCARE_FRAMES;
  } else {
    // Foxy or fallback
    activeJumpscareFrames = [JUMPSCARE_IMAGES[attacker]]; 
  }

  useEffect(() => {
    // Play sound immediately on mount
    if (screamRef.current) {
        screamRef.current.currentTime = 0;
        screamRef.current.play().catch(e => console.error("Audio play failed", e));
    }
    // Cleanup sounds on unmount
    return () => {
        if (screamRef.current) {
            screamRef.current.pause();
            screamRef.current.currentTime = 0;
        }
        if (staticAudioRef.current) {
            staticAudioRef.current.pause();
            staticAudioRef.current.currentTime = 0;
        }
    };
  }, []);

  // Handle Static Sound Delay
  useEffect(() => {
    if (showStatic) {
        const timer = setTimeout(() => {
             if (staticAudioRef.current) {
                 staticAudioRef.current.loop = true; 
                 staticAudioRef.current.currentTime = 0;
                 staticAudioRef.current.play().catch(() => {});
             }
        }, 2000);
        return () => clearTimeout(timer);
    }
  }, [showStatic]);

  // Animation Loop for Jumpscare
  useEffect(() => {
    let interval: number;

    const runFrameAnimation = (frames: string[], intervalTime: number) => {
        interval = window.setInterval(() => {
            setFrameIndex((prev) => {
                const next = prev + 1;
                // If we reach the end of the frames, stop animation and show static
                if (next >= frames.length) {
                    clearInterval(interval);
                    setShowStatic(true);
                    return prev;
                }
                return next;
            });
        }, intervalTime);
    };

    if (activeJumpscareFrames.length > 1) {
       // Bonnie/Chica/Freddy
       const speed = attacker === AnimatronicId.FREDDY ? 40 : 50;
       runFrameAnimation(activeJumpscareFrames, speed);
    } else {
      // For GIF based jumpscares (Foxy), wait fixed time then show static
      const timeout = setTimeout(() => {
          setShowStatic(true);
      }, 1500); 
      return () => clearTimeout(timeout);
    }

    return () => clearInterval(interval);
  }, [attacker, activeJumpscareFrames]);

  // Animation Loop for Game Over Static
  useEffect(() => {
    if (showStatic) {
      const staticInterval = setInterval(() => {
        setStaticFrameIndex((prev) => (prev + 1) % GAME_OVER_STATIC_FRAMES.length);
      }, 50); 
      return () => clearInterval(staticInterval);
    }
  }, [showStatic]);

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden">
      
      {/* --- LAYER 1: JUMPSCARE --- */}
      {/* We map all images and toggle visibility. This prevents flickering as DOM nodes exist. */}
      {!showStatic && (
        <div className="absolute inset-0 w-full h-full">
            {activeJumpscareFrames.map((src, idx) => (
                <img 
                    key={`jump-${idx}`}
                    src={src} 
                    alt="Jumpscare" 
                    // Using hidden class instead of unmounting keeps them in DOM but invisible
                    className={`absolute inset-0 w-full h-full object-cover scale-110 ${idx === frameIndex ? 'block' : 'hidden'}`} 
                />
            ))}
             {/* Visual Noise overlay */}
            <div className="absolute inset-0 pointer-events-none bg-red-500 mix-blend-overlay opacity-20 animate-pulse" />
        </div>
      )}

      {/* --- LAYER 2: STATIC / GAME OVER --- */}
      {/* We always render this logic but hide the container if !showStatic. 
          This ensures images are preloaded by the browser before showStatic becomes true. */}
      <div className={`absolute inset-0 w-full h-full z-[60] bg-black ${showStatic ? 'block' : 'hidden'}`}>
             {GAME_OVER_STATIC_FRAMES.map((src, idx) => (
                 <img 
                    key={`static-${idx}`}
                    src={src} 
                    alt="Static" 
                    className={`absolute inset-0 w-full h-full object-cover ${idx === staticFrameIndex ? 'block' : 'hidden'}`}
                 />
             ))}
             
             {/* Game Over UI Overlay */}
             {showStatic && (
                <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center z-10 animate-in fade-in duration-1000">
                    <h1 className="text-6xl text-red-600 font-bold mb-4 drop-shadow-lg shadow-black">GAME OVER</h1>
                    <button 
                        onClick={onRestart}
                        className="px-6 py-2 bg-white text-black font-bold text-xl hover:bg-gray-300 border-2 border-gray-500 shadow-xl"
                    >
                    TRY AGAIN
                    </button>
                </div>
             )}
      </div>

    </div>
  );
};

export default Jumpscare;