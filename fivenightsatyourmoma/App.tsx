import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, CameraId, AnimatronicId, AnimatronicState } from './types';
import { TICK_RATE_MS, HOUR_LENGTH_MS, OFFICE_IMAGES, SOUNDS, NEWSPAPER_IMAGE } from './constants';
import PreloadImages from './components/PreloadImages';
import Menu from './components/Menu';
import OfficeView from './components/OfficeView';
import CameraSystem from './components/CameraSystem';
import HUD from './components/HUD';
import Jumpscare from './components/Jumpscare';
import StaticEffect from './components/StaticEffect';
import DebugMenu from './components/DebugMenu';

// AI Movement Paths (Simplified)
const BONNIE_PATH = [CameraId.CAM_1A, CameraId.CAM_1B, CameraId.CAM_5, CameraId.CAM_2A, CameraId.CAM_2B, 'DOOR_LEFT'];
const CHICA_PATH = [CameraId.CAM_1A, CameraId.CAM_1B, CameraId.CAM_7, CameraId.CAM_6, CameraId.CAM_4A, CameraId.CAM_4B, 'DOOR_RIGHT'];

// Helper for overlapping sounds
const playAudio = (url: string) => {
  const audio = new Audio(url);
  audio.play().catch(e => console.error("Audio play failed", e));
};

