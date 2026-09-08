/**
 * Invaders JS - (C) 2026 Alessio Saltarin (ISC)
 * 
 * Gameplay Session Manager
 * Orchestrates Level 1 mechanics: player, barriers, aliens, collisions, scoring, and arcade HUD.
 */

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  COLORS,
  FONT_ARCADE,
  GROUND_Y,
  PLAYER_CONFIG,
  ALIEN_CONFIG,
  GAME_STATES,
} from './constants.js';
import { SPRITES, drawPixelData } from './sprites.js';
import { Player } from './player.js';
import { BarrierManager } from './barriers.js';
import { AlienFleet } from './aliens.js';

function checkAABB(r1, r2) {
  return (
    r1.x < r2.x + r2.width &&
    r1.x + r1.width > r2.x &&
    r1.y < r2.y + r2.height &&
    r1.y + r1.height > r2.y
  );
}

export class GameplaySession {
  constructor(audioManager, getHighScore, onSaveHighScore, onGameOver) {
    this.audio = audioManager;
    this.getHighScore = getHighScore;
    this.onSaveHighScore = onSaveHighScore;
    this.onGameOver = onGameOver;

    this.score = 0;
    this.level = 1;
    this.state = GAME_STATES.PLAYING;

    this.player = new Player();
    this.barriers = new BarrierManager();
    this.aliens = new AlienFleet((stepIndex) => {
      this.audio.playMarchNote(stepIndex);
    });

    this.input = {
      left: false,
      right: false,
    };

    this.levelClearTimer = 0;
    this.gameOverTimer = 0;
  }

  startNewGame() {
    this.score = 0;
    this.level = 1;
    this.state = GAME_STATES.PLAYING;
    this.player.resetAll();
    this.barriers.reset();
    this.aliens.initFleet();
    this.levelClearTimer = 0;
    this.gameOverTimer = 0;
  }

  handleKeyDown(code) {
    if (this.state === GAME_STATES.PLAYING) {
      if (code === 'ArrowLeft' || code === 'KeyA') {
        this.input.left = true;
      } else if (code === 'ArrowRight' || code === 'KeyD') {
        this.input.right = true;
      } else if (code === 'Space') {
        if (this.player.fire()) {
          this.audio.playShoot();
        }
      }
    }
  }

  handleKeyUp(code) {
    if (code === 'ArrowLeft' || code === 'KeyA') {
      this.input.left = false;
    } else if (code === 'ArrowRight' || code === 'KeyD') {
      this.input.right = false;
    }
  }

  update(deltaTime) {
    if (this.state === GAME_STATES.PAUSED) return;

    // 1. Update Player Input & Position
    let moveDir = 0;
    if (this.input.left) moveDir -= 1;
    if (this.input.right) moveDir += 1;
    this.player.move(moveDir, deltaTime);
    this.player.update(deltaTime);

    // Check if player died and game over needs to be triggered
    if (this.player.isDead && this.player.lives <= 0) {
      this.gameOverTimer += deltaTime;
      if (this.gameOverTimer >= 1200 && this.state !== GAME_STATES.GAME_OVER) {
        this.triggerGameOver();
      }
    }

    // 2. Update Aliens & Bombs
    this.aliens.update(deltaTime);

    // 3. Resolve Collisions
    this.resolveCollisions();

    // 4. Check Alien invasion / landing
    if (this.aliens.getLowestY() >= PLAYER_CONFIG.START_Y + 10) {
      this.triggerGameOver();
    }

    // 5. Check Wave Clear
    if (this.aliens.getAliveCount() === 0) {
      this.levelClearTimer += deltaTime;
      if (this.levelClearTimer >= 1500) {
        this.levelClearTimer = 0;
        this.startNextWave();
      }
    }
  }

  resolveCollisions() {
    const laser = this.player.getLaserBounds();

    // A. Player Laser vs Aliens
    if (laser) {
      for (let i = 0; i < this.aliens.aliens.length; i++) {
        const a = this.aliens.aliens[i];
        if (!a.alive) continue;

        if (checkAABB(laser, a.getBounds())) {
          this.aliens.killAlien(a);
          this.player.laser.active = false;
          this.addScore(a.points);
          this.audio.playInvaderKilled();
          break;
        }
      }
    }

    // B. Player Laser vs Alien Bombs (Arcade projectile clash)
    if (this.player.laser.active) {
      const laserBounds = this.player.getLaserBounds();
      for (let i = this.aliens.bombs.length - 1; i >= 0; i--) {
        const bomb = this.aliens.bombs[i];
        if (checkAABB(laserBounds, bomb)) {
          this.player.laser.active = false;
          this.aliens.bombs.splice(i, 1);
          this.audio.playBunkerHit();
          break;
        }
      }
    }

    // C. Player Laser vs Barriers
    if (this.player.laser.active) {
      const laserBounds = this.player.getLaserBounds();
      if (
        this.barriers.checkHit(
          laserBounds.x,
          laserBounds.y,
          laserBounds.width,
          laserBounds.height,
          'UP',
        )
      ) {
        this.player.laser.active = false;
        this.audio.playBunkerHit();
      }
    }

    // D. Alien Bombs vs Barriers & Player
    for (let i = this.aliens.bombs.length - 1; i >= 0; i--) {
      const bomb = this.aliens.bombs[i];

      // Check Barriers
      if (this.barriers.checkHit(bomb.x, bomb.y, bomb.width, bomb.height, 'DOWN')) {
        this.aliens.bombs.splice(i, 1);
        this.audio.playBunkerHit();
        continue;
      }

      // Check Player
      if (!this.player.isDead && checkAABB(bomb, this.player.getBounds())) {
        this.aliens.bombs.splice(i, 1);
        this.player.hit();
        this.audio.playPlayerExplosion();
      }
    }

    // E. Aliens eroding Barriers directly
    for (let i = 0; i < this.aliens.aliens.length; i++) {
      const a = this.aliens.aliens[i];
      if (a.alive) {
        this.barriers.erodeByAlien(a.x, a.y, a.width, a.height);
      }
    }
  }

