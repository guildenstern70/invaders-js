/**
 * Invaders JS - Alien Fleet and Alien Projectiles
 * Implements 5x11 grid of marching aliens with dual-frame animation,
 * accelerating step rhythm, descending bombs, and hit explosions.
 */

import { CANVAS_WIDTH, ALIEN_CONFIG, COLORS, GROUND_Y } from './constants.js';
import { SPRITES, drawPixelData } from './sprites.js';

export class Alien {
  constructor(row, col, type, points, color, x, y) {
    this.row = row;
    this.col = col;
    this.type = type; // 'squid', 'crab', 'octopus'
    this.points = points;
    this.color = color;
    this.x = x;
    this.y = y;
    this.alive = true;

    const spriteDef = SPRITES[type];
    this.width = spriteDef.width * ALIEN_CONFIG.SCALE;
    this.height = spriteDef.height * ALIEN_CONFIG.SCALE;
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}

export class AlienFleet {
  constructor(onStepCallback) {
    this.onStep = onStepCallback;
    this.aliens = [];
    this.direction = 1; // 1 = right, -1 = left
    this.frame = 0;
    this.stepTimer = 0;
    this.stepIndex = 0;

    // Explosions list: { x, y, timer }
    this.explosions = [];

    // Active alien bombs
    this.bombs = [];
    this.bombTimer = 0;

    this.initFleet();
  }

  initFleet(startY = ALIEN_CONFIG.START_Y) {
    this.aliens = [];
    this.direction = 1;
    this.frame = 0;
    this.stepTimer = 0;
    this.stepIndex = 0;
    this.explosions = [];
    this.bombs = [];
    this.bombTimer = 0;

    const rows = ALIEN_CONFIG.ROWS;
    const cols = ALIEN_CONFIG.COLS;

    for (let r = 0; r < rows; r++) {
      let type;
      let points;
      let color;

      if (r === 0) {
        type = 'squid';
        points = 30;
        color = COLORS.CYAN;
      } else if (r === 1 || r === 2) {
        type = 'crab';
        points = 20;
        color = COLORS.YELLOW;
      } else {
        type = 'octopus';
        points = 10;
        color = COLORS.GREEN;
      }

      for (let c = 0; c < cols; c++) {
        const x = ALIEN_CONFIG.START_X + c * ALIEN_CONFIG.SPACING_X;
        const y = startY + r * ALIEN_CONFIG.SPACING_Y;
        this.aliens.push(new Alien(r, c, type, points, color, x, y));
      }
    }
  }

  getAliveCount() {
    let count = 0;
    for (let i = 0; i < this.aliens.length; i++) {
      if (this.aliens[i].alive) count++;
    }
    return count;
  }

  getCurrentStepInterval() {
    const alive = this.getAliveCount();
    if (alive <= 1) return ALIEN_CONFIG.MIN_INTERVAL;
    const total = ALIEN_CONFIG.ROWS * ALIEN_CONFIG.COLS;
    const ratio = Math.max(0, (alive - 1) / (total - 1));
    return (
      ALIEN_CONFIG.MIN_INTERVAL + (ALIEN_CONFIG.BASE_INTERVAL - ALIEN_CONFIG.MIN_INTERVAL) * ratio
    );
  }

  update(deltaTime) {
    // 1. Update explosions
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      this.explosions[i].timer -= deltaTime;
      if (this.explosions[i].timer <= 0) {
        this.explosions.splice(i, 1);
      }
    }

    // 2. Update alien bombs
    this.updateBombs(deltaTime);

    // 3. Update fleet marching step
    const alive = this.getAliveCount();
    if (alive === 0) return;

    this.stepTimer += deltaTime;
    const stepInterval = this.getCurrentStepInterval();

    if (this.stepTimer >= stepInterval) {
      this.stepTimer -= stepInterval;
      this.stepFleet();
    }
  }

