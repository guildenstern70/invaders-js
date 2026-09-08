/**
 * Invaders JS - (C) 2026 Alessio Saltarin (ISC)
 * 
 * Synthesized Web Audio API Arcade Sound System
 * Zero runtime dependencies, pure procedural sound effects.
 */

export class AudioManager {
  constructor() {
    this.audioCtx = null;
    this.noiseBuffer = null;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.createNoiseBuffer();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  createNoiseBuffer() {
    if (!this.audioCtx) return;
    const sampleRate = this.audioCtx.sampleRate;
    const bufferSize = sampleRate * 1; // 1 second of white noise
    const buffer = this.audioCtx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  playCoin() {
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

  playShoot() {
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      // Fast downward frequency chirp
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.16);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.17);
    } catch (_e) {
      // Ignore
    }
  }

  playInvaderKilled() {
    if (!this.audioCtx || !this.noiseBuffer) return;
    try {
      const now = this.audioCtx.currentTime;
      const noiseSource = this.audioCtx.createBufferSource();
      noiseSource.buffer = this.noiseBuffer;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + 0.2);

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + 0.21);
    } catch (_e) {
      // Ignore
    }
  }

  playPlayerExplosion() {
    if (!this.audioCtx || !this.noiseBuffer) return;
    try {
      const now = this.audioCtx.currentTime;
      const noiseSource = this.audioCtx.createBufferSource();
      noiseSource.buffer = this.noiseBuffer;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + 0.7);

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + 0.71);
    } catch (_e) {
      // Ignore
    }
  }

  playBunkerHit() {
    if (!this.audioCtx || !this.noiseBuffer) return;
    try {
      const now = this.audioCtx.currentTime;
      const noiseSource = this.audioCtx.createBufferSource();
      noiseSource.buffer = this.noiseBuffer;

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      noiseSource.connect(gain);
      gain.connect(this.audioCtx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + 0.09);
    } catch (_e) {
      // Ignore
    }
  }

  playMarchNote(noteIndex) {
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      // 4 distinct descending frequencies: F3, E3, D#3, D3
      const frequencies = [174.61, 164.81, 155.56, 146.83];
      const freq = frequencies[noteIndex % 4];

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (_e) {
      // Ignore
    }
  }
}
