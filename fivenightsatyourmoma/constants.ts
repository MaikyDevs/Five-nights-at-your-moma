import { CameraId } from './types';

export const ASSET_BASE_URL = "https://raw.githubusercontent.com/MaikyDevs/Fnaftextures/main/yay";

export const OFFICE_IMAGES = {
  NORMAL: `${ASSET_BASE_URL}/Office/Office%20Inside/58.png`, 
  LEFT_LIGHT: `${ASSET_BASE_URL}/Office/Office%20Inside/58.png`,
  RIGHT_LIGHT: `${ASSET_BASE_URL}/Office/Office%20Inside/127.png`,
  BONNIE_DOOR: `${ASSET_BASE_URL}/Office/Office%20Inside/225.png`,
  CHICA_DOOR: `${ASSET_BASE_URL}/Office/Office%20Inside/227.png`,
  POWER_OUT_DARK: `${ASSET_BASE_URL}/Office/Office%20Inside/304.png`,
  POWER_OUT_FREDDY: `${ASSET_BASE_URL}/Office/Office%20Inside/305.png`,
};

export const MAP_IMAGE = `${ASSET_BASE_URL}/Office/Map/145.png`;

// Menu Images
export const MENU_NORMAL = `${ASSET_BASE_URL}/Static%20%26%20Menu/Menu/431.png`;
export const NEWSPAPER_IMAGE = "https://raw.githubusercontent.com/MaikyDevs/Fnaftextures/main/yay/574.png";

export const MENU_TWITCH_FRAMES = [
  `${ASSET_BASE_URL}/Static%20%26%20Menu/Menu/440.png`,
  `${ASSET_BASE_URL}/Static%20%26%20Menu/Menu/441.png`,
  `${ASSET_BASE_URL}/Static%20%26%20Menu/Menu/442.png`,
];
export const MENU_BACKGROUND = MENU_NORMAL; 

// Game Over Static Sequence
const STATIC_FRAME_IDS = ['12', '13', '14', '15', '16', '17', '18', '20'];
export const GAME_OVER_STATIC_FRAMES = STATIC_FRAME_IDS.map(id => `${ASSET_BASE_URL}/Static%20%26%20Menu/Full%20Static/${id}.png`);

// Special Split Image for CAM 2B (Bonnie)
export const CAM_2B_SPLIT = `${ASSET_BASE_URL}/Jumpscares/Bonnie/88213.png`;

// --- STAGE IMAGES (CAM 1A) ---
export const STAGE_IMAGES = {
  ALL: "https://raw.githubusercontent.com/MaikyDevs/Fnaftextures/main/yay/19.png", 
  NO_BONNIE: "https://raw.githubusercontent.com/MaikyDevs/Fnaftextures/main/yay/68.png", 
  NO_CHICA: "https://raw.githubusercontent.com/MaikyDevs/Fnaftextures/main/yay/223.png", 
  FREDDY_ONLY: "https://raw.githubusercontent.com/MaikyDevs/Fnaftextures/main/yay/224.png", 
  EMPTY: "https://raw.githubusercontent.com/MaikyDevs/Fnaftextures/main/yay/226.png" 
};

// --- CAM 1B IMAGES (Dining Area) ---
export const CAM_1B_IMAGES = {
  EMPTY: "https://raw.githubusercontent.com/MaikyDevs/Fnaftextures/main/yay/48.png",
  CHICA: "https://raw.githubusercontent.com/MaikyDevs/Fnaftextures/main/yay/215.png",
  BONNIE: "https://raw.githubusercontent.com/MaikyDevs/Fnaftextures/main/yay/120.png"
};

// --- CAM 4B IMAGES (East Hall Corner) ---
export const CAM_4B_IMAGES = {
  EMPTY: "https://raw.githubusercontent.com/MaikyDevs/Fnaftextures/main/yay/550.png",
  CHICA: "https://raw.githubusercontent.com/MaikyDevs/Fnaftextures/main/yay/476.png"
};

