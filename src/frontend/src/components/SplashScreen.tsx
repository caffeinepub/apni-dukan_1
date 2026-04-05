import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const textTimer = setTimeout(() => setShowText(true), 3000);
    const navTimer = setTimeout(() => onFinish(), 7000);
    return () => {
      clearTimeout(textTimer);
      clearTimeout(navTimer);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        <img
          src="/assets/img-20260403-wa0000-019d5212-163d-7239-b20a-489c5dd03af6.jpg"
          alt="Apni Dukan Logo"
          className="object-contain"
          style={{ height: 120, width: 120 }}
        />
        <AnimatePresence>
          {showText && (
            <motion.p
              key="brand-text"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-3xl font-bold tracking-wide text-gray-800"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Apni Dukan
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
