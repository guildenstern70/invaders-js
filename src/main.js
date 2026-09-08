/**
 * Invaders JS - Main Game Entry Point
 * Implements the arcade canvas game loop, input handlers, state machine, and audio.
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT, HIGH_SCORE_STORAGE_KEY, GAME_STATES } from './constants.js';
import { WelcomeScreen } from './welcomeScreen.js';
import { GameplaySession } from './gameplay.js';
import { AudioManager } from './audio.js';

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

    this.audio = new AudioManager();
    this.welcomeScreen = new WelcomeScreen(() => this.highScore);
    this.gameplay = new GameplaySession(
      this.audio,
      () => this.highScore,
      (newHiScore) => this.saveHighScore(newHiScore),
      () => this.handleGameOver(),
    );

    this.initAudioUnlock();
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

  initAudioUnlock() {
    const unlockAudio = () => {
      this.audio.init();
    };

    window.addEventListener('keydown', unlockAudio, { once: true });
    window.addEventListener('pointerdown', unlockAudio, { once: true });
  }

  initInputs() {
    window.addEventListener('keydown', (event) => {
      // Prevent browser scroll for game controls
      if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.code)) {
        event.preventDefault();
      }

      this.audio.init();

      // Pause toggle
      if (event.code === 'KeyP') {
        this.togglePause();
        return;
      }

      // Coin insertion: begins the game immediately
      if (event.code === 'KeyC') {
        this.handleCoinInserted();
        return;
      }

      // Game state-specific handling
      if (this.state === GAME_STATES.WELCOME) {
        if (event.code === 'Space' || event.code === 'Enter') {
          this.handleCoinInserted();
        }
      } else if (this.state === GAME_STATES.PLAYING) {
        this.gameplay.handleKeyDown(event.code);
      } else if (this.state === GAME_STATES.GAME_OVER) {
        if (event.code === 'Space' || event.code === 'Enter') {
          this.handleCoinInserted();
        }
      }
    });

    window.addEventListener('keyup', (event) => {
      if (this.state === GAME_STATES.PLAYING) {
        this.gameplay.handleKeyUp(event.code);
      }
    });

    // Clicking on canvas inserts coin and starts game or fires
    this.canvas.addEventListener('click', () => {
      this.audio.init();
      if (this.state === GAME_STATES.WELCOME || this.state === GAME_STATES.GAME_OVER) {
        this.handleCoinInserted();
      } else if (this.state === GAME_STATES.PLAYING) {
        if (this.gameplay.player.fire()) {
          this.audio.playShoot();
        }
      }
    });
  }

  handleCoinInserted() {
    this.welcomeScreen.addCredit();
    this.audio.playCoin();

    // Begin the game immediately
    this.state = GAME_STATES.PLAYING;
    this.gameplay.startNewGame();
    console.log('Game started! Level 1 running.');
  }

  togglePause() {
    if (this.state === GAME_STATES.PLAYING) {
      this.state = GAME_STATES.PAUSED;
      this.gameplay.state = GAME_STATES.PAUSED;
    } else if (this.state === GAME_STATES.PAUSED) {
      this.state = GAME_STATES.PLAYING;
      this.gameplay.state = GAME_STATES.PLAYING;
    }
  }

  handleGameOver() {
    this.state = GAME_STATES.GAME_OVER;
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
    console.log('Invaders JS initialized. Welcome screen running.');
  }

  loop(currentTime) {
    const deltaTime = Math.min(currentTime - this.lastTime, 100); // clamp delta to avoid huge jumps
    this.lastTime = currentTime;

    // Ensure pixel smoothing stays disabled
    this.ctx.imageSmoothingEnabled = false;

    // State machine updates and rendering
    if (this.state === GAME_STATES.WELCOME) {
      this.welcomeScreen.update(deltaTime);
      this.welcomeScreen.render(this.ctx);
    } else if (
      this.state === GAME_STATES.PLAYING ||
      this.state === GAME_STATES.PAUSED ||
      this.state === GAME_STATES.GAME_OVER
    ) {
      this.gameplay.update(deltaTime);
      this.gameplay.render(this.ctx);
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

  // Expose game instance for console inspection & testing
  window.__invadersGame = game;
}

window.addEventListener('DOMContentLoaded', init);
