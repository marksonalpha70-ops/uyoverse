import { RadioStation } from '../types/game';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private nitroNoiseNode: AudioBufferSourceNode | null = null;
  private nitroGain: GainNode | null = null;
  private radioGain: GainNode | null = null;
  private radioStepTimer: number | null = null;
  private isMuted: boolean = false;
  private isRadioPlaying: boolean = false;
  private currentStation: RadioStation = 'uyo_fm';

  private stationMetadata: Record<RadioStation, { name: string; currentTrack: string }> = {
    uyo_fm: { name: 'Radio Uyo 101.1 FM', currentTrack: 'Ibom Vibes (Afro-Fusion Mix)' },
    dakkada_pulse: { name: 'Dakkada Pulse Radio', currentTrack: 'Uyo Neon Expressway (Amapiano Beat)' },
    heritage_fm: { name: 'Ibom Heritage 98.5 FM', currentTrack: 'Akwa Ibom Ayaya (Highlife Classics)' },
  };

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startEngine(model: string = 'taxi') {
    try {
      this.initContext();
      if (!this.ctx || this.engineOsc) return;

      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = model === 'keke' ? 'triangle' : model === 'coupe' ? 'sawtooth' : 'sawtooth';
      
      const baseFreq = model === 'keke' ? 58 : model === 'bus' ? 32 : 45;
      this.engineOsc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(model === 'coupe' ? 360 : 260, this.ctx.currentTime);

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start();
    } catch {
      // Audio context policy
    }
  }

  public updateEnginePitch(speedRatio: number, isAccelerating: boolean, isNitro: boolean = false) {
    if (!this.ctx || !this.engineOsc || !this.engineGain) return;
    try {
      const baseFreq = 42;
      const nitroBoost = isNitro ? 35 : 0;
      const targetFreq = baseFreq + Math.abs(speedRatio) * 125 + (isAccelerating ? 24 : 0) + nitroBoost;
      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.07);

      const targetVol = this.isMuted ? 0 : 0.04 + Math.abs(speedRatio) * 0.08 + (isNitro ? 0.04 : 0);
      this.engineGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.05);
    } catch {
      // ignore
    }
  }

  public playNitroSound(active: boolean) {
    try {
      this.initContext();
      if (!this.ctx || this.isMuted) return;

      if (active) {
        if (!this.nitroGain) {
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(800, this.ctx.currentTime);
          filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

          this.nitroGain = this.ctx.createGain();
          this.nitroGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, this.ctx.currentTime);
          osc.frequency.linearRampToValueAtTime(440, this.ctx.currentTime + 0.3);

          osc.connect(filter);
          filter.connect(this.nitroGain);
          this.nitroGain.connect(this.ctx.destination);
          osc.start();
        }
      } else if (this.nitroGain) {
        this.nitroGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
        this.nitroGain = null;
      }
    } catch {
      // ignore
    }
  }

  public playCheckpointSound() {
    try {
      this.initContext();
      if (!this.ctx || this.isMuted) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';

      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.46);
    } catch {
      // ignore
    }
  }

  public playArtifactChime() {
    try {
      this.initContext();
      if (!this.ctx || this.isMuted) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';

      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.setValueAtTime(1174.66, now + 0.1); // D6
      osc.frequency.setValueAtTime(1760, now + 0.2); // A6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.56);
    } catch {
      // ignore
    }
  }

  public playHorn() {
    try {
      this.initContext();
      if (!this.ctx || this.isMuted) return;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(370, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(440, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 0.36);
      osc2.stop(this.ctx.currentTime + 0.36);
    } catch {
      // ignore
    }
  }

  public setStation(station: RadioStation) {
    this.currentStation = station;
    if (this.isRadioPlaying) {
      this.stopRadio();
      this.startRadio();
    }
  }

  public getStationInfo() {
    return this.stationMetadata[this.currentStation];
  }

  public toggleRadio(): boolean {
    this.initContext();
    if (this.isRadioPlaying) {
      this.stopRadio();
      return false;
    } else {
      this.startRadio();
      return true;
    }
  }

  private startRadio() {
    try {
      if (!this.ctx) return;
      this.isRadioPlaying = true;

      // Melodies based on station
      let notes = [220, 261.63, 293.66, 329.63, 392.00, 440.00]; // uyo_fm (Am pentatonic)
      let tempoMs = 240;

      if (this.currentStation === 'dakkada_pulse') {
        // Amapiano log drum groove
        notes = [110, 146.83, 164.81, 220, 164.81, 146.83];
        tempoMs = 210;
      } else if (this.currentStation === 'heritage_fm') {
        // Traditional Highlife syncopation
        notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63];
        tempoMs = 280;
      }

      let step = 0;
      this.radioGain = this.ctx.createGain();
      this.radioGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
      this.radioGain.connect(this.ctx.destination);

      this.radioStepTimer = window.setInterval(() => {
        if (!this.ctx || !this.isRadioPlaying || this.isMuted) return;
        const now = this.ctx.currentTime;
        const note = notes[step % notes.length];
        step++;

        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        osc.type = this.currentStation === 'dakkada_pulse' ? (step % 2 === 0 ? 'sine' : 'sawtooth') : 'triangle';
        osc.frequency.setValueAtTime(note, now);

        noteGain.gain.setValueAtTime(0.08, now);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + (tempoMs / 1000) * 0.9);

        osc.connect(noteGain);
        noteGain.connect(this.radioGain!);
        osc.start(now);
        osc.stop(now + tempoMs / 1000);
      }, tempoMs);
    } catch {
      this.isRadioPlaying = false;
    }
  }

  private stopRadio() {
    this.isRadioPlaying = false;
    if (this.radioStepTimer) {
      clearInterval(this.radioStepTimer);
      this.radioStepTimer = null;
    }
    if (this.radioGain && this.ctx) {
      this.radioGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.engineGain && this.ctx) {
      this.engineGain.gain.setValueAtTime(this.isMuted ? 0 : 0.06, this.ctx.currentTime);
    }
    if (this.radioGain && this.ctx) {
      this.radioGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public isMuteActive(): boolean {
    return this.isMuted;
  }

  public isRadioOn(): boolean {
    return this.isRadioPlaying;
  }
}

export const soundEngine = new SoundEngine();
