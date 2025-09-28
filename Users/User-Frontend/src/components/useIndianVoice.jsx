// useIndianFemaleVoice.js
import { useEffect, useState } from "react";

export function useIndianFemaleVoice() {
  const [voice, setVoice] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const pickIndianFemaleVoice = () => {
      const voices = window.speechSynthesis.getVoices();

      // Filter voices for Indian locales or India/Hindi mentions in the name
      const indianVoices = voices.filter((v) => {
        const lang = (v.lang || "").toLowerCase();
        const name = (v.name || "").toLowerCase();
        return (
          lang.startsWith("en-in") ||
          lang.startsWith("hi-in") ||
          /india|hindi|हिन्दी|भारतीय/.test(name)
        );
      });

      // Prefer female-coded Indian voices by name hints (API has no gender field)
      // Heuristic examples: "Heera" (Windows en-IN female), or names containing "Female"
      const femaleHint = indianVoices.find((v) => {
        const n = (v.name || "").toLowerCase();
        return /female/.test(n) || /heera/.test(n);
      });

      setVoice(femaleHint || indianVoices[0] || null);
    };

    // Initial attempt and then react to asynchronous population
    try {
      pickIndianFemaleVoice();
    } catch {}

    window.speechSynthesis.addEventListener("voiceschanged", pickIndianFemaleVoice);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", pickIndianFemaleVoice);
    };
  }, []);

  return voice;
}
