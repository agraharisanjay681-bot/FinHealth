import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext.js';

interface Sparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  maxLife: number;
  life: number;
}

interface BokehOrb {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
}

interface DataPacket {
  waveIndex: number;
  t: number; // 0 to 1 along the wave
  speed: number;
  size: number;
  color: string;
}

export const InteractiveFinWaveCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { themeConfig, fxSettings, pulseEvent } = useTheme();

  // Keep references to dynamic settings for 60fps render loop
  const configRef = useRef(themeConfig);
  const fxRef = useRef(fxSettings);
  const pulseRef = useRef(pulseEvent);

  useEffect(() => {
    configRef.current = themeConfig;
  }, [themeConfig]);

  useEffect(() => {
    fxRef.current = fxSettings;
  }, [fxSettings]);

  useEffect(() => {
    pulseRef.current = pulseEvent;
  }, [pulseEvent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Mouse tracking with smooth lerp
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false,
      down: false,
    };

    // Active shockwaves from clicks/pulses
    const shockwaves: Array<{
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      speed: number;
      intensity: number;
      alpha: number;
    }> = [];

    // Sparkle particles
    const sparkles: Sparkle[] = [];

    // Background bokeh orbs for cinematic depth
    const bokehOrbs: BokehOrb[] = [];
    const initBokeh = (w: number, h: number) => {
      bokehOrbs.length = 0;
      const count = 14;
      for (let i = 0; i < count; i++) {
        bokehOrbs.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: 40 + Math.random() * 110,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          alpha: 0.04 + Math.random() * 0.12,
          color: i % 2 === 0 ? configRef.current.primary : configRef.current.accent,
        });
      }
    };

    // Data packets traveling along waves
    const packets: DataPacket[] = [];
    for (let i = 0; i < 8; i++) {
      packets.push({
        waveIndex: i % 3,
        t: Math.random(),
        speed: 0.0015 + Math.random() * 0.002,
        size: 2.5 + Math.random() * 2,
        color: i % 2 === 0 ? configRef.current.primary : '#ffffff',
      });
    }

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initBokeh(width, height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const spawnShockwave = (x: number, y: number, intensity: number = 1.0) => {
      shockwaves.push({
        x,
        y,
        radius: 5,
        maxRadius: Math.max(width, height) * 0.65,
        speed: 12 + intensity * 4,
        intensity,
        alpha: 0.85,
      });

      // Scatter sparkle particles
      const count = Math.round(18 * intensity);
      const colors = [
        configRef.current.primary,
        configRef.current.accent,
        configRef.current.candleBull,
        '#ffffff',
      ];

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 7 * intensity;
        sparkles.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          size: 1.5 + Math.random() * 3,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          maxLife: 30 + Math.random() * 35,
          life: 0,
        });
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      // Trigger shockwave at click coordinates
      spawnShockwave(e.clientX, e.clientY, 1.2);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    // Watch for externally triggered pulse events
    let lastHandledPulseId = 0;

    let time = 0;

    // Simulation render loop
    const render = () => {
      if (!ctx) return;

      // Check external pulse
      if (pulseRef.current && pulseRef.current.id !== lastHandledPulseId) {
        lastHandledPulseId = pulseRef.current.id;
        spawnShockwave(pulseRef.current.x, pulseRef.current.y, pulseRef.current.intensity);
      }

      const settings = fxRef.current;
      const config = configRef.current;

      // Speed factor
      const speedMultiplier =
        settings.speed === 'zen' ? 0.5 : settings.speed === 'hyper' ? 1.9 : 1.0;

      if (settings.motionEnabled) {
        time += 0.012 * speedMultiplier;
      }

      // Smooth mouse lerp
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.12;
        mouse.y += (mouse.targetY - mouse.y) * 0.12;
      } else {
        mouse.x += (-1000 - mouse.x) * 0.05;
        mouse.y += (-1000 - mouse.y) * 0.05;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle cinematic Bokeh Orbs
      for (let i = 0; i < bokehOrbs.length; i++) {
        const orb = bokehOrbs[i];
        if (settings.motionEnabled) {
          orb.x += orb.vx * speedMultiplier;
          orb.y += orb.vy * speedMultiplier;
          if (orb.x < -orb.radius) orb.x = width + orb.radius;
          if (orb.x > width + orb.radius) orb.x = -orb.radius;
          if (orb.y < -orb.radius) orb.y = height + orb.radius;
          if (orb.y > height + orb.radius) orb.y = -orb.radius;
        }

        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          orb.radius
        );
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, 'transparent');

        ctx.save();
        ctx.globalAlpha = orb.alpha;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 2. Multi-layer 3D Financial Candlestick Waves
      // We define 3 distinct wave depth planes (back, middle, foreground)
      const waveCount = 3;
      const stepSize = settings.candlestickDensity === 'dense' ? 32 : settings.candlestickDensity === 'sparse' ? 64 : 44;
      const totalSteps = Math.ceil(width / stepSize) + 2;

      // Candlestick nodes collection for neural mesh connection
      const candleNodes: Array<{
        x: number;
        y: number;
        layer: number;
        isBull: boolean;
        open: number;
        close: number;
        high: number;
        low: number;
      }> = [];

      for (let wIdx = 0; wIdx < waveCount; wIdx++) {
        // Depth perspective parameters
        // wIdx = 0 (deep background), 1 (midground focus), 2 (foreground ribbon)
        const depth = 0.55 + wIdx * 0.38;
        const baseY = height * (0.35 + wIdx * 0.22);
        const amplitude = (35 + wIdx * 25) * depth;
        const freq1 = 0.003 / depth;
        const freq2 = 0.007 / depth;
        const phaseOffset = wIdx * 1.8;
        const waveColor = wIdx === 1 ? config.primary : wIdx === 0 ? config.waveColor2 : config.accentSecondary;

        ctx.beginPath();
        let prevX = 0;
        let prevY = 0;

        const wavePoints: Array<{ x: number; y: number }> = [];

        for (let i = 0; i <= totalSteps; i++) {
          const x = i * stepSize;
          // Mathematical wave formulation with multiple harmonics
          let y =
            baseY +
            Math.sin(x * freq1 + time * 1.2 + phaseOffset) * amplitude +
            Math.cos(x * freq2 - time * 0.8 + phaseOffset) * (amplitude * 0.45);

          // Interactive Mouse reaction
          if (mouse.active) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const distSq = dx * dx + dy * dy;
            const mouseRadius = 260;
            const mouseRadiusSq = mouseRadius * mouseRadius;

            if (distSq < mouseRadiusSq) {
              const dist = Math.sqrt(distSq);
              const factor = (1 - dist / mouseRadius);

              if (settings.interactionMode === 'magnetic') {
                // Pull smoothly toward mouse
                y += (mouse.y - y) * factor * 0.35;
              } else if (settings.interactionMode === 'ripple') {
                // Undulate away with ripple harmonic
                y += Math.sin(dist * 0.05 - time * 6) * 28 * factor;
              } else {
                // Vortex offset
                y += Math.sin(time * 3 + dist * 0.03) * 18 * factor;
              }
            }
          }

          // Active shockwaves reaction
          for (let s = 0; s < shockwaves.length; s++) {
            const sw = shockwaves[s];
            const dx = x - sw.x;
            const dy = y - sw.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const distDiff = Math.abs(dist - sw.radius);
            if (distDiff < 80) {
              const pulseDistFactor = (1 - distDiff / 80) * sw.alpha * sw.intensity;
              y += Math.sin(distDiff * 0.08) * 24 * pulseDistFactor;
            }
          }

          wavePoints.push({ x, y });

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            // Smooth curve through midpoint
            const midX = (prevX + x) / 2;
            const midY = (prevY + y) / 2;
            ctx.quadraticCurveTo(prevX, prevY, midX, midY);
          }
          prevX = x;
          prevY = y;
        }

        // Draw the glowing baseline wave wire
        ctx.save();
        ctx.strokeStyle = waveColor;
        ctx.lineWidth = wIdx === 1 ? 2.0 : 1.2;
        ctx.globalAlpha = wIdx === 1 ? 0.65 : 0.35;
        if (settings.glowIntensity === 'cyber' || settings.glowIntensity === 'radiant') {
          ctx.shadowColor = waveColor;
          ctx.shadowBlur = wIdx === 1 ? 16 : 8;
        }
        ctx.stroke();
        ctx.restore();

        // 3. Render Candlestick Bars along the Midground (wIdx === 1) and Foreground (wIdx === 2)
        if (wIdx >= 1) {
          for (let p = 1; p < wavePoints.length - 1; p += (wIdx === 1 ? 1 : 2)) {
            const pt = wavePoints[p];
            const nextPt = wavePoints[p + 1] || pt;

            // Trend determination based on slope + sinusoidal variation
            const slope = nextPt.y - pt.y;
            const tickVar = Math.sin(p * 2.3 + time * 2.5);
            const isBull = slope < 0 ? tickVar > -0.2 : tickVar > 0.4;

            // Candle dimensions scaled to depth
            const candleW = (6 + wIdx * 2.5) * depth;
            const candleH = (12 + Math.abs(Math.sin(p * 1.7 + time * 1.5)) * 26) * depth;
            const wickH = candleH + (10 + Math.abs(Math.cos(p * 3.1 + time)) * 16) * depth;

            const candleColor = isBull ? config.candleBull : config.candleBear;
            const openY = pt.y - (isBull ? -candleH * 0.5 : candleH * 0.5);
            const closeY = pt.y + (isBull ? -candleH * 0.5 : candleH * 0.5);
            const topY = Math.min(openY, closeY);
            const bottomY = Math.max(openY, closeY);

            // Record node for mesh filaments
            if (p % 2 === 0) {
              candleNodes.push({
                x: pt.x,
                y: pt.y,
                layer: wIdx,
                isBull,
                open: openY,
                close: closeY,
                high: pt.y - wickH * 0.5,
                low: pt.y + wickH * 0.5,
              });
            }

            ctx.save();

            // Check proximity to cursor for reactive laser glow
            let isNearMouse = false;
            let mouseProximity = 0;
            if (mouse.active) {
              const mDist = Math.hypot(pt.x - mouse.x, pt.y - mouse.y);
              if (mDist < 180) {
                isNearMouse = true;
                mouseProximity = 1 - mDist / 180;
              }
            }

            // Draw Upper and Lower Wicks
            ctx.strokeStyle = isNearMouse ? '#ffffff' : candleColor;
            ctx.lineWidth = isNearMouse ? 1.5 : 1;
            ctx.globalAlpha = isNearMouse ? 0.95 : 0.6;
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y - wickH * 0.5);
            ctx.lineTo(pt.x, pt.y + wickH * 0.5);
            ctx.stroke();

            // Draw Candlestick Body
            ctx.fillStyle = isNearMouse ? '#ffffff' : candleColor;
            ctx.strokeStyle = candleColor;
            ctx.lineWidth = 1;
            ctx.globalAlpha = isNearMouse ? 0.95 : wIdx === 1 ? 0.8 : 0.55;

            if (settings.glowIntensity === 'cyber' || isNearMouse) {
              ctx.shadowColor = candleColor;
              ctx.shadowBlur = isNearMouse ? 24 : 12;
            }

            // Filled rounded candle body
            const bodyLeft = pt.x - candleW * 0.5;
            const bodyTop = topY;
            const bodyHeight = Math.max(4, bottomY - topY);

            ctx.beginPath();
            ctx.roundRect(bodyLeft, bodyTop, candleW, bodyHeight, 1.5);
            ctx.fill();
            ctx.stroke();

            // Glowing node accent point at center of candle
            ctx.beginPath();
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = isNearMouse ? 1.0 : 0.7;
            ctx.arc(pt.x, pt.y, isNearMouse ? 2.5 : 1.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
          }
        }
      }

      // 4. Neural Network Mesh Filaments (Connecting adjacent candlestick nodes)
      ctx.save();
      for (let a = 0; a < candleNodes.length; a++) {
        const nodeA = candleNodes[a];
        for (let b = a + 1; b < candleNodes.length; b++) {
          const nodeB = candleNodes[b];
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Connect nodes within dynamic distance threshold
          const threshold = nodeA.layer === nodeB.layer ? 95 : 65;
          if (dist < threshold) {
            const alpha = (1 - dist / threshold) * 0.35;
            ctx.strokeStyle = nodeA.isBull ? config.candleBull : config.accent;
            ctx.lineWidth = 0.8;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.stroke();
          }
        }

        // Connect nearby nodes to cursor if cursor is active (Reactive Laser Web!)
        if (mouse.active) {
          const mdx = nodeA.x - mouse.x;
          const mdy = nodeA.y - mouse.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mDist < 160) {
            const laserAlpha = (1 - mDist / 160) * 0.85;
            ctx.strokeStyle = config.primary;
            ctx.lineWidth = 1.2;
            ctx.globalAlpha = laserAlpha;
            ctx.shadowColor = config.primary;
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(nodeA.x, nodeA.y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // 5. High-Speed Luminous Data Packets (Surging along waves)
      if (settings.motionEnabled) {
        ctx.save();
        for (let p = 0; p < packets.length; p++) {
          const packet = packets[p];
          packet.t += packet.speed * speedMultiplier;
          if (packet.t > 1) packet.t = 0;

          const px = packet.t * width;
          const waveBaseY = height * (0.35 + packet.waveIndex * 0.22);
          const py =
            waveBaseY +
            Math.sin(px * 0.004 + time * 1.2 + packet.waveIndex * 1.8) * 45;

          ctx.fillStyle = packet.color;
          ctx.shadowColor = packet.color;
          ctx.shadowBlur = 16;
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.arc(px, py, packet.size, 0, Math.PI * 2);
          ctx.fill();

          // Packet tail streak
          ctx.strokeStyle = packet.color;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = 0.4;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px - 14 * speedMultiplier, py);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 6. Interactive Cursor Halo & Focus Rings
      if (mouse.active && settings.cursorGlow) {
        ctx.save();
        const cursorGlowGrad = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          130
        );
        cursorGlowGrad.addColorStop(0, config.glowColor);
        cursorGlowGrad.addColorStop(0.5, 'rgba(0, 245, 255, 0.08)');
        cursorGlowGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = cursorGlowGrad;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 130, 0, Math.PI * 2);
        ctx.fill();

        // High-tech reticle ring
        ctx.strokeStyle = config.primary;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 18 + Math.sin(time * 4) * 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      // 7. Shockwaves Update & Draw
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += sw.speed;
        sw.alpha -= 0.022;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(s, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = config.primary;
        ctx.lineWidth = 2.5 * sw.alpha;
        ctx.globalAlpha = sw.alpha * 0.7;
        ctx.shadowColor = config.primary;
        ctx.shadowBlur = 20;

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Secondary inner harmonic ring
        if (sw.radius > 30) {
          ctx.beginPath();
          ctx.strokeStyle = config.accent;
          ctx.lineWidth = 1.2 * sw.alpha;
          ctx.arc(sw.x, sw.y, sw.radius * 0.75, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 8. Sparkles Update & Draw
      for (let sp = sparkles.length - 1; sp >= 0; sp--) {
        const spark = sparkles[sp];
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vx *= 0.94;
        spark.vy *= 0.94;
        spark.life++;
        spark.alpha = 1 - spark.life / spark.maxLife;

        if (spark.life >= spark.maxLife) {
          sparkles.splice(sp, 1);
          continue;
        }

        ctx.save();
        ctx.fillStyle = spark.color;
        ctx.shadowColor = spark.color;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = spark.alpha;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size * spark.alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
    </div>
  );
};
