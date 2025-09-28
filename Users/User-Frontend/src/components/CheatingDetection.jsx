import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

export default function CheatingDetection() {
  const webcamRef = useRef(null);
  const [cheatingAlert, setCheatingAlert] = useState("");

  // Load face detection models
  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    };
    loadModels();
  }, []);

  // Check faces in interval
  useEffect(() => {
    const interval = setInterval(async () => {
      if (webcamRef.current) {
        const video = webcamRef.current.video;
        if (video && video.readyState === 4) {
          const detections = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions()
          );

          if (detections.length === 0) {
            setCheatingAlert("⚠️ No face detected. Please stay visible!");
          } else if (detections.length > 1) {
            setCheatingAlert("⚠️ Multiple faces detected! Cheating suspected.");
          } else {
            setCheatingAlert(""); // Normal
          }
        }
      }
    }, 3000); // check every 3 sec

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Webcam */}
      <Webcam
        ref={webcamRef}
        audio={false}
        className="w-48 h-36 rounded-lg border"
        videoConstraints={{
          width: 480,
          height: 360,
          facingMode: "user",
        }}
      />
      {/* Cheating alert */}
      {cheatingAlert && (
        <p className="text-red-600 font-bold mt-2">{cheatingAlert}</p>
      )}
    </div>
  );
}
