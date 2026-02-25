import { useEffect, useRef } from 'react';
import { useMotionValue, useSpring, motion } from 'framer-motion';

const CursorEffect: React.FC = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Fix 4: Replaced useState(isVisible) with refs — no React re-renders on mousemove
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    let visible = false;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!visible) {
        visible = true;
        // Set opacity directly via DOM ref — no React state, no re-render
        if (dotRef.current) dotRef.current.style.opacity = '1';
        if (ringRef.current) ringRef.current.style.opacity = '1';
      }
    };

    const handleMouseLeave = () => {
      visible = false;
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
    };

    const handleMouseEnter = () => {
      visible = true;
      if (dotRef.current) dotRef.current.style.opacity = '1';
      if (ringRef.current) ringRef.current.style.opacity = '1';
    };

    // Stable listener — no state changes means deps array is clean
    window.addEventListener('mousemove', moveCursor);
    document.body.addEventListener('mouseenter', handleMouseEnter);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
    // Empty deps array — listener is stable, never re-added
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Main Cursor Dot */}
      <motion.div
        ref={dotRef}
        className="fixed top-0 left-0 w-3 h-3 bg-cyan-400 rounded-full mix-blend-screen pointer-events-none z-[10000]"
        style={{
          translateX: cursorX,
          translateY: cursorY,
          opacity: 0,
        }}
      />
      {/* Trailing Ring */}
      <motion.div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 border border-cyan-500/50 rounded-full mix-blend-screen pointer-events-none z-[9999]"
        style={{
          translateX: cursorXSpring,
          translateY: cursorYSpring,
          left: -10,
          top: -10,
          opacity: 0,
        }}
      />
    </>
  );
};

export default CursorEffect;