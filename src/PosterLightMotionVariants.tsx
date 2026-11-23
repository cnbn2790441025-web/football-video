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

type LightTheme = {
  id: string;
  background: string;
  glowLeft: string;
  glowRight: string;
  beamTop: string;
  beamBottom: string;
  beamTopShadow: string;
  beamBottomShadow: string;
  highlight: string;
  edgeTint: string;
  edgeShadow: string;
};

const themes: Record<string, LightTheme> = {
  purpleCyan: {
    id: "PosterLightMotionPurpleCyan",
    background: "#070318",
    glowLeft: "150,45,255",
    glowRight: "0,220,255",
    beamTop:
      "linear-gradient(90deg, transparent 5%, rgba(130,55,255,0.1) 25%, rgba(165,90,255,0.95) 48%, rgba(210,170,255,0.65) 52%, transparent 78%)",
    beamBottom:
      "linear-gradient(90deg, transparent 8%, rgba(0,190,255,0.12) 28%, rgba(0,220,255,0.95) 50%, rgba(145,245,255,0.6) 55%, transparent 82%)",
    beamTopShadow: "0 0 24px 8px rgba(145,55,255,0.32)",
    beamBottomShadow: "0 0 24px 8px rgba(0,210,255,0.3)",
    highlight:
      "linear-gradient(112deg, transparent 20%, rgba(145,75,255,0.16) 43%, rgba(255,255,255,0.08) 49%, transparent 67%)",
    edgeTint:
      "linear-gradient(180deg, rgba(125,65,255,0.15), transparent 22%, transparent 72%, rgba(0,205,255,0.12))",
    edgeShadow: "inset 0 0 70px rgba(0,0,0,0.3), inset 0 0 55px rgba(125,65,255,0.12)",
  },
  goldWhite: {
    id: "PosterLightMotionGoldWhite",
    background: "#090704",
    glowLeft: "255,175,35",
    glowRight: "255,245,215",
    beamTop:
      "linear-gradient(90deg, transparent 5%, rgba(255,170,35,0.1) 25%, rgba(255,190,65,0.95) 48%, rgba(255,225,155,0.65) 52%, transparent 78%)",
    beamBottom:
      "linear-gradient(90deg, transparent 8%, rgba(255,240,205,0.12) 28%, rgba(255,248,225,0.95) 50%, rgba(255,255,245,0.6) 55%, transparent 82%)",
    beamTopShadow: "0 0 24px 8px rgba(255,175,45,0.32)",
    beamBottomShadow: "0 0 24px 8px rgba(255,245,220,0.3)",
    highlight:
      "linear-gradient(112deg, transparent 20%, rgba(255,180,55,0.16) 43%, rgba(255,255,255,0.1) 49%, transparent 67%)",
    edgeTint:
      "linear-gradient(180deg, rgba(255,185,65,0.15), transparent 22%, transparent 72%, rgba(255,245,220,0.12))",
    edgeShadow: "inset 0 0 70px rgba(0,0,0,0.3), inset 0 0 55px rgba(255,185,65,0.12)",
  },
  greenAmber: {
    id: "PosterLightMotionGreenAmber",
    background: "#020b07",
    glowLeft: "0,205,115",
    glowRight: "255,145,25",
    beamTop:
      "linear-gradient(90deg, transparent 5%, rgba(0,180,100,0.1) 25%, rgba(0,220,125,0.95) 48%, rgba(135,255,195,0.65) 52%, transparent 78%)",
    beamBottom:
      "linear-gradient(90deg, transparent 8%, rgba(255,135,20,0.12) 28%, rgba(255,160,35,0.95) 50%, rgba(255,215,135,0.6) 55%, transparent 82%)",
    beamTopShadow: "0 0 24px 8px rgba(0,205,115,0.32)",
    beamBottomShadow: "0 0 24px 8px rgba(255,145,25,0.3)",
    highlight:
      "linear-gradient(112deg, transparent 20%, rgba(0,195,110,0.16) 43%, rgba(255,255,255,0.08) 49%, transparent 67%)",
    edgeTint:
      "linear-gradient(180deg, rgba(0,185,105,0.15), transparent 22%, transparent 72%, rgba(255,145,25,0.12))",
    edgeShadow: "inset 0 0 70px rgba(0,0,0,0.3), inset 0 0 55px rgba(0,185,105,0.12)",
  },
};

const PosterLightMotionVariant: React.FC<{ theme: LightTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  const cycle = frame % 300;
  const blueX = interpolate(
    cycle,
    [0, 150, 300],
    [-width * 1.1, width * 1.1, -width * 1.1],
    { easing: Easing.inOut(Easing.ease) },
  );
  const redX = interpolate(
    cycle,
    [0, 150, 300],
    [width * 1.1, -width * 1.1, width * 1.1],
    { easing: Easing.inOut(Easing.ease) },
  );
  const pulse = interpolate(
    frame % 180,
    [0, 45, 90, 135, 180],
    [0.35, 0.75, 0.4, 0.7, 0.35],
  );

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
    <AbsoluteFill style={{ backgroundColor: theme.background, overflow: "hidden" }}>
      <Img
        src={staticFile("assets/poster-light-motion-v1.png")}
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
          background: `radial-gradient(ellipse at 12% 24%, rgba(${theme.glowLeft},${pulse * 0.65}), transparent 48%), radial-gradient(ellipse at 88% 72%, rgba(${theme.glowRight},${pulse * 0.5}), transparent 48%)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
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
      <div
        style={{
          ...beam,
          top: "18%",
          left: 0,
          height: 10,
          background: theme.beamTop,
          boxShadow: theme.beamTopShadow,
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
          background: theme.beamBottom,
          boxShadow: theme.beamBottomShadow,
          transform: `translateX(${redX}px) rotate(-17deg)`,
          opacity: 0.85,
        }}
      />
      <AbsoluteFill
        style={{
          background: theme.highlight,
          transform: `translateX(${blueX * 0.55}px)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background: theme.edgeTint,
          boxShadow: theme.edgeShadow,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

export const PosterLightMotionPurpleCyanEntry: React.FC = () => (
  <Composition
    id={themes.purpleCyan.id}
    component={PosterLightMotionVariant}
    defaultProps={{ theme: themes.purpleCyan }}
    durationInFrames={900}
    fps={30}
    width={1080}
    height={1920}
  />
);

export const PosterLightMotionGoldWhiteEntry: React.FC = () => (
  <Composition
    id={themes.goldWhite.id}
    component={PosterLightMotionVariant}
    defaultProps={{ theme: themes.goldWhite }}
    durationInFrames={900}
    fps={30}
    width={1080}
    height={1920}
  />
);

export const PosterLightMotionGreenAmberEntry: React.FC = () => (
  <Composition
    id={themes.greenAmber.id}
    component={PosterLightMotionVariant}
    defaultProps={{ theme: themes.greenAmber }}
    durationInFrames={900}
    fps={30}
    width={1080}
    height={1920}
  />
);