export const CAMERA_IMAGES: Record<CameraId, string> = {
  [CameraId.CAM_1A]: STAGE_IMAGES.ALL, 
  [CameraId.CAM_1B]: CAM_1B_IMAGES.EMPTY, 
  [CameraId.CAM_1C]: "https://raw.githubusercontent.com/MaikyDevs/Fnaftextures/main/yay/66.png", 
  [CameraId.CAM_2A]: `${ASSET_BASE_URL}/Cameras/2A.png`,
  [CameraId.CAM_2B]: CAM_2B_SPLIT, 
  [CameraId.CAM_3]: `${ASSET_BASE_URL}/Cameras/3.png`,
  [CameraId.CAM_4A]: `${ASSET_BASE_URL}/Cameras/4A.png`,
  [CameraId.CAM_4B]: CAM_4B_IMAGES.EMPTY, 
  [CameraId.CAM_5]: "https://raw.githubusercontent.com/MaikyDevs/Fnaftextures/main/yay/83.png",
  [CameraId.CAM_6]: ``, // Audio only
  [CameraId.CAM_7]: "https://raw.githubusercontent.com/MaikyDevs/Fnaftextures/main/yay/494.png", // UPDATED RESTROOMS
};

export const SOUNDS = {
  WIN: `${ASSET_BASE_URL}/sounds/chimes%202.wav`,
  ERROR: `${ASSET_BASE_URL}/sounds/error.wav`,
  MUSIC_BOX: `${ASSET_BASE_URL}/sounds/music%20box.wav`,
  DOOR_CLOSE: `${ASSET_BASE_URL}/sounds/SFXBible_12478.wav`,
  WINDOW_SCARE: `${ASSET_BASE_URL}/sounds/windowscare.wav`,
  SCREAM: `${ASSET_BASE_URL}/sounds/XSCREAM.wav`,
  CAMERA_OPEN: `${ASSET_BASE_URL}/sounds/blip3.wav`,
  CAMERA_CLOSE: `${ASSET_BASE_URL}/sounds/put%20down.wav`,
  STATIC_END: `${ASSET_BASE_URL}/sounds/static2.wav`,
  POWER_DOWN: `${ASSET_BASE_URL}/sounds/powerdown.wav`,
  PIRATE_SONG: `${ASSET_BASE_URL}/sounds/pirate%20song2.wav`,
  MENU_GARBLE: `${ASSET_BASE_URL}/sounds/garble1.wav`,
};

// Bonnie Sequence
const BONNIE_FRAME_IDS = ['291', '293', '294', '295', '296', '297', '298', '299', '300', '301', '303'];
export const BONNIE_JUMPSCARE_FRAMES = BONNIE_FRAME_IDS.map(id => `${ASSET_BASE_URL}/Jumpscares/Bonnie/${id}.png`);

// Chica Sequence
const CHICA_FRAME_IDS = ['216', '228', '229', '230', '231', '232', '233', '234', '235', '236', '237', '239', '279', '281', '65', '69'];
export const CHICA_JUMPSCARE_FRAMES = CHICA_FRAME_IDS.map(id => `${ASSET_BASE_URL}/Jumpscares/Chica/${id}.png`);

// Freddy Power Out Jumpscare Sequence
const FREDDY_FRAME_IDS = Array.from({length: 20}, (_, i) => (307 + i).toString()).concat(['348']);
export const FREDDY_JUMPSCARE_FRAMES = FREDDY_FRAME_IDS.map(id => `${ASSET_BASE_URL}/Jumpscares/Freddy/Lights%20Out!/${id}.png`);

export const JUMPSCARE_IMAGES = {
  BONNIE: BONNIE_JUMPSCARE_FRAMES[0],
  CHICA: CHICA_JUMPSCARE_FRAMES[0],
  FREDDY: FREDDY_JUMPSCARE_FRAMES[0],
  FOXY: `https://i.imgur.com/2J5Qg3x.gif`,
};

export const HOUR_LENGTH_MS = 30000; 
export const TICK_RATE_MS = 3000;