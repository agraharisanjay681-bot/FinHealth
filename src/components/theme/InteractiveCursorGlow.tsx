import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext.js';

export const InteractiveCursorGlow: React.FC = () => {
  const { themeConfig, fxSettings } = useTheme();
  const [pos, setPos] = useState({ x: -500, y: -500 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!fxSettings.cursorGlow) return;

    let rafId: number;
    let targetX = -500;
    let targetY = -500;
    let currentX = -500;
    let currentY = -500;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const loop = () => {
      // Smooth spring lag
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      setPos({ x: Math.round(currentX), y: Math.round(currentY) });
      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, [fxSettings.cursorGlow, isVisible]);

  if (!fxSettings.cursorGlow || !isVisible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed pointer-events-none transition-opacity duration-300"
      style={{
        zIndex: 1,
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: 'translate(-50%, -50%)',
        width: '420px',
        height: '420px',
        background: `radial-gradient(circle, ${themeConfig.glowColor} 0%, rgba(0,0,0,0) 70%)`,
        opacity: fxSettings.glowIntensity === 'cyber' ? 0.35 : fxSettings.glowIntensity === 'radiant' ? 0.22 : 0.12,
        mixBlendMode: 'screen',
      }}
    />
  );
};
