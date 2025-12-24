export enum GameState {
  MENU = 'MENU',
  INTRO = 'INTRO', // New state for the newspaper/job ad
  PLAYING = 'PLAYING',
  JUMPSCARE = 'JUMPSCARE',
  WIN = 'WIN',
  GAMEOVER = 'GAMEOVER',
  POWER_OUT = 'POWER_OUT'
}

export enum CameraId {
  CAM_1A = '1A', // Show Stage
  CAM_1B = '1B', // Dining Area
  CAM_1C = '1C', // Pirate Cove
  CAM_2A = '2A', // West Hall
  CAM_2B = '2B', // West Hall Corner
  CAM_3 = '3',   // Supply Closet
  CAM_4A = '4A', // East Hall
  CAM_4B = '4B', // East Hall Corner
  CAM_5 = '5',   // Backstage
  CAM_6 = '6',   // Kitchen (Audio only)
  CAM_7 = '7',   // Restrooms
}

export enum AnimatronicId {
  FREDDY = 'Freddy',
  BONNIE = 'Bonnie',
  CHICA = 'Chica',
  FOXY = 'Foxy'
}

export interface AnimatronicState {
  id: AnimatronicId;
  location: CameraId | 'OFFICE' | 'DOOR_LEFT' | 'DOOR_RIGHT';
  aiLevel: number; // 0-20
  subState?: number; // Used for Foxy's curtain stages or Freddy's laughter count
  timeAtDoor?: number; // Count ticks waiting at door before attacking
}

export interface GameContextType {
  time: number; // 0 to 6
  power: number; // 100 to 0
  usage: number; // 1 to 5
  camerasOpen: boolean;
  currentCamera: CameraId;
  doors: {
    left: boolean;
    right: boolean;
  };
  lights: {
    left: boolean;
    right: boolean;
  };
  animatronics: Record<AnimatronicId, AnimatronicState>;
}