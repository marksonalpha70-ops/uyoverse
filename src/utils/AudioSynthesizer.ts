import { RadioStation, WeatherType } from '../types/game';

export interface RadioMetadata {
  name: string;
  frequency: string;
  currentTrack: string;
  artist: string;
  genre: string;
  accentColor: string;
}

export type DJAnnouncementListener = (message: string) => void;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private nitroGain: GainNode | null = null;
  private radioGain: GainNode | null = null;
  private radioMasterGain: GainNode | null = null;
  private radioVolume: number = 0.85;

  private isMuted: boolean = false;
  private isRadioPlaying: boolean = false;
  private currentStation: RadioStation = 'uyo_fm';

  // Radio sequencer state
  private radioStepTimer: number | null = null;
  private radioStepIndex: number = 0;
  private visualizerBars: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
  private djListeners: DJAnnouncementListener[] = [];
  private djTimer: number | null = null;

  // Weather & environmental ambience
  private weatherNoiseNode: AudioBufferSourceNode | null = null;
  private weatherGain: GainNode | null = null;
  private weatherFilter: BiquadFilterNode | null = null;
  private currentWeather: WeatherType = 'clear';

  // Dynamic sound rate limiters
  private lastTireSquealTime: number = 0;
  private lastBrakeScreechTime: number = 0;
  private lastFootstepTime: number = 0;
  private lastCollisionTime: number = 0;

  private stationMetadata: Record<RadioStation, RadioMetadata> = {
    uyo_fm: {
      name: 'Radio Uyo',
      frequency: '101.1 FM',
      currentTrack: 'Ibom Vibes (Afro-Fusion Mix)',
      artist: 'DJ Akwa Ibom ft. Uyo All-Stars',
      genre: 'Afro-Fusion & Afrobeats',
      accentColor: '#1fc16b',
    },
    dakkada_pulse: {
      name: 'Dakkada Pulse',
      frequency: '95.3 FM',
      currentTrack: 'Uyo Neon Expressway',
      artist: 'The 21st Tower Collective',
      genre: 'Amapiano & Deep Log-Drum',
      accentColor: '#f26522',
    },
    heritage_fm: {
      name: 'Ibom Heritage',
      frequency: '98.5 FM',
      currentTrack: 'Akwa Ibom Ayaya',
      artist: 'Highlife Palmwine Masters',
      genre: 'Traditional Highlife & Guitar',
      accentColor: '#eab308',
    },
    atlantic_wave: {
      name: 'Atlantic Wave',
      frequency: '89.9 FM',
      currentTrack: 'Ibeno Coastal Sunset',
      artist: 'Eket Shores Lounge Band',
      genre: 'Chill Coastal Lo-Fi & Soul',
      accentColor: '#38bdf8',
    },
  };

  private djDrops: Record<RadioStation, string[]> = {
    uyo_fm: [
      '📻 [Radio Uyo 101.1 FM] "Number One in Akwa Ibom — keep cruising the Plaza!"',
      '🔥 [Radio Uyo] "DJ Akwa Ibom in the mix! Smooth tarmac along Aka Road!"',
      '🚀 [Radio Uyo] "Ibom to the world! Stay safe and buckle up!"',
    ],
    dakkada_pulse: [
      '⚡ [Dakkada Pulse 95.3] "Heavy log-drum energy direct from the 21-storey smart tower!"',
      '🔊 [Dakkada Pulse] "Feel the bass shake the expressway! Uyo is wide awake!"',
      '💎 [Dakkada Pulse] "Urban heat in the Land of Promise!"',
    ],
    heritage_fm: [
      '🌴 [Ibom Heritage 98.5 FM] "Akwa Ibom Ayaya! Golden Highlife melodies for your journey."',
      '👑 [Heritage FM] "Honoring the legendary culture of the Land of Promise."',
      '🎺 [Heritage FM] "Authentic palmwine guitar grooves straight to your car radio."',
    ],
    atlantic_wave: [
      '🌊 [Atlantic Wave 89.9 FM] "Breeze from Ibeno beach all the way to Ibom Tropicana."',
      '🌅 [Atlantic Wave] "Golden hour chill session — cruising Uyo at sunset."',
      '✨ [Atlantic Wave] "Relax your mind on the boulevard."',
    ],
  };

  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // ----------------- VEHICLE ENGINE & NITRO -----------------
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
      filter.frequency.setValueAtTime(model === 'coupe' ? 380 : 270, this.ctx.currentTime);

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start();
    } catch {
      // Audio context permission policy
    }
  }

  public updateEnginePitch(speedRatio: number, isAccelerating: boolean, isNitro: boolean = false) {
    if (!this.ctx || !this.engineOsc || !this.engineGain) return;
    try {
      const baseFreq = 42;
      const nitroBoost = isNitro ? 35 : 0;
      const targetFreq = baseFreq + Math.abs(speedRatio) * 135 + (isAccelerating ? 26 : 0) + nitroBoost;
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
          filter.frequency.setValueAtTime(850, this.ctx.currentTime);
          filter.Q.setValueAtTime(1.8, this.ctx.currentTime);

          this.nitroGain = this.ctx.createGain();
          this.nitroGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, this.ctx.currentTime);
          osc.frequency.linearRampToValueAtTime(460, this.ctx.currentTime + 0.35);

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

  // ----------------- TIRE DRIFT, BRAKE & COLLISION FX -----------------
  public playTireSqueal(intensity: number = 0.5) {
    try {
      this.initContext();
      if (!this.ctx || this.isMuted) return;

      const now = performance.now();
      if (now - this.lastTireSquealTime < 160) return;
      this.lastTireSquealTime = now;

      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      const basePitch = 600 + Math.random() * 250;
      osc.frequency.setValueAtTime(basePitch, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(basePitch + 350, this.ctx.currentTime + 0.18);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      filter.Q.setValueAtTime(4.0, this.ctx.currentTime);

      const targetVol = Math.min(0.09, 0.04 * intensity);
      gain.gain.setValueAtTime(targetVol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.23);
    } catch {
      // ignore
    }
  }

  public playBrakeScreech() {
    try {
      this.initContext();
      if (!this.ctx || this.isMuted) return;

      const now = performance.now();
      if (now - this.lastBrakeScreechTime < 350) return;
      this.lastBrakeScreechTime = now;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.28);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.29);
    } catch {
      // ignore
    }
  }

  public playCollisionSound(speedRatio: number = 0.5) {
    try {
      this.initContext();
      if (!this.ctx || this.isMuted) return;

      const now = performance.now();
      if (now - this.lastCollisionTime < 400) return;
      this.lastCollisionTime = now;

      // Punchy metallic thud
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.3);

      const vol = Math.min(0.25, 0.08 + speedRatio * 0.15);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.36);
    } catch {
      // ignore
    }
  }

  public playFootstep(isRunning: boolean = false) {
    try {
      this.initContext();
      if (!this.ctx || this.isMuted) return;

      const now = performance.now();
      const interval = isRunning ? 240 : 380;
      if (now - this.lastFootstepTime < interval) return;
      this.lastFootstepTime = now;

      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(110 + Math.random() * 40, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.08);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {
      // ignore
    }
  }

  // ----------------- UI, REWARD & HORN FX -----------------
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
      osc.frequency.setValueAtTime(1046.5, now + 0.24); // C6

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

  // ----------------- RADIO TUNING STATIC & DJ JINGLES -----------------
  public playTuningStatic() {
    try {
      this.initContext();
      if (!this.ctx || this.isMuted) return;

      // Realistic analog FM radio static noise burst
      const bufferSize = this.ctx.sampleRate * 0.22;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.2);
      filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    } catch {
      // ignore
    }
  }

  public registerDJListener(listener: DJAnnouncementListener) {
    this.djListeners.push(listener);
    return () => {
      this.djListeners = this.djListeners.filter((l) => l !== listener);
    };
  }

  private broadcastDJAnnouncement() {
    const list = this.djDrops[this.currentStation] || [];
    if (list.length === 0) return;
    const msg = list[Math.floor(Math.random() * list.length)];
    this.djListeners.forEach((l) => l(msg));
  }

  // ----------------- POLYPHONIC AFROBEAT RADIO ENGINE -----------------
  public setStation(station: RadioStation) {
    this.currentStation = station;
    this.playTuningStatic();
    this.broadcastDJAnnouncement();

    if (this.isRadioPlaying) {
      this.stopRadio();
      this.startRadio();
    }
  }

  public getStationInfo(): RadioMetadata {
    return this.stationMetadata[this.currentStation];
  }

  public getAllStations(): { id: RadioStation; meta: RadioMetadata }[] {
    const stations: RadioStation[] = ['uyo_fm', 'dakkada_pulse', 'heritage_fm', 'atlantic_wave'];
    return stations.map((id) => ({ id, meta: this.stationMetadata[id] }));
  }

  public setRadioVolume(vol: number) {
    this.radioVolume = Math.max(0, Math.min(1, vol));
    if (this.radioMasterGain && this.ctx) {
      this.radioMasterGain.gain.setTargetAtTime(
        this.isMuted ? 0 : this.radioVolume * 0.12,
        this.ctx.currentTime,
        0.05
      );
    }
  }

  public getRadioVolume(): number {
    return this.radioVolume;
  }

  public getVisualizerData(): number[] {
    if (!this.isRadioPlaying || this.isMuted) {
      return [0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05];
    }
    return this.visualizerBars;
  }

  public toggleRadio(): boolean {
    this.initContext();
    if (this.isRadioPlaying) {
      this.stopRadio();
      return false;
    } else {
      this.playTuningStatic();
      this.startRadio();
      this.broadcastDJAnnouncement();
      return true;
    }
  }

  private startRadio() {
    try {
      if (!this.ctx) return;
      this.isRadioPlaying = true;
      this.radioStepIndex = 0;

      this.radioMasterGain = this.ctx.createGain();
      this.radioMasterGain.gain.setValueAtTime(
        this.isMuted ? 0 : this.radioVolume * 0.12,
        this.ctx.currentTime
      );
      this.radioMasterGain.connect(this.ctx.destination);

      // Station-specific musical parameters
      // 16-step Afrobeat loop
      const tempo =
        this.currentStation === 'dakkada_pulse'
          ? 112 // Amapiano groove
          : this.currentStation === 'heritage_fm'
          ? 118 // Highlife shuffle
          : this.currentStation === 'atlantic_wave'
          ? 96 // Coastal Lo-fi
          : 108; // Afro-Fusion
      const stepDurationMs = (60000 / tempo) / 4; // 16th note step

      // Scale notes: frequencies
      // uyo_fm: Afro-Fusion (A Minor / C Major Pentatonic: A2, C3, D3, E3, G3, A3, C4, E4)
      const uyoBass = [110, 110, 0, 130.81, 146.83, 0, 164.81, 110, 0, 146.83, 164.81, 0, 196, 164.81, 146.83, 0];
      const uyoChords = [
        [220, 261.63, 329.63], // Am
        [220, 261.63, 329.63],
        [174.61, 220, 261.63], // F
        [196, 246.94, 293.66], // G
      ];

      // dakkada_pulse: Amapiano (Log drum pitch-drop notes + syncopated piano)
      const pulseLogDrum = [55, 0, 73.42, 0, 55, 65.41, 0, 82.41, 55, 0, 73.42, 65.41, 0, 55, 82.41, 0];
      const pulseKeys = [
        [220, 277.18, 329.63],
        [246.94, 293.66, 369.99],
        [196, 246.94, 293.66],
        [220, 261.63, 329.63],
      ];

      // heritage_fm: Highlife (Bright major syncopations C-F-G-C)
      const heritageBass = [130.81, 0, 164.81, 174.61, 0, 196, 174.61, 164.81, 130.81, 0, 196, 0, 174.61, 164.81, 146.83, 0];
      const heritageLead = [523.25, 0, 587.33, 659.25, 0, 783.99, 659.25, 523.25];

      // atlantic_wave: Coastal Lo-Fi (Lush chords)
      const waveBass = [65.41, 0, 0, 82.41, 0, 98, 0, 0, 65.41, 0, 73.42, 0, 82.41, 0, 0, 0];
      const wavePads = [
        [196, 246.94, 293.66, 349.23],
        [174.61, 220, 261.63, 329.63],
      ];

      this.radioStepTimer = window.setInterval(() => {
        if (!this.ctx || !this.isRadioPlaying || this.isMuted) return;

        const now = this.ctx.currentTime;
        const step = this.radioStepIndex % 16;
        this.radioStepIndex++;

        // Randomize visualizer bars according to beat & frequency bands
        this.visualizerBars = this.visualizerBars.map((_, idx) => {
          const isBass = idx < 3;
          const boost = (step % 4 === 0 && isBass) ? 0.9 : Math.random() * 0.7 + 0.15;
          return parseFloat(boost.toFixed(2));
        });

        // 1. AFROBEAT DRUM TRACK
        // Shaker / Hi-Hat on 16th notes (classic African 3:2 clave emphasis on 0, 3, 6, 8, 10, 12)
        const isClaveAccent = [0, 3, 6, 8, 10, 12, 14].includes(step);
        this.playSynthesizedHat(now, isClaveAccent ? 0.05 : 0.02, isClaveAccent ? 3800 : 5000);

        // Kick drum on beats 0, 7, 10
        if (step === 0 || step === 7 || step === 10) {
          this.playSynthesizedKick(now, step === 0 ? 0.14 : 0.09);
        }

        // Rimshot / Snare on beats 4, 12
        if (step === 4 || step === 12) {
          this.playSynthesizedSnare(now, 0.07);
        }

        // 2. BASSLINE TRACK
        if (this.currentStation === 'dakkada_pulse') {
          // Amapiano Log Drum pitch-glide synth
          const logFreq = pulseLogDrum[step];
          if (logFreq > 0) {
            this.playAmapianoLogDrum(now, logFreq, (stepDurationMs / 1000) * 1.4);
          }
        } else if (this.currentStation === 'heritage_fm') {
          const hFreq = heritageBass[step];
          if (hFreq > 0) {
            this.playBassNote(now, hFreq, 'triangle', (stepDurationMs / 1000) * 1.1);
          }
        } else if (this.currentStation === 'atlantic_wave') {
          const wFreq = waveBass[step];
          if (wFreq > 0) {
            this.playBassNote(now, wFreq, 'sine', (stepDurationMs / 1000) * 2.2);
          }
        } else {
          // uyo_fm
          const uFreq = uyoBass[step];
          if (uFreq > 0) {
            this.playBassNote(now, uFreq, 'sawtooth', (stepDurationMs / 1000) * 1.2);
          }
        }

        // 3. CHORDS & MELODIC LAYERS (every 4 steps / quarter note)
        if (step % 4 === 0) {
          const barIdx = Math.floor(step / 4);
          if (this.currentStation === 'dakkada_pulse') {
            const chord = pulseKeys[barIdx % pulseKeys.length];
            this.playPolyChord(now, chord, 'triangle', (stepDurationMs / 1000) * 2.8, 0.035);
          } else if (this.currentStation === 'heritage_fm') {
            const leadNote = heritageLead[barIdx % heritageLead.length];
            if (leadNote > 0) {
              this.playHighlifePluck(now, leadNote, 0.06);
            }
          } else if (this.currentStation === 'atlantic_wave') {
            const chord = wavePads[barIdx % wavePads.length];
            this.playPolyChord(now, chord, 'sine', (stepDurationMs / 1000) * 3.8, 0.04);
          } else {
            // uyo_fm
            const chord = uyoChords[barIdx % uyoChords.length];
            this.playPolyChord(now, chord, 'sawtooth', (stepDurationMs / 1000) * 2.2, 0.025);
          }
        }
      }, stepDurationMs);

      // Periodic DJ radio drop (every 45-60s)
      this.djTimer = window.setInterval(() => {
        if (this.isRadioPlaying && !this.isMuted) {
          this.broadcastDJAnnouncement();
        }
      }, 48000);
    } catch {
      this.isRadioPlaying = false;
    }
  }

  // Synthesis helpers for authentic instruments
  private playSynthesizedKick(time: number, vol: number) {
    if (!this.ctx || !this.radioMasterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(130, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.12);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.connect(gain);
    gain.connect(this.radioMasterGain);
    osc.start(time);
    osc.stop(time + 0.16);
  }

  private playSynthesizedHat(time: number, vol: number, cutoff: number) {
    if (!this.ctx || !this.radioMasterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(cutoff, time);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(cutoff, time);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.radioMasterGain);
    osc.start(time);
    osc.stop(time + 0.05);
  }

  private playSynthesizedSnare(time: number, vol: number) {
    if (!this.ctx || !this.radioMasterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.1);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(gain);
    gain.connect(this.radioMasterGain);
    osc.start(time);
    osc.stop(time + 0.13);
  }

  private playBassNote(time: number, freq: number, type: OscillatorType, duration: number) {
    if (!this.ctx || !this.radioMasterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, time);

    gain.gain.setValueAtTime(0.09, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.radioMasterGain);
    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  private playAmapianoLogDrum(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.radioMasterGain) return;
    // Log Drum characteristic: high punch dropping to rich resonant sub
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.8, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.04);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, time);
    filter.Q.setValueAtTime(4.0, time);

    gain.gain.setValueAtTime(0.16, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.radioMasterGain);
    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  private playHighlifePluck(time: number, freq: number, vol: number) {
    if (!this.ctx || !this.radioMasterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.5, time);
    filter.Q.setValueAtTime(2.0, time);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.radioMasterGain);
    osc.start(time);
    osc.stop(time + 0.3);
  }

  private playPolyChord(
    time: number,
    chord: number[],
    type: OscillatorType,
    duration: number,
    volPerNote: number
  ) {
    if (!this.ctx || !this.radioMasterGain) return;
    chord.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const filter = this.ctx!.createBiquadFilter();
      const gain = this.ctx!.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, time);

      gain.gain.setValueAtTime(volPerNote, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.radioMasterGain!);
      osc.start(time);
      osc.stop(time + duration + 0.02);
    });
  }

  private stopRadio() {
    this.isRadioPlaying = false;
    if (this.radioStepTimer) {
      clearInterval(this.radioStepTimer);
      this.radioStepTimer = null;
    }
    if (this.djTimer) {
      clearInterval(this.djTimer);
      this.djTimer = null;
    }
    if (this.radioMasterGain && this.ctx) {
      this.radioMasterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    this.visualizerBars = [0, 0, 0, 0, 0, 0, 0, 0];
  }

  // ----------------- WEATHER ATMOSPHERE LOOP -----------------
  public setWeatherAtmosphere(weather: WeatherType) {
    if (this.currentWeather === weather) return;
    this.currentWeather = weather;

    try {
      this.initContext();
      if (!this.ctx || this.isMuted) return;

      if (weather === 'tropical_rain') {
        if (!this.weatherGain) {
          // Continuous rain sound
          const bufferSize = this.ctx.sampleRate * 2;
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.4;
          }

          this.weatherNoiseNode = this.ctx.createBufferSource();
          this.weatherNoiseNode.buffer = buffer;
          this.weatherNoiseNode.loop = true;

          this.weatherFilter = this.ctx.createBiquadFilter();
          this.weatherFilter.type = 'lowpass';
          this.weatherFilter.frequency.setValueAtTime(800, this.ctx.currentTime);

          this.weatherGain = this.ctx.createGain();
          this.weatherGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

          this.weatherNoiseNode.connect(this.weatherFilter);
          this.weatherFilter.connect(this.weatherGain);
          this.weatherGain.connect(this.ctx.destination);
          this.weatherNoiseNode.start();
        }
      } else {
        if (this.weatherGain && this.ctx) {
          this.weatherGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
          setTimeout(() => {
            if (this.weatherNoiseNode) {
              try {
                this.weatherNoiseNode.stop();
              } catch {
                // ignore
              }
              this.weatherNoiseNode = null;
            }
            this.weatherGain = null;
          }, 300);
        }
      }
    } catch {
      // ignore
    }
  }

  // ----------------- MASTER MUTE & QUERY -----------------
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.engineGain && this.ctx) {
      this.engineGain.gain.setValueAtTime(this.isMuted ? 0 : 0.06, this.ctx.currentTime);
    }
    if (this.radioMasterGain && this.ctx) {
      this.radioMasterGain.gain.setValueAtTime(
        this.isMuted ? 0 : this.radioVolume * 0.12,
        this.ctx.currentTime
      );
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
