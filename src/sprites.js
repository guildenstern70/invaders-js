/**
 * Invaders JS - (C) 2026 Alessio Saltarin (ISC)
 * 
 * Sprite Bitmaps and Drawing Utilities
 */

import { COLORS } from './constants.js';

export const SPRITES = {
  // UFO / Mystery Ship (16x8)
  ufo: {
    color: COLORS.RED,
    width: 16,
    height: 8,
    data: [
      '....11111111....',
      '..111111111111..',
      '.11111111111111.',
      '11.11.1111.11.11',
      '1111111111111111',
      '..111..11..111..',
      '...1........1...',
      '................',
    ],
  },

  // Squid Invader - Row 1 (8x8)
  squid: {
    color: COLORS.CYAN,
    width: 8,
    height: 8,
    points: 30,
    frames: [
      [
        '...11...',
        '..1111..',
        '.111111.',
        '11.11.11',
        '11111111',
        '..1..1..',
        '.1.11.1.',
        '1.1..1.1',
      ],
      [
        '...11...',
        '..1111..',
        '.111111.',
        '11.11.11',
        '11111111',
        '.1.11.1.',
        '1......1',
        '.1....1.',
      ],
    ],
  },

  // Crab Invader - Rows 2 & 3 (11x8)
  crab: {
    color: COLORS.YELLOW,
    width: 11,
    height: 8,
    points: 20,
    frames: [
      [
        '..1.....1..',
        '...1...1...',
        '..1111111..',
        '.11.111.11.',
        '11111111111',
        '1.1111111.1',
        '1.1.....1.1',
        '...11.11...',
      ],
      [
        '..1.....1..',
        '1..1...1..1',
        '1.1111111.1',
        '111.111.111',
        '.111111111.',
        '..1111111..',
        '..1.....1..',
        '.1.......1.',
      ],
    ],
  },

  // Octopus Invader - Rows 4 & 5 (12x8)
  octopus: {
    color: COLORS.GREEN,
    width: 12,
    height: 8,
    points: 10,
    frames: [
      [
        '....1111....',
        '..11111111..',
        '.1111111111.',
        '111.11.11111',
        '111111111111',
        '..11.11.11..',
        '.1.1....1.1.',
        '..1......1..',
      ],
      [
        '....1111....',
        '..11111111..',
        '.1111111111.',
        '111.11.11111',
        '111111111111',
        '...11..11...',
        '..1.1111.1..',
        '.1........1.',
      ],
    ],
  },

  // Invader Explosion (11x8)
  invaderExplosion: {
    color: COLORS.WHITE,
    width: 11,
    height: 8,
    data: [
      '1...1.1...1',
      '.1..1.1..1.',
      '..1.....1..',
      '...1...1...',
      '11.......11',
      '...1...1...',
      '..1.....1..',
      '.1..1.1..1.',
    ],
  },

  // Player Cannon (15x8)
  player: {
    color: COLORS.GREEN,
    width: 15,
    height: 8,
    data: [
      '.......1.......',
      '......111......',
      '......111......',
      '.1111111111111.',
      '111111111111111',
      '111111111111111',
      '111111111111111',
      '111111111111111',
    ],
  },

  // Player Explosion (two frames)
  playerExplosion: {
    color: COLORS.GREEN,
    width: 15,
    height: 8,
    frames: [
      [
        '..1...1...1...1',
        '.1.1.1.1.1.1.1.',
        '..11.1.1.1.11..',
        '111.1.....1.111',
        '..11.1.1.1.11..',
        '.1.1.1.1.1.1.1.',
        '..1...1...1...1',
        '.1...1...1...1.',
      ],
      [
        '1...1.....1...1',
        '..1.1.1.1.1.1..',
        '.1..1.1.1.1..1.',
        '1111.......1111',
        '.1..1.1.1.1..1.',
        '..1.1.1.1.1.1..',
        '1...1.....1...1',
        '..1.........1..',
      ],
    ],
  },

  // Classic Destructible Bunker Shape (22x16)
  bunker: {
    width: 22,
    height: 16,
    data: [
      '....11111111111111....',
      '..111111111111111111..',
      '.11111111111111111111.',
      '1111111111111111111111',
      '1111111111111111111111',
      '1111111111111111111111',
      '1111111111111111111111',
      '1111111111111111111111',
      '1111111111111111111111',
      '1111111111111111111111',
      '1111111111111111111111',
      '1111111........1111111',
      '111111..........111111',
      '11111............11111',
      '11111............11111',
      '11111............11111',
    ],
  },

  // Alien Bomb (3x7)
  bomb: {
    color: COLORS.WHITE,
    width: 3,
    height: 7,
    frames: [
      ['.1.', '1..', '.1.', '..1', '.1.', '1..', '.1.'],
      ['.1.', '..1', '.1.', '1..', '.1.', '..1', '.1.'],
    ],
  },
};

/**
 * Draws a sprite's string-based bitmap data to canvas context.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string[]} data - Array of binary pixel strings
 * @param {number} x - Left coordinate
 * @param {number} y - Top coordinate
 * @param {number} scale - Pixel scaling factor
 * @param {string} color - Fill style hex or CSS color
 */
export function drawPixelData(ctx, data, x, y, scale = 3, color = COLORS.WHITE) {
  ctx.fillStyle = color;
  for (let r = 0; r < data.length; r++) {
    const row = data[r];
    for (let c = 0; c < row.length; c++) {
      if (row[c] === '1') {
        ctx.fillRect(x + c * scale, y + r * scale, scale, scale);
      }
    }
  }
}
