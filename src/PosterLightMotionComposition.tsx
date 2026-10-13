import React from "react";
import {
  AbsoluteFill,
  Composition,
  Img,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const PosterLightMotion: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  const blueX = interpolate(frame, [0, 899], [-width * 0.8, width * 0.9], {
    easing: Easing.inOut(Easing.ease),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const redX = interpolate(frame, [0, 899], [width * 0.9, -width * 0.8], {
    easing: Easing.inOut(Easing.ease),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glow = interpolate(frame, [0, 225, 450, 675, 899], [0.16, 0.3, 0.18, 0.28, 0.16]);

  const streakBase: React.CSSProperties = {
    position: "absolute",
    width: "85%",
    height: 5,
    borderRadius: 999,
    filter: "blur(5px)",
    pointerEvents: "none",
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#050914", overflow: "hidden" }}>
      <Img
        src={staticFile("assets/poster-light-motion-v1.png")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(30px) brightness(0.28)",
          transform: "scale(1.12)",
        }}
      />

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 15% 30%, rgba(0,100,255,0.22), transparent 48%), radial-gradient(ellipse at 85% 70%, rgba(255,25,45,0.18), transparent 48%)",
          opacity: glow,
        }}
      />

      <Img
        src={staticFile("assets/poster-light-motion-v1.png")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(115deg, transparent 30%, rgba(30,110,255,0.08) 48%, transparent 65%)",
          transform: `translateX(${blueX}px)`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          ...streakBase,
          top: "17%",
          left: 0,
          background:
            "linear-gradient(90deg, transparent, rgba(35,130,255,0.06), rgba(55,150,255,0.7), rgba(35,130,255,0.06), transparent)",
          transform: `translateX(${blueX}px) rotate(-17deg)`,
          opacity: 0.55,
        }}
      />

      <div
        style={{
          ...streakBase,
          top: "76%",
          right: 0,
          background:
            "linear-gradient(90deg, transparent, rgba(255,35,55,0.05), rgba(255,45,65,0.65), rgba(255,35,55,0.05), transparent)",
          transform: `translateX(${redX}px) rotate(-17deg)`,
          opacity: 0.48,
        }}
      />

      <AbsoluteFill
        style={{
          boxShadow:
            "inset 0 0 90px rgba(0,0,0,0.42), inset 0 0 35px rgba(40,100,255,0.08)",
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
