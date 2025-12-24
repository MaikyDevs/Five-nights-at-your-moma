import React, { useEffect, useState } from 'react';
import { OFFICE_IMAGES, CAMERA_IMAGES, JUMPSCARE_IMAGES, MAP_IMAGE, BONNIE_JUMPSCARE_FRAMES, CHICA_JUMPSCARE_FRAMES, FREDDY_JUMPSCARE_FRAMES, MENU_NORMAL, MENU_TWITCH_FRAMES, GAME_OVER_STATIC_FRAMES, CAM_2B_SPLIT, STAGE_IMAGES, CAM_4B_IMAGES, CAM_1B_IMAGES, NEWSPAPER_IMAGE } from '../constants';

interface PreloadImagesProps {
    onComplete: () => void;
}

const PreloadImages: React.FC<PreloadImagesProps> = ({ onComplete }) => {
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    // Collect ALL images that need to be cached
    const imagesToLoad = [
      ...Object.values(OFFICE_IMAGES),
      ...Object.values(CAMERA_IMAGES),
      ...Object.values(JUMPSCARE_IMAGES),
      ...Object.values(STAGE_IMAGES), 
      ...Object.values(CAM_4B_IMAGES),
      ...Object.values(CAM_1B_IMAGES),
      ...BONNIE_JUMPSCARE_FRAMES,
      ...CHICA_JUMPSCARE_FRAMES,
      ...FREDDY_JUMPSCARE_FRAMES,
      ...GAME_OVER_STATIC_FRAMES,
      ...MENU_TWITCH_FRAMES,
      MENU_NORMAL,
      NEWSPAPER_IMAGE,
      MAP_IMAGE,
      CAM_2B_SPLIT,
    ].filter(src => src && src.length > 0); // Filter out empty strings (like CAM 6 audio only)

    // Remove duplicates to save bandwidth
    const uniqueImages = [...new Set(imagesToLoad)];

    setTotalCount(uniqueImages.length);
    
    let currentLoaded = 0;

    uniqueImages.forEach(src => {
      const img = new Image();
      img.onload = () => {
        currentLoaded++;
        setLoadedCount(currentLoaded);
        if (currentLoaded >= uniqueImages.length) {
            // Add a small artificial delay for UX smoothness so it doesn't flash 100% instantly
            setTimeout(onComplete, 500);
        }
      };
      img.onerror = () => {
          // Even if it fails, we count it as "processed" so the game doesn't hang forever
          console.warn("Failed to load image:", src);
          currentLoaded++;
          setLoadedCount(currentLoaded);
          if (currentLoaded >= uniqueImages.length) {
              setTimeout(onComplete, 500);
          }
      };
      img.src = src;
    });
  }, [onComplete]);

  const percentage = totalCount > 0 ? Math.round((loadedCount / totalCount) * 100) : 0;

  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center font-vt323 text-white z-[100]">
        <div className="w-64 mb-4">
            <h1 className="text-2xl mb-2 animate-pulse">LOADING ASSETS...</h1>
            <div className="w-full h-4 border-2 border-white p-0.5">
                <div 
                    className="h-full bg-white transition-all duration-200"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="text-right mt-1 text-sm text-gray-400">{percentage}%</div>
        </div>
        <div className="text-xs text-gray-600 mt-8">Preloading textures to fix camera latency...</div>
    </div>
  );
};

export default PreloadImages;