import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  delay: number;
}

const COLORS = [
  'hsl(234 89% 64%)',   // primary
  'hsl(160 84% 39%)',   // success
  'hsl(38 92% 50%)',    // warning
  'hsl(280 68% 60%)',   // purple
  'hsl(0 84% 60%)',     // red
  'hsl(200 89% 64%)',   // cyan
];

export function ConfettiEffect({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        rotation: Math.random() * 720 - 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 8 + 4,
        delay: Math.random() * 0.5,
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: `${p.x}vw`, y: '-5vh', rotate: 0, opacity: 1 }}
              animate={{ y: '110vh', rotate: p.rotation, opacity: [1, 1, 0.8, 0] }}
              transition={{ duration: 2.5 + Math.random(), delay: p.delay, ease: 'easeIn' }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.size * 0.6,
                backgroundColor: p.color,
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
