import React from 'react';
import { createPortal } from 'react-dom';
import { 
  Zap, 
  Sparkles, 
  X, 
  Play, 
  Pause, 
  Sliders, 
  Activity, 
  Radio, 
  Compass, 
  Sun, 
  Moon, 
  RotateCcw,
  Check,
  MousePointer2
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.js';
import { THEME_PRESETS } from '../../config/themePresets.js';
import type { ThemeId } from '../../types/theme.js';

export const DynamicThemeHUD: React.FC = () => {
  const {
    theme,
    setTheme,
    fxSettings,
    updateFxSettings,
    triggerPulse,
    isHudOpen,
    setIsHudOpen,
    themeConfig,
  } = useTheme();

  const themesList: Array<{ id: ThemeId; icon: string; previewGrad: string }> = [
    {
      id: 'quantum',
      icon: '🌌',
      previewGrad: 'from-cyan-400 via-blue-500 to-purple-600',
    },
    {
      id: 'cyber',
      icon: '⚡',
      previewGrad: 'from-emerald-400 via-teal-500 to-emerald-700',
    },
    {
      id: 'solar',
      icon: '🔥',
      previewGrad: 'from-amber-400 via-orange-500 to-rose-600',
    },
    {
      id: 'dark',
      icon: '💎',
      previewGrad: 'from-sky-400 via-slate-600 to-slate-900',
    },
    {
      id: 'light',
      icon: '☀️',
      previewGrad: 'from-sky-500 via-indigo-400 to-amber-300',
    },
  ];

  const handlePulseTest = (e: React.MouseEvent) => {
    // Send ripple from button coordinates outward
    const rect = e.currentTarget.getBoundingClientRect();
    triggerPulse(rect.left + rect.width / 2, rect.top + rect.height / 2, 1.8);
  };

  const resetDefaults = () => {
    updateFxSettings({
      motionEnabled: true,
      interactionMode: 'magnetic',
      speed: 'fluid',
      candlestickDensity: 'balanced',
      cursorGlow: true,
      glowIntensity: 'radiant',
      soundEnabled: false,
    });
  };

  return (
    <>
      {/* 1. Floating Quick-Access Launcher Button (Bottom-Left) */}
      <div className="fixed bottom-5 left-5 z-40">
        <button
          id="dynamic-theme-hud-toggle"
          onClick={() => setIsHudOpen(!isHudOpen)}
          className="group relative flex items-center gap-2.5 px-3.5 py-2 rounded-full border shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: 'rgba(8, 12, 28, 0.85)',
            borderColor: themeConfig.cardBorder,
            boxShadow: `0 8px 30px -4px ${themeConfig.glowColor}`,
          }}
          title="Open Interactive Theme & FX Studio"
        >
          {/* Pulsing beacon */}
          <span className="relative flex h-2.5 w-2.5">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: themeConfig.primary }}
            />
            <span
              className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{ backgroundColor: themeConfig.primary }}
            />
          </span>

          <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5 font-display">
            <Sparkles className="w-3.5 h-3.5" style={{ color: themeConfig.primary }} />
            <span>Theme Studio</span>
          </span>

          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded-full uppercase font-semibold text-slate-950"
            style={{ backgroundColor: themeConfig.primary }}
          >
            {theme}
          </span>
        </button>
      </div>

      {/* 2. Interactive Theme Studio Drawer / Modal */}
      {isHudOpen && typeof document !== 'undefined' && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
          onClick={() => setIsHudOpen(false)}
        >
          <div
            className="hud-element w-full max-w-lg rounded-3xl border p-5 sm:p-6 shadow-2xl backdrop-blur-3xl transition-all duration-300 space-y-5 max-h-[90vh] overflow-y-auto my-auto relative z-10 animate-fade-in"
            style={{
              backgroundColor: theme === 'light' ? '#ffffff' : '#080d24',
              borderColor: themeConfig.cardBorder,
              boxShadow: `0 20px 60px -10px ${themeConfig.glowColor}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-md"
                  style={{
                    backgroundColor: `${themeConfig.primary}20`,
                    color: themeConfig.primary,
                    border: `1px solid ${themeConfig.primary}40`,
                  }}
                >
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white font-display flex items-center gap-2">
                    Dynamic Theme & FX Studio
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase text-slate-950"
                      style={{ backgroundColor: themeConfig.primary }}
                    >
                      Interactive
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Control 3D candlestick waveforms, cursor physics, and palettes
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsHudOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Theme Presets Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  Colorways & Aesthetic Presets
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Active: {THEME_PRESETS[theme].name}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {themesList.map((item) => {
                  const preset = THEME_PRESETS[item.id];
                  const isActive = theme === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setTheme(item.id)}
                      className={`relative text-left p-3 rounded-2xl border transition-all duration-200 group overflow-hidden ${
                        isActive
                          ? 'border-white/80 shadow-lg scale-[1.02]'
                          : 'border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10'
                      }`}
                      style={{
                        backgroundColor: isActive ? 'rgba(255,255,255,0.08)' : undefined,
                        borderColor: isActive ? preset.primary : undefined,
                      }}
                    >
                      {/* Gradient accent top strip */}
                      <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${item.previewGrad} mb-2`} />

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1">
                          <span>{item.icon}</span>
                          <span>{preset.name}</span>
                        </span>
                        {isActive && (
                          <Check className="w-3.5 h-3.5" style={{ color: preset.primary }} />
                        )}
                      </div>

                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {preset.tagline}
                      </p>

                      {/* Color swatches */}
                      <div className="flex items-center gap-1 mt-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: preset.primary }}
                          title="Primary"
                        />
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: preset.accent }}
                          title="Accent"
                        />
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: preset.candleBull }}
                          title="Bull Candle"
                        />
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: preset.candleBear }}
                          title="Bear Candle"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Physics & Motion Controls */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Dynamic Interactive Wave Mechanics
              </span>

              {/* 1. Motion & Cursor Halo Toggle Row */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() =>
                    updateFxSettings({ motionEnabled: !fxSettings.motionEnabled })
                  }
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    fxSettings.motionEnabled
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {fxSettings.motionEnabled ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    <span>Wave Motion</span>
                  </span>
                  <span className="text-[10px] font-mono uppercase">
                    {fxSettings.motionEnabled ? 'ON' : 'PAUSED'}
                  </span>
                </button>

                <button
                  onClick={() =>
                    updateFxSettings({ cursorGlow: !fxSettings.cursorGlow })
                  }
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    fxSettings.cursorGlow
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <MousePointer2 className="w-3.5 h-3.5" />
                    <span>Cursor Aura</span>
                  </span>
                  <span className="text-[10px] font-mono uppercase">
                    {fxSettings.cursorGlow ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>

              {/* 2. Interaction Mode Selector */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1">
                    <Compass className="w-3 h-3 text-cyan-400" />
                    Mouse Interaction Physics:
                  </span>
                  <span className="text-cyan-400 font-mono capitalize">
                    {fxSettings.interactionMode}
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['magnetic', 'ripple', 'vortex'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateFxSettings({ interactionMode: mode })}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all text-center capitalize ${
                        fxSettings.interactionMode === mode
                          ? 'bg-white/20 border-white text-white shadow-xs'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode === 'magnetic' && '🧲 Gravity'}
                      {mode === 'ripple' && '🌊 Ripple'}
                      {mode === 'vortex' && '🌀 Vortex'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Speed & Density Controls */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Market Flow Speed
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['zen', 'fluid', 'hyper'] as const).map((spd) => (
                      <button
                        key={spd}
                        onClick={() => updateFxSettings({ speed: spd })}
                        className={`py-1 rounded-lg text-[10px] font-bold border capitalize transition-all ${
                          fxSettings.speed === spd
                            ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                            : 'bg-white/5 border-white/10 text-slate-400'
                        }`}
                      >
                        {spd}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Candle Density
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['sparse', 'balanced', 'dense'] as const).map((dens) => (
                      <button
                        key={dens}
                        onClick={() => updateFxSettings({ candlestickDensity: dens })}
                        className={`py-1 rounded-lg text-[10px] font-bold border capitalize transition-all ${
                          fxSettings.candlestickDensity === dens
                            ? 'bg-purple-500/25 border-purple-400 text-purple-200'
                            : 'bg-white/5 border-white/10 text-slate-400'
                        }`}
                      >
                        {dens}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Glow Intensity */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between mb-1">
                  <span>Neon Glow Intensity</span>
                  <span className="text-cyan-400 font-mono capitalize">
                    {fxSettings.glowIntensity}
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['soft', 'radiant', 'cyber'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => updateFxSettings({ glowIntensity: lvl })}
                      className={`py-1 px-2 rounded-xl text-xs font-semibold border capitalize transition-all ${
                        fxSettings.glowIntensity === lvl
                          ? 'bg-white/20 border-white text-white'
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      {lvl === 'soft' && '✨ Soft'}
                      {lvl === 'radiant' && '🌟 Radiant'}
                      {lvl === 'cyber' && '⚡ Overdrive'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons: Trigger Shockwave Pulse & Reset */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={resetDefaults}
                className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                title="Reset to default theme physics"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset FX</span>
              </button>

              <button
                type="button"
                onClick={handlePulseTest}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: themeConfig.primary,
                  boxShadow: `0 0 20px ${themeConfig.glowColor}`,
                }}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Simulate Market Pulse</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
