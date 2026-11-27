import React from "react";
import {
  AbsoluteFill,
  Composition,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const PosterLightMotion: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  const phase = (frame / 900) * Math.PI * 2;
  const blueX = Math.sin(phase) * width * 1.1;
  const redX = -blueX;

  const beam: React.CSSProperties = {
    position: "absolute",
    width: "125%",
    height: 12,
    borderRadius: 999,
    filter: "blur(7px)",
    pointerEvents: "none",
    mixBlendMode: "screen",
  };

  const movingBeams = [
    {
      left: "26%",
      color: "0,105,255",
      angle: Math.sin(phase) * 12 - 8,
    },
    {
      left: "35%",
      color: "160,65,255",
      angle: Math.sin(phase + 2.1) * 12,
    },
    {
      left: "44%",
      color: "255,35,65",
      angle: Math.sin(phase + 4.2) * 12 + 8,
    },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "#030712", overflow: "hidden" }}>
      <Img
        src={staticFile("assets/stadiums/old-trafford-stadium.png")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(24px) brightness(0.38) saturate(1.25)",
          transform: "scale(1.15)",
        }}
      />

      <Img
        src={staticFile("assets/stadiums/old-trafford-stadium.png")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />

      {movingBeams.map((item, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: item.left,
            top: "44%",
            width: "30%",
            height: "22%",
            transformOrigin: "50% 0%",
            transform: `rotate(${item.angle}deg)`,
            clipPath: "polygon(48% 0, 52% 0, 100% 100%, 0 100%)",
            background: `linear-gradient(180deg, rgba(${item.color},0.02), rgba(${item.color},0.18) 55%, rgba(${item.color},0.72) 100%)`,
            filter: "blur(5px)",
            mixBlendMode: "screen",
            pointerEvents: "none",
          }}
        />
      ))}

      <div
        style={{
          ...beam,
          top: "18%",
          left: 0,
          height: 10,
          background:
            "linear-gradient(90deg, transparent 5%, rgba(0,90,255,0.1) 25%, rgba(45,145,255,0.95) 48%, rgba(100,190,255,0.65) 52%, transparent 78%)",
          boxShadow: "0 0 24px 8px rgba(0,110,255,0.32)",
          transform: `translateX(${blueX}px) rotate(-17deg)`,
          opacity: 0.9,
        }}
      />

      <div
        style={{
          ...beam,
          top: "74%",
          left: 0,
          height: 9,
          background:
            "linear-gradient(90deg, transparent 8%, rgba(255,25,55,0.12) 28%, rgba(255,40,65,0.95) 50%, rgba(255,125,135,0.6) 55%, transparent 82%)",
          boxShadow: "0 0 24px 8px rgba(255,20,55,0.3)",
          transform: `translateX(${redX}px) rotate(-17deg)`,
          opacity: 0.85,
        }}
      />
    </AbsoluteFill>
  );
};

export const PosterLightMotionV1Entry: React.FC = () => (
  <Composition
    id="PosterLightMotionV1"
    component={PosterLightMotion}
    durationInFrames={900}
    fps={30}
    width={1080}
    height={1920}
  />
);
