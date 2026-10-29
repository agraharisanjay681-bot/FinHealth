export type ThemeId = 'quantum' | 'cyber' | 'solar' | 'dark' | 'light';

export interface ThemeColors {
  id: ThemeId;
  name: string;
  tagline: string;
  primary: string;
  accent: string;
  accentSecondary: string;
  bgBase: string;
  bgGradient: string;
  glowColor: string;
  cardBg: string;
  cardBorder: string;
  candleBull: string;
  candleBear: string;
  wickColor: string;
  nodeGlow: string;
  waveColor1: string;
  waveColor2: string;
  packetColor: string;
}

export interface DynamicFxSettings {
  motionEnabled: boolean;
  interactionMode: 'magnetic' | 'ripple' | 'vortex';
  speed: 'zen' | 'fluid' | 'hyper';
  candlestickDensity: 'sparse' | 'balanced' | 'dense';
  cursorGlow: boolean;
  glowIntensity: 'soft' | 'radiant' | 'cyber';
  soundEnabled: boolean;
}

export interface PulseEvent {
  id: number;
  x: number;
  y: number;
  intensity: number;
  timestamp: number;
}
