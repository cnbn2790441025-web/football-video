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
  const pulse = 0.72 + (Math.sin(frame * 0.075) + 1) * 0.14;
  const leftSweep = Math.sin(frame * 0.025) * 7;
  const rightSweep = Math.sin(frame * 0.025 + 1.4) * 7;


  const phase = (frame / 900) * Math.PI * 2;
  const blueX = Math.sin(phase) * width * 1.1;
  const redX = -blueX;
  const rainbowX = Math.sin(phase + 1.2) * width * 0.85;
  const rainbowX2 = Math.cos(phase + 2.4) * width * 0.85;

  const beam: React.CSSProperties = {
    position: "absolute",
    width: "125%",
    height: 12,
    borderRadius: 999,
    filter: "blur(7px)",
    pointerEvents: "none",
    mixBlendMode: "screen",
  };


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

      <>
        <div
          style={{
            ...beam,
            top: "34%",
            left: 0,
            height: 9,
            background:
              "linear-gradient(90deg, transparent 4%, rgba(0,210,255,0.9) 18%, rgba(80,70,255,0.95) 32%, rgba(210,45,255,0.95) 48%, rgba(255,65,145,0.95) 64%, rgba(255,170,35,0.85) 78%, transparent 96%)",
            boxShadow:
              "0 0 22px 7px rgba(140,65,255,0.3), 0 0 28px 5px rgba(0,210,255,0.22)",
            transform: `translateX(${rainbowX}px) rotate(-17deg)`,
            opacity: 0.95,
          }}
        />
        <div
          style={{
            ...beam,
            top: "60%",
            left: 0,
            height: 9,
            background:
              "linear-gradient(90deg, transparent 3%, rgba(255,40,120,0.9) 17%, rgba(255,105,35,0.95) 31%, rgba(255,220,40,0.95) 46%, rgba(70,255,170,0.9) 62%, rgba(0,190,255,0.95) 78%, transparent 96%)",
            boxShadow:
              "0 0 22px 7px rgba(255,70,140,0.28), 0 0 28px 5px rgba(70,255,170,0.2)",
            transform: `translateX(${rainbowX2}px) rotate(-17deg)`,
            opacity: 0.95,
          }}
        />
      </>

      {/* Left floodlight: anchored beam sweeping through the sky */}
      <div
        style={{
          position: "absolute",
          left: "5%",
          top: "34.5%",
          width: "48%",
          height: "31%",
          transformOrigin: "0% 50%",
          transform: `rotate(${-34 + leftSweep}deg)`,
          clipPath: "polygon(0 43%, 100% 4%, 100% 96%, 0 57%)",
          background: "linear-gradient(90deg, rgba(225,245,255,0.48), rgba(120,195,255,0.16) 58%, transparent)",
          filter: "blur(13px)",
          opacity: pulse,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "5%",
          top: "34.5%",
          width: "43%",
          height: 5,
          transformOrigin: "0% 50%",
          transform: `rotate(${-34 + leftSweep}deg)`,
          background: "linear-gradient(90deg, rgba(255,255,255,0.9), rgba(160,215,255,0.38), transparent)",
          filter: "blur(4px)",
          boxShadow: "0 0 18px 5px rgba(175,220,255,0.25)",
          opacity: pulse,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      {/* Right floodlight: mirrored sky beam */}
      <div
        style={{
          position: "absolute",
          right: "5%",
          top: "34.5%",
          width: "48%",
          height: "31%",
          transformOrigin: "100% 50%",
          transform: `rotate(${214 - rightSweep}deg)`,
          clipPath: "polygon(0 4%, 100% 43%, 100% 57%, 0 96%)",
          background: "linear-gradient(270deg, rgba(225,245,255,0.48), rgba(120,195,255,0.16) 58%, transparent)",
          filter: "blur(13px)",
          opacity: pulse,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "5%",
          top: "34.5%",
          width: "43%",
          height: 5,
          transformOrigin: "100% 50%",
          transform: `rotate(${214 - rightSweep}deg)`,
          background: "linear-gradient(270deg, rgba(255,255,255,0.9), rgba(160,215,255,0.38), transparent)",
          filter: "blur(4px)",
          boxShadow: "0 0 18px 5px rgba(175,220,255,0.25)",
          opacity: pulse,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

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
