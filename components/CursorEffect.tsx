import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CursorEffect: React.FC = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isVisible, setIsVisible] = useState(false);
  const isVisibleRef = useRef(false);

  // Smooth spring animation for the trailer
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      // Use ref to avoid re-registering on every render
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }
    };

    const handleMouseEnter = () => { isVisibleRef.current = true; setIsVisible(true); };
    const handleMouseLeave = () => { isVisibleRef.current = false; setIsVisible(false); };

    // IMPORTANT: passive:true lets browser know this handler won't preventDefault()
    // so the browser can scroll without waiting for JS to return — key for jank-free scrolling
    window.addEventListener('mousemove', moveCursor, { passive: true });
    document.body.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    document.body.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY]); // removed isVisible from deps — breaks only on mount/unmount

  return (
    <>
      {/* Main Cursor Dot */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-cyan-400 rounded-full mix-blend-screen pointer-events-none z-[10000]"
        style={{
          translateX: cursorX,
          translateY: cursorY,
          opacity: isVisible ? 1 : 0,
        }}
      />
      {/* Trailing Ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-cyan-500/50 rounded-full mix-blend-screen pointer-events-none z-[9999]"
        style={{
          translateX: cursorXSpring,
          translateY: cursorYSpring,
          left: -10, // Offset to center the larger ring
          top: -10,
          opacity: isVisible ? 1 : 0,
        }}
      />
    </>
  );
};

export default CursorEffect;