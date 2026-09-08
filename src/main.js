/**
 * Invaders JS - Main Game Entry Point
 * Implements the arcade canvas game loop, input handlers, and welcome screen.
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT, HIGH_SCORE_STORAGE_KEY, GAME_STATES } from './constants.js';
import { WelcomeScreen } from './welcomeScreen.js';

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) {
      throw new Error('Canvas 2D context is not supported.');
    }

    // Disable image smoothing for authentic crisp pixel rendering
    this.ctx.imageSmoothingEnabled = false;

    this.state = GAME_STATES.WELCOME;
    this.highScore = this.loadHighScore();
    this.lastTime = performance.now();

    this.welcomeScreen = new WelcomeScreen(() => this.highScore);

    // Audio context for authentic arcade sound synthesis
    this.audioCtx = null;

    this.initAudio();
    this.initInputs();
  }

  loadHighScore() {
    try {
      const stored = localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
      if (stored !== null) {
        const val = parseInt(stored, 10);
        return isNaN(val) ? 0 : val;
      }
    } catch (e) {
      console.warn('Unable to access localStorage for high score:', e);
    }
    return 0;
  }

  saveHighScore(newScore) {
    if (newScore > this.highScore) {
      this.highScore = newScore;
      try {
        localStorage.setItem(HIGH_SCORE_STORAGE_KEY, String(this.highScore));
      } catch (e) {
        console.warn('Unable to save high score to localStorage:', e);
      }
    }
  }

  initAudio() {
    // Lazy audio context creation on first user interaction
    const unlockAudio = () => {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    };

    window.addEventListener('keydown', unlockAudio, { once: true });
    window.addEventListener('pointerdown', unlockAudio, { once: true });
  }

  playCoinSound() {
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch (_e) {
      // Audio autoplay policy or hardware error
    }
  }

  initInputs() {
    window.addEventListener('keydown', (event) => {
      // Prevent browser scroll for game controls
      if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.code)) {
        event.preventDefault();
      }

      if (event.code === 'KeyC') {
        // Insert coin
        this.handleInsertCoin();
      } else if (event.code === 'Space' || event.code === 'Enter') {
        // If welcome screen, credit check or direct start
        this.handleStart();
      }
    });

    // Also support clicking on canvas to insert coin / start
    this.canvas.addEventListener('click', () => {
      this.handleInsertCoin();
    });
  }

  handleInsertCoin() {
    this.welcomeScreen.addCredit();
    this.playCoinSound();
  }

  handleStart() {
    if (this.state === GAME_STATES.WELCOME) {
      if (this.welcomeScreen.credits === 0) {
        // Auto-insert a coin if player hits space directly
        this.welcomeScreen.addCredit();
        this.playCoinSound();
      }
      console.log('Game starting from Welcome Screen! Credits:', this.welcomeScreen.credits);
    }
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
    console.log('Invaders JS initialized. Welcome screen running.');
  }

  loop(currentTime) {
    const deltaTime = Math.min(currentTime - this.lastTime, 100); // clamp delta to avoid huge jumps
    this.lastTime = currentTime;

    // Update
    if (this.state === GAME_STATES.WELCOME) {
      this.welcomeScreen.update(deltaTime);
    }

    // Render
    if (this.state === GAME_STATES.WELCOME) {
      this.welcomeScreen.render(this.ctx);
    }

    requestAnimationFrame(this.loop.bind(this));
  }
}

function init() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) {
    console.error('Game canvas element #game-canvas not found.');
    return;
  }

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const game = new Game(canvas);
  game.start();

  // Expose game instance for console inspection & testing if needed
  window.__invadersGame = game;
}

window.addEventListener('DOMContentLoaded', init);
