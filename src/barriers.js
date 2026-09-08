/**
 * Invaders JS - Destructible Bunkers / Barriers
 * Models 4 defensive shields with realistic pixel-level erosion when hit by bullets or invaders.
 */

import { CANVAS_WIDTH, BUNKER_CONFIG } from './constants.js';
import { SPRITES } from './sprites.js';

export class Bunker {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.scale = BUNKER_CONFIG.SCALE;
    this.rows = SPRITES.bunker.height;
    this.cols = SPRITES.bunker.width;
    this.width = this.cols * this.scale;
    this.height = this.rows * this.scale;
    this.color = BUNKER_CONFIG.COLOR;

    // Initialize 2D grid (16 rows x 22 cols) from sprite template
    this.grid = [];
    this.reset();
  }

  reset() {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      const templateRow = SPRITES.bunker.data[r];
      for (let c = 0; c < this.cols; c++) {
        row.push(templateRow[c] === '1' ? 1 : 0);
      }
      this.grid.push(row);
    }
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Check collision with a projectile bounding box.
   * If collision occurs, erodes a crater and returns true.
   *
   * @param {number} px - projectile x
   * @param {number} py - projectile y
   * @param {number} pw - projectile width
   * @param {number} ph - projectile height
   * @param {string} fromDirection - 'UP' (player laser moving up) or 'DOWN' (alien bomb moving down)
   * @returns {boolean} true if hit
   */
  checkHit(px, py, pw, ph, fromDirection = 'UP') {
    // Broad phase AABB check
    if (
      px + pw < this.x ||
      px > this.x + this.width ||
      py + ph < this.y ||
      py > this.y + this.height
    ) {
      return false;
    }

    // Precise cell check
    // If projectile comes from bottom ('UP'), scan from bottom cells to top
    // If projectile comes from top ('DOWN'), scan from top cells to bottom
    const startRow = fromDirection === 'UP' ? this.rows - 1 : 0;
    const endRow = fromDirection === 'UP' ? -1 : this.rows;
    const stepRow = fromDirection === 'UP' ? -1 : 1;

    // Check which columns projectile overlaps
    const minCol = Math.max(0, Math.floor((px - this.x) / this.scale));
    const maxCol = Math.min(this.cols - 1, Math.floor((px + pw - this.x) / this.scale));

    for (let r = startRow; r !== endRow; r += stepRow) {
      const cellY = this.y + r * this.scale;
      // Check if projectile overlaps this row vertically
      if (py + ph >= cellY && py <= cellY + this.scale) {
        for (let c = minCol; c <= maxCol; c++) {
          if (this.grid[r][c] === 1) {
            // Hit detected! Erode crater around (r, c)
            this.erodeCrater(r, c, fromDirection);
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Erode a realistic arcade crater pattern around the impact cell.
   *
   * @param {number} centerRow
   * @param {number} centerCol
   * @param {string} direction
   */
  erodeCrater(centerRow, centerCol, direction) {
    const craterRadius = 2; // radius in cells
    for (let dr = -craterRadius; dr <= craterRadius; dr++) {
      for (let dc = -craterRadius; dc <= craterRadius; dc++) {
        // Asymmetric crater: deeper into the direction of bullet travel
        if (direction === 'UP' && dr > 1) continue;
        if (direction === 'DOWN' && dr < -1) continue;

        // Diamond / circular distance check
        if (Math.abs(dr) + Math.abs(dc) <= craterRadius + 1) {
          const targetR = centerRow + dr;
          const targetC = centerCol + dc;
          if (targetR >= 0 && targetR < this.rows && targetC >= 0 && targetC < this.cols) {
            this.grid[targetR][targetC] = 0;
          }
        }
      }
    }
  }

  /**
   * Erode bunker pixels that intersect descending aliens.
   *
   * @param {number} ax - alien x
   * @param {number} ay - alien y
   * @param {number} aw - alien width
   * @param {number} ah - alien height
   */
  erodeByAlien(ax, ay, aw, ah) {
    if (
      ax + aw < this.x ||
      ax > this.x + this.width ||
      ay + ah < this.y ||
      ay > this.y + this.height
    ) {
      return;
    }

    const minCol = Math.max(0, Math.floor((ax - this.x) / this.scale));
    const maxCol = Math.min(this.cols - 1, Math.floor((ax + aw - this.x) / this.scale));
    const minRow = Math.max(0, Math.floor((ay - this.y) / this.scale));
    const maxRow = Math.min(this.rows - 1, Math.floor((ay + ah - this.y) / this.scale));

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        this.grid[r][c] = 0;
      }
    }
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c] === 1) {
          ctx.fillRect(this.x + c * this.scale, this.y + r * this.scale, this.scale, this.scale);
        }
      }
    }
  }
}

export class BarrierManager {
  constructor() {
    this.bunkers = [];
    this.init();
  }

  init() {
    this.bunkers = [];
    const count = BUNKER_CONFIG.COUNT;
    const bunkerWidth = SPRITES.bunker.width * BUNKER_CONFIG.SCALE;
    const totalBunkerWidth = count * bunkerWidth;
    const spacing = (CANVAS_WIDTH - totalBunkerWidth) / (count + 1);

    for (let i = 0; i < count; i++) {
      const x = spacing + i * (bunkerWidth + spacing);
      const y = BUNKER_CONFIG.Y;
      this.bunkers.push(new Bunker(x, y));
    }
  }

  reset() {
    for (let i = 0; i < this.bunkers.length; i++) {
      this.bunkers[i].reset();
    }
  }

  checkHit(px, py, pw, ph, direction) {
    for (let i = 0; i < this.bunkers.length; i++) {
      if (this.bunkers[i].checkHit(px, py, pw, ph, direction)) {
        return true;
      }
    }
    return false;
  }

  erodeByAlien(ax, ay, aw, ah) {
    for (let i = 0; i < this.bunkers.length; i++) {
      this.bunkers[i].erodeByAlien(ax, ay, aw, ah);
    }
  }

  render(ctx) {
    for (let i = 0; i < this.bunkers.length; i++) {
      this.bunkers[i].render(ctx);
    }
  }
}
