import React from "react";
import robo from '/robo.png'
export default function RobotAssistant({ onClick, size = 64, className = "" }) {
  return (
    <button
      onClick={onClick}
      aria-label="AI Assistant"
      title="AI Assistant"
      className={`fixed bottom-6 right-6 z-50 cursor-pointer transition-transform hover:scale-110 active:scale-95 focus:outline-none ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={robo}
        alt="3D Robot Assistant"
        style={{ width: "100%", height: "100%" }}
        draggable={false}
      />
    </button>
  );
}