const App: React.FC = () => {
  // Loading State
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Game State
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [time, setTime] = useState(0); 
  const [power, setPower] = useState(100);
  const [doorToggleCount, setDoorToggleCount] = useState(0); // Easter egg counter
  
  // Intro State
  const [introZoom, setIntroZoom] = useState(false);
  
  // Player State
  const [camerasOpen, setCamerasOpen] = useState(false);
  const [currentCamera, setCurrentCamera] = useState<CameraId>(CameraId.CAM_1A);
  const [doors, setDoors] = useState({ left: false, right: false });
  const [lights, setLights] = useState({ left: false, right: false });
  const [jumpscareAttacker, setJumpscareAttacker] = useState<AnimatronicId>(AnimatronicId.BONNIE);

  // Power Out Sequence State
  const [powerOutStage, setPowerOutStage] = useState<'DARK' | 'FREDDY'>('DARK');

  // Audio Refs (For long running or looping sounds where we need control)
  const musicBoxAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);

  // Animatronics State
  const [animatronics, setAnimatronics] = useState<Record<AnimatronicId, AnimatronicState>>({
    [AnimatronicId.BONNIE]: { id: AnimatronicId.BONNIE, location: CameraId.CAM_1A, aiLevel: 5, timeAtDoor: 0 },
    [AnimatronicId.CHICA]: { id: AnimatronicId.CHICA, location: CameraId.CAM_1A, aiLevel: 5, timeAtDoor: 0 },
    [AnimatronicId.FREDDY]: { id: AnimatronicId.FREDDY, location: CameraId.CAM_1A, aiLevel: 3 },
    [AnimatronicId.FOXY]: { id: AnimatronicId.FOXY, location: CameraId.CAM_1C, aiLevel: 2, subState: 0 },
  });

  // Timers Refs
  const timeIntervalRef = useRef<number | null>(null);
  const powerIntervalRef = useRef<number | null>(null);
  const aiIntervalRef = useRef<number | null>(null);

  // --- Initialize Audio ---
  useEffect(() => {
    musicBoxAudioRef.current = new Audio(SOUNDS.MUSIC_BOX);
    musicBoxAudioRef.current.loop = false; // We manage duration
    winAudioRef.current = new Audio(SOUNDS.WIN);
  }, []);

  // --- Handle INTRO Logic (Timer + Animation) ---
  useEffect(() => {
    if (gameState === GameState.INTRO) {
        // Trigger Zoom Animation
        const frameId = requestAnimationFrame(() => setIntroZoom(true));
        
        // Auto-start after 7 seconds
        const timer = setTimeout(() => {
             setGameState(GameState.PLAYING);
        }, 7000);

        return () => {
             clearTimeout(timer);
             cancelAnimationFrame(frameId);
             setIntroZoom(false); // Reset for next time if needed
        };
    }
  }, [gameState]);

  // --- Game Loop Logic ---

  const calculateUsage = () => {
    let usage = 1;
    if (camerasOpen) usage++;
    if (doors.left) usage++;
    if (doors.right) usage++;
    if (lights.left) usage++;
    if (lights.right) usage++;
    return usage;
  };

  const checkJumpscare = useCallback((attacker: AnimatronicId) => {
    setJumpscareAttacker(attacker);
    setGameState(GameState.JUMPSCARE);
    if (musicBoxAudioRef.current) {
        musicBoxAudioRef.current.pause();
        musicBoxAudioRef.current.currentTime = 0;
    }
  }, []);

  // Updated logic to handle patience/waiting at door
  const processIndividualAnimatronic = (
    anim: AnimatronicState, 
    path: string[], 
    isDoorClosed: boolean,
    onJumpscare: (id: AnimatronicId) => void
  ): AnimatronicState => {
    const newAnim = { ...anim };
    
    // Check if AI passes difficulty check
    if (Math.random() * 20 >= newAnim.aiLevel) {
      return newAnim; // Did not move this tick
    }

    // Special Handling if ALREADY at door
    const doorLocation = path[path.length - 1]; // e.g. 'DOOR_LEFT'
    if (newAnim.location === doorLocation) {
        if (isDoorClosed) {
            // Door is closed, they leave immediately
            newAnim.location = path[0] as any; // Reset to start
            newAnim.timeAtDoor = 0;
        } else {
            // Door is OPEN
            // Increment wait timer
            newAnim.timeAtDoor = (newAnim.timeAtDoor || 0) + 1;
            
            // If they have waited too long (Patience check), they attack
            // Threshold of 2 ticks (approx 6 seconds) gives reaction time
            if (newAnim.timeAtDoor > 2) {
                onJumpscare(newAnim.id);
            }
        }
        return newAnim;
    }

    // Standard Movement
    const currentIndex = path.indexOf(newAnim.location as string);
    if (currentIndex === -1) {
        // Lost? Reset
        newAnim.location = path[0] as any;
        return newAnim;
    }
    
    // Move forward
    const nextIndex = currentIndex + 1;
    if (nextIndex < path.length) {
        newAnim.location = path[nextIndex] as any;
        newAnim.timeAtDoor = 0; // Reset patience just in case
    }
    
    return newAnim;
  };

  const processAI = useCallback(() => {
    setAnimatronics(prev => {
      const next = { ...prev };
      
      // Bonnie
      next[AnimatronicId.BONNIE] = processIndividualAnimatronic(
          next[AnimatronicId.BONNIE],
          BONNIE_PATH,
          doors.left,
          checkJumpscare
      );

      // Chica
      next[AnimatronicId.CHICA] = processIndividualAnimatronic(
          next[AnimatronicId.CHICA],
          CHICA_PATH,
          doors.right,
          checkJumpscare
      );
      
      return next;
    });
  }, [doors, checkJumpscare]);

  const startGame = () => {
    // Start with INTRO (Newspaper) instead of PLAYING
    setGameState(GameState.INTRO);
    setIntroZoom(false); // Reset Zoom State
    
    // Initialize Variables
    setTime(0);
    setPower(100);
    setDoors({ left: false, right: false });
    setLights({ left: false, right: false });
    setCamerasOpen(false);
    setDoorToggleCount(0);
    
    setAnimatronics({
      [AnimatronicId.BONNIE]: { id: AnimatronicId.BONNIE, location: CameraId.CAM_1A, aiLevel: 12, timeAtDoor: 0 }, 
      [AnimatronicId.CHICA]: { id: AnimatronicId.CHICA, location: CameraId.CAM_1A, aiLevel: 12, timeAtDoor: 0 },
      [AnimatronicId.FREDDY]: { id: AnimatronicId.FREDDY, location: CameraId.CAM_1A, aiLevel: 0 }, 
      [AnimatronicId.FOXY]: { id: AnimatronicId.FOXY, location: CameraId.CAM_1C, aiLevel: 0, subState: 0 },
    });
  };

  const handleWin = useCallback(() => {
      setGameState(GameState.WIN);
      if (winAudioRef.current) {
          winAudioRef.current.currentTime = 0;
          winAudioRef.current.play();
      }
  }, []);

  // Timers
  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;

    // Clock
    timeIntervalRef.current = window.setInterval(() => {
      setTime(t => {
        if (t === 5) {
          handleWin();
          return 6;
        }
        return t + 1;
      });
    }, HOUR_LENGTH_MS);

    // Power Drain
    powerIntervalRef.current = window.setInterval(() => {
      setPower(p => {
        if (p <= 0) {
          // Trigger Power Outage Sequence
          setGameState(GameState.POWER_OUT);
          setPowerOutStage('DARK');
          setCamerasOpen(false);
          setDoors({left: false, right: false}); // Doors open when power dies
          setLights({left: false, right: false});
          
          // Play Power Down sound (bzzzt)
          playAudio(SOUNDS.POWER_DOWN);

          // Wait 7 seconds before Freddy appears (Music Box)
          setTimeout(() => {
            setPowerOutStage('FREDDY');
            if (musicBoxAudioRef.current) {
                musicBoxAudioRef.current.volume = 1.0; // Ensure max volume
                musicBoxAudioRef.current.play();
            }
            
            // Music box plays for random duration (e.g., 15s)
            setTimeout(() => {
              if (musicBoxAudioRef.current) musicBoxAudioRef.current.pause();
              setPowerOutStage('DARK'); // Blackout again briefly
              
              // Jumpscare after blackout
              setTimeout(() => {
                 checkJumpscare(AnimatronicId.FREDDY);
              }, 2000);

            }, 15000); 
          }, 7000); // 7 seconds delay as requested

          return 0;
        }
        // Drain rate
        const drain = calculateUsage() * 0.2; 
        return p - drain;
      });
    }, 1000);

    // AI Ticks
    aiIntervalRef.current = window.setInterval(processAI, TICK_RATE_MS);

    return () => {
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
      if (powerIntervalRef.current) clearInterval(powerIntervalRef.current);
      if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
    };
  }, [gameState, camerasOpen, doors, lights, processAI, checkJumpscare, handleWin]);

  // --- Camera & Audio Handlers ---
  const handleOpenCameras = () => {
      playAudio(SOUNDS.CAMERA_OPEN);
      setCamerasOpen(true);
  };

  const handleCloseCameras = () => {
      playAudio(SOUNDS.CAMERA_CLOSE);
      setCamerasOpen(false);
  };

  // --- Debug Actions ---
  const forcePowerZero = () => setPower(0);
  const forceWin = () => { setTime(5); handleWin(); }; // Set time to 5 then tick or just win immediately
  const forceBonnieDoor = () => setAnimatronics(prev => ({...prev, [AnimatronicId.BONNIE]: {...prev[AnimatronicId.BONNIE], location: 'DOOR_LEFT', timeAtDoor: 0}}));
  const forceChicaDoor = () => setAnimatronics(prev => ({...prev, [AnimatronicId.CHICA]: {...prev[AnimatronicId.CHICA], location: 'DOOR_RIGHT', timeAtDoor: 0}}));


  return (
    <div className="w-full h-screen bg-black overflow-hidden font-vt323 relative select-none">
      {/* If assets are not loaded, show Loading Screen, else show Game */}
      {!assetsLoaded ? (
        <PreloadImages onComplete={() => setAssetsLoaded(true)} />
      ) : (
        <>
            {gameState === GameState.MENU && <Menu onStart={startGame} />}

            {/* NEWSPAPER INTRO SCREEN */}
            {gameState === GameState.INTRO && (
                <div 
                    className="w-full h-full absolute inset-0 bg-black z-50 flex items-center justify-center cursor-pointer overflow-hidden"
                    onClick={() => setGameState(GameState.PLAYING)}
                >
                    <img 
                        src={NEWSPAPER_IMAGE} 
                        alt="Help Wanted" 
                        className={`w-full h-full object-cover transform transition-transform duration-[7000ms] ease-linear ${introZoom ? 'scale-110' : 'scale-100'}`}
                    />
                    
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        <StaticEffect />
                    </div>
                </div>
            )}
            
            {gameState === GameState.PLAYING && (
                <>
                <HUD time={time} power={power} usage={calculateUsage()} />
                <DebugMenu 
                    onDrainPower={forcePowerZero}
                    onBonnieDoor={forceBonnieDoor}
                    onChicaDoor={forceChicaDoor}
                    onWinGame={forceWin}
                />
                
                <OfficeView 
                    doors={doors}
                    lights={lights}
                    power={power}
                    toggleDoor={(side) => {
                    setDoors(d => ({ ...d, [side]: !d[side] }));
                    setDoorToggleCount(prev => prev + 1);
                    }}
                    toggleLight={(side) => setLights(l => ({ ...l, [side]: !l[side] }))}
                    onOpenCameras={handleOpenCameras}
                    animatronics={animatronics}
                />
                
                <CameraSystem 
                    active={camerasOpen}
                    currentCam={currentCamera}
                    onSwitchCam={setCurrentCamera}
                    animatronics={animatronics}
                    onClose={handleCloseCameras}
                    doorToggleCount={doorToggleCount}
                />

                <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-overlay">
                    <StaticEffect />
                </div>
                </>
            )}

            {gameState === GameState.POWER_OUT && (
                <div className="w-full h-full relative overflow-hidden bg-black">
                <div 
                    className="w-full h-full absolute inset-0"
                    style={{
                    backgroundImage: `url(${powerOutStage === 'DARK' ? OFFICE_IMAGES.POWER_OUT_DARK : OFFICE_IMAGES.POWER_OUT_FREDDY})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                    }}
                >
                    {powerOutStage === 'FREDDY' && (
                    <div className="absolute inset-0 bg-black opacity-20 animate-pulse" />
                    )}
                </div>
                </div>
            )}

            {gameState === GameState.JUMPSCARE && (
                <Jumpscare attacker={jumpscareAttacker} onRestart={() => setGameState(GameState.MENU)} />
            )}

            {gameState === GameState.WIN && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white">
                <h1 className="text-8xl font-bold text-green-500 mb-8 animate-bounce">6 AM</h1>
                <p className="text-2xl mb-8">You survived the night.</p>
                <button onClick={() => setGameState(GameState.MENU)} className="border px-4 py-2 hover:bg-white hover:text-black">MAIN MENU</button>
                </div>
            )}
            
            {gameState === GameState.GAMEOVER && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white">
                    <h1 className="text-6xl text-red-600 mb-4">GAME OVER</h1>
                    <button onClick={() => setGameState(GameState.MENU)} className="mt-8 border px-4 py-2 hover:bg-white hover:text-black">TRY AGAIN</button>
                </div>
            )}
        </>
      )}
    </div>
  );
};

export default App;