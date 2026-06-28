import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Check } from 'lucide-react';

interface FramerConfettiProps {
  sectionName: string | null;
  onClose: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
  angle: number;
  duration: number;
}

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#EF4444', '#14B8A6'];

export const FramerConfetti: React.FC<FramerConfettiProps> = ({ sectionName, onClose }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!sectionName) {
      setParticles([]);
      return;
    }

    // Generate random custom particles
    const newParticles: Particle[] = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage across screen width
      y: -20 - Math.random() * 50, // start above screen
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 6,
      delay: Math.random() * 0.4,
      angle: Math.random() * 360,
      duration: Math.random() * 2.5 + 2.5
    }));
    setParticles(newParticles);

    // Auto close notification after 7 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 7000);

    return () => clearTimeout(timer);
  }, [sectionName, onClose]);

  if (!sectionName) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* 1. Falling particles using framer-motion */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ 
              opacity: 0, 
              y: `${p.y}vh`, 
              x: `${p.x}vw`, 
              rotate: 0 
            }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              y: '105vh',
              x: `${p.x + (Math.random() * 20 - 10)}vw`,
              rotate: p.angle + 720
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: 'easeOut',
              times: [0, 0.1, 0.8, 1]
            }}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: Math.random() > 0.4 ? '50%' : '2px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          />
        ))}
      </AnimatePresence>

      {/* 2. Sleek Celebration Dialog card (Bottom-Right, non-intrusive) */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="absolute bottom-6 right-6 pointer-events-auto max-w-sm w-full bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded-xl p-4 shadow-xl flex items-start space-x-3.5"
        >
          <div className="h-10 w-10 shrink-0 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center">
              Section Complete!
            </span>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white mt-1">
              IPMAT {sectionName} is 100% finished
            </h4>
            <p className="text-[10px] text-neutral-500 mt-1 leading-normal">
              Outstanding work! Every chapter has been reviewed and worksheets completed. Keep up the high focus.
            </p>
          </div>

          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer p-0.5"
          >
            <Check className="h-4 w-4" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
