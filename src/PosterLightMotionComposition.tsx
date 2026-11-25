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
  const pulse = 0.55 + 0.2 * Math.sin(phase * 2 - Math.PI / 2);
  const leftSweepAngle = Math.sin(phase) * 11;
  const rightSweepAngle = -Math.sin(phase) * 11;

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
        src={staticFile("assets/stadiums/stadium1.png")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(24px) brightness(0.38) saturate(1.25)",
          transform: "scale(1.15)",
        }}
      />

      <AbsoluteFill
        style={{
          background:
            `radial-gradient(ellipse at 12% 24%, rgba(0,105,255,${pulse * 0.65}), transparent 48%), radial-gradient(ellipse at 88% 72%, rgba(255,20,55,${pulse * 0.5}), transparent 48%)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <Img
        src={staticFile("assets/stadiums/stadium1.png")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />

      {[
            { side: "left", x: 5, y: 23 },
            { side: "left", x: 12, y: 35 },
            { side: "left", x: 19, y: 47 },
            { side: "right", x: 95, y: 23 },
            { side: "right", x: 88, y: 35 },
            { side: "right", x: 81, y: 47 },
          ].map((lamp, index) => {
            const angle = Math.sin(phase + index * 0.72) * 24;
            const color = lamp.side === "left" ? "0,105,255" : "255,20,55";
            const isLeft = lamp.side === "left";
            return (
              <div
                key={`lamp-beam-${index}`}
                style={{
                  position: "absolute",
                  top: `${lamp.y}%`,
                  left: isLeft ? `${lamp.x}%` : undefined,
                  right: isLeft ? undefined : `${100 - lamp.x}%`,
width: "55%",
height: "52%",
                  background: `linear-gradient(180deg, rgba(${color},0.62), rgba(${color},0.24) 58%, transparent)`,
                  clipPath: isLeft
                    ? "polygon(0 0, 100% 100%, 0 100%)"
                    : "polygon(100% 0, 100% 100%, 0 100%)",
                  filter: "blur(8px)",
                  transform: `rotate(${isLeft ? angle : -angle}deg)`,
                  transformOrigin: isLeft ? "0% 0%" : "100% 0%",
                  mixBlendMode: "screen",
                  pointerEvents: "none",
                }}
              />
            );
          })}
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

      <AbsoluteFill
        style={{
          background:
            `linear-gradient(112deg, transparent 20%, rgba(25,115,255,${pulse * 0.16}) 43%, rgba(255,255,255,${pulse * 0.08}) 49%, transparent 67%)`,
          transform: `translateX(${blueX * 0.55}px)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(30,100,255,0.15), transparent 22%, transparent 72%, rgba(255,25,50,0.12))",
          boxShadow:
            "inset 0 0 70px rgba(0,0,0,0.3), inset 0 0 55px rgba(35,105,255,0.12)",
          pointerEvents: "none",
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
