import { useEffect, useRef } from 'react';

/**
 * MatrixBackground — GPU-optimised canvas rain effect.
 *
 * Perf changes vs original:
 *  - Reduced from 3 parallax layers → 2 (cuts draw calls ~33%)
 *  - Removed per-drop Math.sqrt mouse distance (hot-path O(n) → O(1) approx box check)
 *  - shadowBlur now ONLY set on the infrequent glitch/head drops and batch-reset once per layer
 *  - Canvas is promoted to own GPU compositor layer via will-change: transform
 *  - Mouse interaction throttled to every 60ms (no need for per-frame mouse position update)
 *  - Fewer columns per layer (slightly wider font gaps) to keep drop count lower
 */
const MatrixBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    let width = canvas.width;
    let height = canvas.height;

    const katakana = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const alphabet = (katakana + latin + nums).split('');
    const alphaLen = alphabet.length;

    interface Drop {
      x: number;
      y: number;
      speed: number;
      color: string;
      text: string;
    }

    interface Layer {
      fontSize: number;
      drops: Drop[];
      speedFactor: number;
      colors: string[];
      opacity: number;
    }

    // 2 layers instead of 3 — keeps visuals while cutting draw calls
    const layers: Layer[] = [
      {
        fontSize: 12,
        drops: [],
        speedFactor: 0.6,
        colors: ['#083344', '#164e63', '#1e3a5f'],
        opacity: 0.4,
      },
      {
        fontSize: 16,
        drops: [],
        speedFactor: 1.2,
        colors: ['#06b6d4', '#8b5cf6', '#67e8f9'],
        opacity: 0.85,
      },
    ];

    const initLayers = () => {
      layers.forEach(layer => {
        const columns = Math.ceil(width / (layer.fontSize * 1.2)); // slightly wider gap = fewer drops
        layer.drops = Array.from({ length: columns }, (_, i) => ({
          x: i * layer.fontSize * 1.2,
          y: Math.random() * -height,
          speed: (Math.random() * 1.2 + 0.4) * layer.speedFactor,
          color: layer.colors[Math.floor(Math.random() * layer.colors.length)],
          text: alphabet[Math.floor(Math.random() * alphaLen)],
        }));
      });
    };

    initLayers();

    // Mouse proximity: cheap box-check instead of Math.sqrt per drop
    const MOUSE_RADIUS = 130;
    const isNearMouse = (x: number, y: number) => {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      return Math.abs(mx - x) < MOUSE_RADIUS && Math.abs(my - y) < MOUSE_RADIUS;
    };

    const draw = () => {
      // Trail fade — alpha:false canvas context lets us use fillRect for this cheaply
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(2, 6, 23, 0.18)';
      ctx.fillRect(0, 0, width, height);

      layers.forEach(layer => {
        ctx.font = `bold ${layer.fontSize}px monospace`;
        ctx.globalAlpha = layer.opacity;

        // Reset shadow once per layer (not per drop)
        ctx.shadowBlur = 0;

        layer.drops.forEach(drop => {
          // Random char flip (cheap comparison)
          if (Math.random() < 0.018) {
            drop.text = alphabet[Math.floor(Math.random() * alphaLen)];
          }

          const near = isNearMouse(drop.x, drop.y);
          const rnd = Math.random();

          if (rnd > 0.9985) {
            // Glitch: red flash — set shadow only here
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#ef4444';
            ctx.fillStyle = '#ef4444';
            ctx.fillText(drop.text, drop.x + (Math.random() * 4 - 2), drop.y);
            ctx.shadowBlur = 0; // reset immediately
          } else if (rnd > 0.994) {
            // Bright head
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ffffff';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(drop.text, drop.x, drop.y);
            ctx.shadowBlur = 0;
          } else if (near) {
            ctx.fillStyle = '#cffafe';
            ctx.fillText(drop.text, drop.x, drop.y);
          } else {
            ctx.fillStyle = drop.color;
            ctx.fillText(drop.text, drop.x, drop.y);
          }

          drop.y += near ? drop.speed * 0.5 : drop.speed;

          if (drop.y > height && Math.random() > 0.975) {
            drop.y = -Math.random() * 80;
            drop.speed = (Math.random() * 1.2 + 0.4) * layer.speedFactor;
            drop.color = layer.colors[Math.floor(Math.random() * layer.colors.length)];
          }
        });
      });

      ctx.globalAlpha = 1.0;
    };

    let animationId: number;
    let lastFrameTime = 0;
    // 24fps is imperceptible from 30fps for background rain but halves render CPU time
    const frameInterval = 1000 / 24;
    let isVisible = true;

    const animate = (currentTime: number) => {
      animationId = requestAnimationFrame(animate);
      if (!isVisible) return;
      const elapsed = currentTime - lastFrameTime;
      if (elapsed >= frameInterval) {
        lastFrameTime = currentTime - (elapsed % frameInterval);
        draw();
      }
    };

    animationId = requestAnimationFrame(animate);

    // Throttle resize with debounce to avoid repeated initLayers during drag
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        width = canvas.width;
        height = canvas.height;
        initLayers();
      }, 150);
    };

    // Throttle mouse events to ~60ms
    let mouseTick = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - mouseTick > 60) {
        mouseTick = now;
        mouseRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    // Pause animation when tab is hidden
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 pointer-events-none"
      style={{
        zIndex: 0,
        width: '100vw',
        height: '100vh',
        // Promote to own GPU compositor layer — stops canvas paints from affecting scroll layer
        willChange: 'transform',
        transform: 'translate3d(0,0,0)',
      }}
    />
  );
};

export default MatrixBackground;