  stepFleet() {
    // Check if moving horizontally would hit bounds
    let shouldDropAndReverse = false;
    const leftBound = 24;
    const rightBound = CANVAS_WIDTH - 24;

    for (let i = 0; i < this.aliens.length; i++) {
      const a = this.aliens[i];
      if (!a.alive) continue;

      const nextX = a.x + this.direction * ALIEN_CONFIG.STEP_X;
      if (this.direction > 0 && nextX + a.width >= rightBound) {
        shouldDropAndReverse = true;
        break;
      } else if (this.direction < 0 && nextX <= leftBound) {
        shouldDropAndReverse = true;
        break;
      }
    }

    if (shouldDropAndReverse) {
      // Step vertically down and flip direction
      this.direction = -this.direction;
      for (let i = 0; i < this.aliens.length; i++) {
        if (this.aliens[i].alive) {
          this.aliens[i].y += ALIEN_CONFIG.STEP_Y;
        }
      }
    } else {
      // Step horizontally
      for (let i = 0; i < this.aliens.length; i++) {
        if (this.aliens[i].alive) {
          this.aliens[i].x += this.direction * ALIEN_CONFIG.STEP_X;
        }
      }
    }

    // Toggle animation frame
    this.frame = 1 - this.frame;

    // Trigger step sound
    if (this.onStep) {
      this.onStep(this.stepIndex % 4);
    }
    this.stepIndex++;
  }

  updateBombs(deltaTime) {
    const dt = deltaTime / 1000;

    // Move existing bombs
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const bomb = this.bombs[i];
      bomb.y += ALIEN_CONFIG.BOMB_SPEED * dt;
      bomb.animTimer += deltaTime;
      if (bomb.animTimer >= 90) {
        bomb.animTimer = 0;
        bomb.frame = 1 - bomb.frame;
      }

      // Remove bomb if past ground line
      if (bomb.y >= GROUND_Y) {
        this.bombs.splice(i, 1);
      }
    }

    // Drop new bombs
    this.bombTimer += deltaTime;
    if (this.bombTimer >= ALIEN_CONFIG.BOMB_MIN_DELAY) {
      if (this.bombs.length < ALIEN_CONFIG.MAX_BOMBS) {
        this.tryDropBomb();
      }
      this.bombTimer = 0;
    }
  }

  tryDropBomb() {
    // Find all columns with living aliens
    const activeColumns = [];
    for (let c = 0; c < ALIEN_CONFIG.COLS; c++) {
      let lowestInCol = null;
      for (let i = 0; i < this.aliens.length; i++) {
        const a = this.aliens[i];
        if (a.col === c && a.alive) {
          if (!lowestInCol || a.row > lowestInCol.row) {
            lowestInCol = a;
          }
        }
      }
      if (lowestInCol) {
        activeColumns.push(lowestInCol);
      }
    }

    if (activeColumns.length === 0) return;

    // Pick a random column shooter
    const shooter = activeColumns[Math.floor(Math.random() * activeColumns.length)];
    const bombWidth = SPRITES.bomb.width * ALIEN_CONFIG.SCALE;
    const bombHeight = SPRITES.bomb.height * ALIEN_CONFIG.SCALE;

    this.bombs.push({
      x: shooter.x + shooter.width / 2 - bombWidth / 2,
      y: shooter.y + shooter.height,
      width: bombWidth,
      height: bombHeight,
      frame: 0,
      animTimer: 0,
    });
  }

  killAlien(alien) {
    alien.alive = false;
    this.explosions.push({
      x: alien.x,
      y: alien.y,
      timer: 160, // ms
    });
  }

  getLowestY() {
    let maxY = 0;
    for (let i = 0; i < this.aliens.length; i++) {
      const a = this.aliens[i];
      if (a.alive && a.y + a.height > maxY) {
        maxY = a.y + a.height;
      }
    }
    return maxY;
  }

  render(ctx) {
    // Render living aliens
    for (let i = 0; i < this.aliens.length; i++) {
      const a = this.aliens[i];
      if (!a.alive) continue;

      const spriteDef = SPRITES[a.type];
      const frameData = spriteDef.frames[this.frame];
      drawPixelData(ctx, frameData, a.x, a.y, ALIEN_CONFIG.SCALE, a.color);
    }

    // Render death explosions
    for (let i = 0; i < this.explosions.length; i++) {
      const exp = this.explosions[i];
      drawPixelData(
        ctx,
        SPRITES.invaderExplosion.data,
        exp.x,
        exp.y,
        ALIEN_CONFIG.SCALE,
        COLORS.WHITE,
      );
    }

    // Render descending alien bombs
    for (let i = 0; i < this.bombs.length; i++) {
      const b = this.bombs[i];
      const frameData = SPRITES.bomb.frames[b.frame];
      drawPixelData(ctx, frameData, b.x, b.y, ALIEN_CONFIG.SCALE, COLORS.WHITE);
    }
  }
}
