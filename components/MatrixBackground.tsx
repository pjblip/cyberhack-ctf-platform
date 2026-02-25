import { useEffect, useRef, memo } from 'react';

const MatrixBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    let width = canvas.width;
    let height = canvas.height;

    // Character set
    const katakana = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const symbols = '<>[]{}/*-+=!?^&%$#@';
    const alphabet = (katakana + latin + nums + symbols).split('');

    // Single mid-layer only (was 3 layers — biggest CPU win)
    const FONT_SIZE = 14;
    const SPEED_FACTOR = 0.8;
    const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899'];

    interface Drop {
      x: number;
      y: number;
      speed: number;
      color: string;
      text: string;
    }

    let drops: Drop[] = [];

    const initDrops = () => {
      const columns = Math.ceil(width / FONT_SIZE);
      drops = [];
      for (let i = 0; i < columns; i++) {
        drops.push({
          x: i * FONT_SIZE,
          y: Math.random() * -1000,
          speed: (Math.random() * 1.5 + 0.5) * SPEED_FACTOR,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          text: alphabet[Math.floor(Math.random() * alphabet.length)],
        });
      }
    };

    initDrops();

    // Pre-set font once — avoid per-frame font layout cost
    ctx.font = `bold ${FONT_SIZE}px monospace`;

    const draw = () => {
      // Trail fade
      ctx.fillStyle = 'rgba(2, 6, 23, 0.15)';
      ctx.fillRect(0, 0, width, height);

      // Restore font in case canvas was resized
      ctx.font = `bold ${FONT_SIZE}px monospace`;
      ctx.globalAlpha = 0.7;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const drop of drops) {
        // Randomly flip character
        if (Math.random() < 0.02) {
          drop.text = alphabet[Math.floor(Math.random() * alphabet.length)];
        }

        // Manhattan distance (NO Math.sqrt — much faster)
        const isNearMouse = Math.abs(mx - drop.x) + Math.abs(my - drop.y) < 170;

        // Render — NO shadowBlur (was the #1 GPU bottleneck)
        if (isNearMouse) {
          ctx.fillStyle = '#cffafe'; // Cyan-100 highlight near mouse
        } else {
          ctx.fillStyle = drop.color;
        }

        ctx.fillText(drop.text, drop.x, drop.y);

        // Move
        drop.y += isNearMouse ? drop.speed * 0.5 : drop.speed;

        // Reset
        if (drop.y > height && Math.random() > 0.98) {
          drop.y = -50;
          drop.speed = (Math.random() * 1.5 + 0.5) * SPEED_FACTOR;
          drop.color = COLORS[Math.floor(Math.random() * COLORS.length)];
          drop.text = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }

      ctx.globalAlpha = 1.0;
    };

    let animationId: number;
    let lastFrameTime = 0;
    const TARGET_FPS = 20; // Was 30 — imperceptible difference, 33% less work
    const FRAME_INTERVAL = 1000 / TARGET_FPS;
    let isVisible = true;

    const animate = (currentTime: number) => {
      if (!isVisible) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      const elapsed = currentTime - lastFrameTime;
      if (elapsed > FRAME_INTERVAL) {
        lastFrameTime = currentTime - (elapsed % FRAME_INTERVAL);
        draw();
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      width = canvas.width;
      height = canvas.height;
      ctx.font = `bold ${FONT_SIZE}px monospace`;
      initDrops();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="matrix-canvas fixed top-0 left-0 w-screen h-screen pointer-events-none"
    />
  );
};

// Fix 7: MatrixBackground has no props — memo prevents ALL parent re-renders from causing a redraw
export default memo(MatrixBackground);