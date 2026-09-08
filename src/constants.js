/**
 * Invaders JS - (C) 2026 Alessio Saltarin (ISC) 
 * 
 * Constants
 */

export const CANVAS_WIDTH = 672;
export const CANVAS_HEIGHT = 768;

export const HIGH_SCORE_STORAGE_KEY = 'invaders_js_hi_score';

export const COLORS = {
  BACKGROUND: '#000000',
  GREEN: '#00ff80',
  WHITE: '#ffffff',
  CYAN: '#00e5ff',
  YELLOW: '#ffe600',
  RED: '#ff3344',
  MUTED: '#64748b',
};

export const GAME_STATES = {
  WELCOME: 'WELCOME',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
};

export const FONT_ARCADE = '"Press Start 2P", "Courier New", Courier, monospace';

// Ground line coordinates
export const GROUND_Y = CANVAS_HEIGHT - 48;

// Player configuration
export const PLAYER_CONFIG = {
  START_X: CANVAS_WIDTH / 2,
  START_Y: CANVAS_HEIGHT - 88,
  SPEED: 260, // pixels per second
  SCALE: 3,
  LIVES: 3,
  COLOR: COLORS.GREEN,
};

// Player projectile configuration (Strictly 1 active missile at a time)
export const LASER_CONFIG = {
  SPEED: 620, // pixels per second
  WIDTH: 3,
  HEIGHT: 12,
  COLOR: COLORS.WHITE,
};

// Alien fleet configuration
export const ALIEN_CONFIG = {
  ROWS: 5,
  COLS: 11,
  SPACING_X: 48,
  SPACING_Y: 42,
  START_X: 72,
  START_Y: 130,
  SCALE: 3,
  STEP_X: 12, // horizontal step per beat
  STEP_Y: 20, // vertical drop per edge bounce
  BASE_INTERVAL: 800, // ms between steps at 55 aliens
  MIN_INTERVAL: 60, // ms between steps for last alien
  BOMB_SPEED: 240, // pixels per second
  MAX_BOMBS: 3,
  BOMB_MIN_DELAY: 800, // ms minimum delay between alien drops
};

// Bunker / Barrier configuration
export const BUNKER_CONFIG = {
  COUNT: 4,
  Y: 560,
  SCALE: 3,
  COLOR: COLORS.GREEN,
};
