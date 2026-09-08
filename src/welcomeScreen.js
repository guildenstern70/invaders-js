/**
 * Invaders JS - (C) 2026 Alessio Saltarin (ISC)
 * 
 * Welcome Screen (Attract Mode)
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, FONT_ARCADE } from './constants.js';
import { SPRITES, drawPixelData } from './sprites.js';

export class WelcomeScreen {
  constructor(getHighScoreCallback) {
    this.getHighScore = getHighScoreCallback;
    this.blinkTimer = 0;
    this.blinkInterval = 500; // ms
    this.isBlinkVisible = true;
    this.credits = 0;
  }

  addCredit() {
    this.credits++;
  }

  update(deltaTime) {
    this.blinkTimer += deltaTime;
    if (this.blinkTimer >= this.blinkInterval) {
      this.isBlinkVisible = !this.isBlinkVisible;
      this.blinkTimer %= this.blinkInterval;
    }
  }

  render(ctx) {
    // Clear screen to arcade black
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. TOP HUD (Score & High Score)
    this.renderTopHUD(ctx);

    // 2. MAIN TITLE
    this.renderTitle(ctx);

    // 3. SCORE ADVANCE TABLE
    this.renderScoreTable(ctx);

    // 4. BLINKING INSERT COIN TEXT
    this.renderInsertCoin(ctx);

    // 5. BOTTOM BAR (Credits & Arcade Ground Line)
    this.renderBottomBar(ctx);
  }

  renderTopHUD(ctx) {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Current Score Header (Top Left)
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = `18px ${FONT_ARCADE}`;
    ctx.fillText('SCORE<1>', 36, 32);
    ctx.fillText('0000', 56, 62);

    // High Score Header (Top Right) - Requirement: "On the top screen on the right there will be the highest score up till now."
    ctx.textAlign = 'right';
    ctx.fillStyle = COLORS.WHITE;
    ctx.fillText('HI-SCORE', CANVAS_WIDTH - 36, 32);

    // Zero-pad high score (e.g. 00000 or actual score)
    const hiScore = this.getHighScore ? this.getHighScore() : 0;
    const paddedHiScore = String(hiScore).padStart(5, '0');
    ctx.fillStyle = COLORS.GREEN;
    ctx.fillText(paddedHiScore, CANVAS_WIDTH - 36, 62);
  }

  renderTitle(ctx) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Shadow / Glow effect
    ctx.shadowColor = 'rgba(0, 255, 128, 0.8)';
    ctx.shadowBlur = 14;

    ctx.fillStyle = COLORS.GREEN;
    ctx.font = `34px ${FONT_ARCADE}`;
    ctx.fillText('INVADERS JS', CANVAS_WIDTH / 2, 145);

    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = `14px ${FONT_ARCADE}`;
    ctx.fillText('SPACE INVADERS 1978 ATTRACT MODE', CANVAS_WIDTH / 2, 195);
  }

  renderScoreTable(ctx) {
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = `16px ${FONT_ARCADE}`;
    ctx.fillText('*SCORE ADVANCE TABLE*', CANVAS_WIDTH / 2, 255);

    const items = [
      {
        data: SPRITES.ufo.data,
        color: SPRITES.ufo.color,
        width: SPRITES.ufo.width,
        height: SPRITES.ufo.height,
        text: '=?  MYSTERY',
        y: 300,
        scale: 3,
      },
      {
        data: SPRITES.squid.frames[0],
        color: SPRITES.squid.color,
        width: SPRITES.squid.width,
        height: SPRITES.squid.height,
        text: '=30 POINTS',
        y: 350,
        scale: 3,
      },
      {
        data: SPRITES.crab.frames[0],
        color: SPRITES.crab.color,
        width: SPRITES.crab.width,
        height: SPRITES.crab.height,
        text: '=20 POINTS',
        y: 400,
        scale: 3,
      },
      {
        data: SPRITES.octopus.frames[0],
        color: SPRITES.octopus.color,
        width: SPRITES.octopus.width,
        height: SPRITES.octopus.height,
        text: '=10 POINTS',
        y: 450,
        scale: 3,
      },
    ];

    items.forEach((item) => {
      const spriteW = item.width * item.scale;
      const startX = CANVAS_WIDTH / 2 - 130;

      // Draw pixel sprite
      drawPixelData(
        ctx,
        item.data,
        startX,
        item.y - (item.height * item.scale) / 2,
        item.scale,
        item.color,
      );

      // Draw points text
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = COLORS.WHITE;
      ctx.font = `16px ${FONT_ARCADE}`;
      ctx.fillText(item.text, startX + spriteW + 28, item.y);
    });
  }

  renderInsertCoin(ctx) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Requirement: "The page will show a blinking insert coin text."
    if (this.isBlinkVisible) {
      ctx.save();
      ctx.shadowColor = 'rgba(255, 230, 0, 0.7)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = COLORS.YELLOW;
      ctx.font = `20px ${FONT_ARCADE}`;
      ctx.fillText('INSERT COIN', CANVAS_WIDTH / 2, 545);
      ctx.restore();
    }

    // Call to action / instruction
    ctx.fillStyle = COLORS.MUTED;
    ctx.font = `12px ${FONT_ARCADE}`;
    ctx.fillText('PRESS [C] TO INSERT COIN', CANVAS_WIDTH / 2, 595);
    ctx.fillText('PRESS [SPACE] TO START', CANVAS_WIDTH / 2, 625);
  }

  renderBottomBar(ctx) {
    // Classic green ground line
    ctx.strokeStyle = COLORS.GREEN;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(16, CANVAS_HEIGHT - 48);
    ctx.lineTo(CANVAS_WIDTH - 16, CANVAS_HEIGHT - 48);
    ctx.stroke();

    // Bottom HUD: Credits
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = COLORS.WHITE;
    ctx.font = `14px ${FONT_ARCADE}`;
    const creditPadded = String(this.credits).padStart(2, '0');
    ctx.fillText(`CREDIT ${creditPadded}`, 36, CANVAS_HEIGHT - 18);

    // Bottom HUD: System info / copyright
    ctx.textAlign = 'right';
    ctx.fillStyle = COLORS.MUTED;
    ctx.font = `12px ${FONT_ARCADE}`;
    ctx.fillText('INVADERS JS', CANVAS_WIDTH - 36, CANVAS_HEIGHT - 18);
  }
}
