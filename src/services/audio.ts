/**
 * OOP'S ORACLE Procedural Audio Synthesis Engine
 * Generates realistic coffee pouring, rising steam hiss, and cinematic reveal chords
 * using the HTML5 Web Audio API with zero external file dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private pourSource: AudioNode | null = null;
  private steamSource: AudioNode | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopCoffeePour();
      this.stopSteamHiss();
    }
  }

  /**
   * Procedural liquid pouring sound simulation:
   * White noise passed through dual resonant bandpass filters that slowly
   * rise in pitch to simulate the resonant cavity of a filling ceramic cup.
   */
  public startCoffeePour(durationSeconds = 4) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate brownian/pink-ish fluid noise
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Gain
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Resonant bandpass filter simulating liquid stream
      const filter1 = this.ctx.createBiquadFilter();
      filter1.type = 'bandpass';
      filter1.frequency.setValueAtTime(450, this.ctx.currentTime);
      // Pitch rises as ceramic cup fills with hot coffee!
      filter1.frequency.exponentialRampToValueAtTime(850, this.ctx.currentTime + durationSeconds);
      filter1.Q.setValueAtTime(4.0, this.ctx.currentTime);

      const filter2 = this.ctx.createBiquadFilter();
      filter2.type = 'bandpass';
      filter2.frequency.setValueAtTime(1200, this.ctx.currentTime);
      filter2.frequency.exponentialRampToValueAtTime(1800, this.ctx.currentTime + durationSeconds);
      filter2.Q.setValueAtTime(6.0, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.35, this.ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime + durationSeconds - 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + durationSeconds);

      noise.connect(filter1);
      noise.connect(filter2);
      filter1.connect(gain);
      filter2.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      this.pourSource = noise;

      setTimeout(() => {
        try {
          noise.stop();
        } catch {}
      }, durationSeconds * 1000);
    } catch (e) {
      console.warn('Audio pour playback caught:', e);
    }
  }

  public stopCoffeePour() {
    if (this.pourSource) {
      try {
        (this.pourSource as AudioBufferSourceNode).stop();
      } catch {}
      this.pourSource = null;
    }
  }

  /**
   * Volumetric hot steam hiss
   */
  public startSteamHiss(durationSeconds = 4) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3200, this.ctx.currentTime);
      filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + durationSeconds);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      this.steamSource = noise;

      setTimeout(() => {
        try {
          noise.stop();
        } catch {}
      }, durationSeconds * 1000);
    } catch {}
  }

  public stopSteamHiss() {
    if (this.steamSource) {
      try {
        (this.steamSource as AudioBufferSourceNode).stop();
      } catch {}
      this.steamSource = null;
    }
  }

  /**
   * Cinematic brand reveal chord (Warm rich golden synth chord)
   */
  public playBrandRevealChord() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      // Chord frequencies: D3, A3, D4, F#4, A4 (D Major cinematic warmth)
      const freqs = [146.83, 220.00, 293.66, 369.99, 440.00, 587.33];
      const now = this.ctx.currentTime;

      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.08 / freqs.length, now + 0.4);
        gain.gain.setValueAtTime(0.08 / freqs.length, now + 1.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now);
        osc.stop(now + 3.5);
      });
    } catch {}
  }

  /**
   * UI Click / execution chirp
   */
  public playClick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {}
  }
}

export const soundEngine = new SoundEngine();
