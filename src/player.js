/**
 * Invaders JS - (C) 2026 Alessio Saltarin (ISC)
 * 
 * Player Cannon Entity
 * Handles horizontal movement, authentic single-missile firing, and death animations.
 */

import { CANVAS_WIDTH, PLAYER_CONFIG, LASER_CONFIG, COLORS } from './constants.js';
import { SPRITES, drawPixelData } from './sprites.js';

export class Player {
  constructor() {
    this.scale = PLAYER_CONFIG.SCALE;
    this.width = SPRITES.player.width * this.scale;
    this.height = SPRITES.player.height * this.scale;
    this.speed = PLAYER_CONFIG.SPEED;
    this.lives = PLAYER_CONFIG.LIVES;

    this.minX = 24;
    this.maxX = CANVAS_WIDTH - 24 - this.width;

    this.x = (CANVAS_WIDTH - this.width) / 2;
    this.y = PLAYER_CONFIG.START_Y;

    this.isDead = false;
    this.deathTimer = 0;
    this.deathDuration = 1200; // ms
    this.deathAnimTimer = 0;
    this.deathFrame = 0;

    // Authentic single laser missile
    this.laser = {
      active: false,
      x: 0,
      y: 0,
      width: LASER_CONFIG.WIDTH,
      height: LASER_CONFIG.HEIGHT,
      speed: LASER_CONFIG.SPEED,
    };
  }

  resetPosition() {
    this.x = (CANVAS_WIDTH - this.width) / 2;
    this.y = PLAYER_CONFIG.START_Y;
    this.isDead = false;
    this.deathTimer = 0;
  }

  resetAll() {
    this.lives = PLAYER_CONFIG.LIVES;
    this.laser.active = false;
    this.resetPosition();
  }

  move(direction, deltaTime) {
    if (this.isDead) return;
    const dt = deltaTime / 1000;
    this.x += direction * this.speed * dt;
    if (this.x < this.minX) this.x = this.minX;
    if (this.x > this.maxX) this.x = this.maxX;
  }

  fire() {
    if (this.isDead) return false;
    // Classic 1978 rule: Only 1 active missile allowed at a time
    if (this.laser.active) return false;

    this.laser.active = true;
    this.laser.x = this.x + this.width / 2 - this.laser.width / 2;
    this.laser.y = this.y - this.laser.height;
    return true;
  }

  hit() {
    if (this.isDead) return;
    this.isDead = true;
    this.deathTimer = this.deathDuration;
    this.deathAnimTimer = 0;
    this.deathFrame = 0;
    this.lives--;
  }

  update(deltaTime) {
    const dt = deltaTime / 1000;

    // Update player laser
    if (this.laser.active) {
      this.laser.y -= this.laser.speed * dt;
      // Offscreen top boundary check (top HUD area at y=90)
      if (this.laser.y + this.laser.height < 90) {
        this.laser.active = false;
      }
    }

    // Update death animation
    if (this.isDead) {
      this.deathTimer -= deltaTime;
      this.deathAnimTimer += deltaTime;
      if (this.deathAnimTimer >= 100) {
        this.deathAnimTimer = 0;
        this.deathFrame = (this.deathFrame + 1) % 2;
      }

      if (this.deathTimer <= 0) {
        if (this.lives > 0) {
          this.resetPosition();
        }
      }
    }
  }

  render(ctx) {
    // Render laser if active
    if (this.laser.active) {
      ctx.fillStyle = LASER_CONFIG.COLOR;
      ctx.fillRect(this.laser.x, this.laser.y, this.laser.width, this.laser.height);
    }

    // Render player or explosion
    if (this.isDead) {
      const explosionData = SPRITES.playerExplosion.frames[this.deathFrame];
      drawPixelData(ctx, explosionData, this.x, this.y, this.scale, COLORS.GREEN);
    } else {
      drawPixelData(ctx, SPRITES.player.data, this.x, this.y, this.scale, COLORS.GREEN);
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

  getLaserBounds() {
    if (!this.laser.active) return null;
    return {
      x: this.laser.x,
      y: this.laser.y,
      width: this.laser.width,
      height: this.laser.height,
    };
  }
}
