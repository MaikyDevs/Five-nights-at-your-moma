import React, { useState, useEffect, useRef } from 'react';
import StaticEffect from './StaticEffect';
import { MENU_NORMAL, MENU_TWITCH_FRAMES, SOUNDS } from '../constants';

interface MenuProps {
  onStart: () => void;
}

const Menu: React.FC<MenuProps> = ({ onStart }) => {
  const [bgImage, setBgImage] = useState(MENU_NORMAL);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const garbleRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Play Pirate Song as Background Music
    audioRef.current = new Audio(SOUNDS.PIRATE_SONG);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;
    
    // Initialize Garble Sound
    garbleRef.current = new Audio(SOUNDS.MENU_GARBLE);
    garbleRef.current.volume = 0.8;

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("Audio autoplay prevented:", error);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (garbleRef.current) {
        garbleRef.current.pause();
        garbleRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Normal state is 431.png.
    // Every ~15 seconds, trigger a rapid animation of 440, 441, 442.
    
    const triggerTwitch = () => {
        // Play Garble Sound for exactly 1.5 seconds
        if (garbleRef.current) {
          garbleRef.current.currentTime = 0;
          garbleRef.current.play().catch(() => {});
          
          setTimeout(() => {
            if (garbleRef.current) {
              garbleRef.current.pause();
              garbleRef.current.currentTime = 0;
            }
          }, 1500);
        }

        let count = 0;
        const maxTwitches = 6; // How many frame swaps in one "glitch" event
        
        const twitchInterval = setInterval(() => {
            const randomFrame = MENU_TWITCH_FRAMES[Math.floor(Math.random() * MENU_TWITCH_FRAMES.length)];
            setBgImage(randomFrame);
            count++;

            if (count >= maxTwitches) {
                clearInterval(twitchInterval);
                setBgImage(MENU_NORMAL); // Return to normal
            }
        }, 80); // Speed of twitch
    };

    const loop = setInterval(() => {
        // Chance to twitch every 15 seconds? 
        // The prompt says "not so often, but once every 15 seconds"
        triggerTwitch();
    }, 15000);

    return () => clearInterval(loop);
  }, []);

  return (
    <div 
      className="w-full h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden bg-cover bg-center transition-all duration-75"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <StaticEffect opacity={0.3} />
      
      {/* Darken overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="z-10 flex flex-col items-center">
        <h1 className="text-6xl md:text-8xl font-bold mb-8 text-center tracking-tighter shadow-white drop-shadow-lg animate-pulse">
          FIVE NIGHTS<br />AT REACT'S
        </h1>
        
        <div className="flex flex-col gap-4 items-center">
          <button 
            onClick={onStart}
            className="text-3xl hover:text-red-500 transition-colors cursor-pointer font-bold tracking-widest bg-black/50 px-6 py-2 border-2 border-transparent hover:border-white"
          >
            NEW GAME
          </button>
          <button 
            className="text-3xl text-gray-400 cursor-not-allowed font-bold tracking-widest bg-black/50 px-6 py-2"
          >
            CONTINUE
          </button>
        </div>

        <div className="mt-12 text-sm text-gray-300 font-bold bg-black/50 p-2 rounded">
          <p>Credit to Scott Cawthon for FNaF.</p>
          <p>Textures: MaikyDevs/Fnaftextures</p>
        </div>
      </div>
      
      {/* Glitch effect overlay randomly */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-red-900 mix-blend-overlay opacity-5 animate-pulse" />
    </div>
  );
};

export default Menu;