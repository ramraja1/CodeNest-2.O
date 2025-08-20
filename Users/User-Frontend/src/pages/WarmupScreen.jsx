// src/WarmupScreen.jsx
import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

const tipsSequence = [
  [
    "Compiling contests…",
    "Fetching problem statements…",
    "Waking up Render backend…"
  ],
  [
    "Optimizing leaderboards…",
    "Just one more coffee ☕",
    "Checking plagiarism detectors…"
  ],
  [
    "Generating personalized challenges…",
    "Aligning stars for your success…",
    "Fueling your coding superpowers…"
  ],
  [
    "Brewing fresh problem sets...",
    "Sharpening your logic skills...",
    "Loading fun and surprises..."
  ]
];

const barCount = 5;

export default function WarmupScreen() {
  const [tipIndex, setTipIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const controls = useAnimation();

  // Cycle through tipsSequence every 2.5 seconds with fade animation
  useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
    const interval = setInterval(() => {
      controls.start({ opacity: 0, y: 10 }).then(() => {
        setLineIndex((prev) => {
          const nextLine = prev + 1;
          if (nextLine >= tipsSequence[tipIndex].length) {
            setTipIndex((prevTip) => (prevTip + 1) % tipsSequence.length);
            return 0;
          }
          return nextLine;
        });
        controls.start({ opacity: 1, y: 0 });
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [tipIndex, controls]);

  // Animated bars loader variants (bouncing scaleY)
  const barVariants = {
    animate: (i) => ({
      scaleY: [1, 2.8, 1],
      transition: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 1.6,
        delay: i * 0.12,
        ease: "easeInOut"
      }
    })
  };

  // Fun motivational quotes to appear below tips, changing every 5 seconds
  const motivational = [
    "Every keystroke brings you closer to victory.",
    "Code hard, shine harder.",
    "Your next bug fix is a masterstroke in disguise.",
    "Curiosity is the code to success.",
  ];
  const [motivateIndex, setMotivateIndex] = useState(0);
  const motivateControls = useAnimation();

  useEffect(() => {
    motivateControls.start({ opacity: 1, y: 0 });
    const motInterval = setInterval(() => {
      motivateControls.start({ opacity: 0, y: 10 }).then(() => {
        setMotivateIndex((prev) => (prev + 1) % motivational.length);
        motivateControls.start({ opacity: 1, y: 0 });
      });
    }, 5000);
    return () => clearInterval(motInterval);
  }, [motivateControls]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white font-sans text-gray-900 relative overflow-hidden px-6">
      
      {/* Animated bars loader */}
      <div className="flex space-x-2 mb-14">
        {[...Array(barCount)].map((_, i) => (
          <motion.div
            key={i}
            className="w-4 h-14 bg-gray-700 rounded-sm origin-bottom"
            custom={i}
            variants={barVariants}
            animate="animate"
          />
        ))}
      </div>

      {/* Animated tip with fade and slight slide */}
      <motion.p
        className="text-2xl font-semibold text-gray-800 select-none text-center max-w-md leading-relaxed"
        aria-live="polite"
        animate={controls}
        initial={{ opacity: 1, y: 0 }}
      >
        {tipsSequence[tipIndex][lineIndex]}
      </motion.p>

      {/* Motivational quote below tips */}
      <motion.p 
        className="mt-8 text-sm text-gray-500 italic text-center max-w-xs select-none"
        animate={motivateControls}
        initial={{ opacity: 1, y: 0 }}
        aria-live="polite"
      >
        {motivational[motivateIndex]}
      </motion.p>

      {/* Soft floating blurred shapes for ambiance */}
      <motion.div
        className="absolute top-16 left-1/4 w-40 h-40 rounded-full bg-gradient-to-tr from-gray-200 to-transparent opacity-20 filter blur-2xl animate-[float_6s_ease-in-out_infinite_alternate]"
        style={{ zIndex: -1 }}
      />
      <motion.div
        className="absolute bottom-24 right-1/3 w-56 h-56 rounded-full bg-gradient-to-br from-gray-300 to-transparent opacity-15 filter blur-3xl animate-[float_8s_ease-in-out_infinite_alternate]"
        style={{ zIndex: -1 }}
      />
    </div>
  );
}