  addScore(points) {
    this.score += points;
    const currentHigh = this.getHighScore ? this.getHighScore() : 0;
    if (this.score > currentHigh && this.onSaveHighScore) {
      this.onSaveHighScore(this.score);
    }
  }

  startNextWave() {
    this.level++;
    // Start fleet slightly lower each subsequent level, clamped
    const nextStartY = Math.min(220, ALIEN_CONFIG.START_Y + (this.level - 1) * 16);
    this.aliens.initFleet(nextStartY);
    this.player.resetPosition();
  }

  triggerGameOver() {
    this.state = GAME_STATES.GAME_OVER;
    if (this.onGameOver) {
      this.onGameOver();
    }
  }

  render(ctx) {
    // Clear screen
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Top HUD
    this.renderTopHUD(ctx);

    // 2. Destructible Barriers
    this.barriers.render(ctx);

    // 3. Alien Fleet & Bombs
    this.aliens.render(ctx);

    // 4. Player Cannon & Laser
    this.player.render(ctx);

    // 5. Bottom HUD & Ground Line
    this.renderBottomBar(ctx);

    // 6. Overlays for Paused & Game Over
    if (this.state === GAME_STATES.PAUSED) {
      this.renderPausedOverlay(ctx);
    } else if (this.state === GAME_STATES.GAME_OVER) {
      this.renderGameOverOverlay(ctx);
    }
  }

  renderTopHUD(ctx) {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Current Score Header (Top Left)
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = `18px ${FONT_ARCADE}`;
    ctx.fillText('SCORE<1>', 36, 32);
    const scoreStr = String(this.score).padStart(4, '0');
    ctx.fillText(scoreStr, 56, 62);

    // High Score Header (Top Right)
    ctx.textAlign = 'right';
    ctx.fillStyle = COLORS.WHITE;
    ctx.fillText('HI-SCORE', CANVAS_WIDTH - 36, 32);

    const hiScore = this.getHighScore ? this.getHighScore() : 0;
    const hiScoreVal = Math.max(hiScore, this.score);
    const paddedHiScore = String(hiScoreVal).padStart(5, '0');
    ctx.fillStyle = COLORS.GREEN;
    ctx.fillText(paddedHiScore, CANVAS_WIDTH - 36, 62);
  }

  renderBottomBar(ctx) {
    // Classic arcade green ground line
    ctx.strokeStyle = COLORS.GREEN;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(16, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH - 16, GROUND_Y);
    ctx.stroke();

    // Player Lives Display (Bottom Left)
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = `14px ${FONT_ARCADE}`;
    ctx.fillText(String(this.player.lives), 36, CANVAS_HEIGHT - 18);

    // Draw remaining life mini-cannons
    const lifeScale = 2;
    const cannonW = SPRITES.player.width * lifeScale;
    const startX = 64;
    const startY = CANVAS_HEIGHT - 32;

    for (let i = 0; i < Math.max(0, this.player.lives - 1); i++) {
      drawPixelData(
        ctx,
        SPRITES.player.data,
        startX + i * (cannonW + 12),
        startY,
        lifeScale,
        COLORS.GREEN,
      );
    }

    // Level indicator at Bottom Right
    ctx.textAlign = 'right';
    ctx.fillStyle = COLORS.MUTED;
    ctx.font = `12px ${FONT_ARCADE}`;
    ctx.fillText(`STAGE 0${this.level}`, CANVAS_WIDTH - 36, CANVAS_HEIGHT - 18);
  }

  renderPausedOverlay(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = COLORS.YELLOW;
    ctx.font = `24px ${FONT_ARCADE}`;
    ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

    ctx.fillStyle = COLORS.WHITE;
    ctx.font = `12px ${FONT_ARCADE}`;
    ctx.fillText('PRESS [P] TO RESUME', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 25);
  }

  renderGameOverOverlay(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = COLORS.RED;
    ctx.font = `30px ${FONT_ARCADE}`;
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

    ctx.fillStyle = COLORS.WHITE;
    ctx.font = `14px ${FONT_ARCADE}`;
    ctx.fillText(`FINAL SCORE: ${this.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);

    ctx.fillStyle = COLORS.YELLOW;
    ctx.font = `12px ${FONT_ARCADE}`;
    ctx.fillText('PRESS [C] OR [SPACE] TO PLAY AGAIN', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 55);
  }
}
