import React from "react";
import {
  AbsoluteFill,
  Composition,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type LightTheme = {
  id: string;
  stadiumImage: string;
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
    stadiumImage: "assets/stadiums/stadium1.png",
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
    stadiumImage: "assets/stadiums/stadium2.png",
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
    stadiumImage: "assets/stadiums/stadium3.png",
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

  crimsonBlack: {
    id: "PosterLightMotionCrimsonBlack",
    stadiumImage: "assets/stadiums/stadium4.png",
    background: "#100306",
    glowLeft: "255,35,55",
    glowRight: "110,0,15",
    beamTop: "linear-gradient(90deg, transparent 5%, rgba(180,0,25,0.1) 25%, rgba(255,35,55,0.95) 48%, rgba(255,170,175,0.65) 52%, transparent 78%)",
    beamBottom: "linear-gradient(90deg, transparent 8%, rgba(100,0,15,0.12) 28%, rgba(210,15,35,0.95) 50%, rgba(255,120,130,0.6) 55%, transparent 82%)",
    beamTopShadow: "0 0 24px 8px rgba(255,35,55,0.32)",
    beamBottomShadow: "0 0 24px 8px rgba(180,0,25,0.3)",
    highlight: "linear-gradient(112deg, transparent 20%, rgba(255,35,55,0.16) 43%, rgba(255,255,255,0.08) 49%, transparent 67%)",
    edgeTint: "linear-gradient(180deg, rgba(255,35,55,0.15), transparent 22%, transparent 72%, rgba(110,0,15,0.12))",
    edgeShadow: "inset 0 0 70px rgba(0,0,0,0.3), inset 0 0 55px rgba(255,35,55,0.12)",
  },
  iceBlueWhite: {
    id: "PosterLightMotionIceBlueWhite",
    stadiumImage: "assets/stadiums/stadium5.png",
    background: "#030b16",
    glowLeft: "70,175,255",
    glowRight: "220,245,255",
    beamTop: "linear-gradient(90deg, transparent 5%, rgba(40,145,255,0.1) 25%, rgba(75,190,255,0.95) 48%, rgba(220,250,255,0.75) 52%, transparent 78%)",
    beamBottom: "linear-gradient(90deg, transparent 8%, rgba(150,220,255,0.12) 28%, rgba(235,250,255,0.95) 50%, rgba(255,255,255,0.7) 55%, transparent 82%)",
    beamTopShadow: "0 0 24px 8px rgba(70,175,255,0.32)",
    beamBottomShadow: "0 0 24px 8px rgba(225,245,255,0.3)",
    highlight: "linear-gradient(112deg, transparent 20%, rgba(80,180,255,0.16) 43%, rgba(255,255,255,0.12) 49%, transparent 67%)",
    edgeTint: "linear-gradient(180deg, rgba(70,175,255,0.15), transparent 22%, transparent 72%, rgba(225,245,255,0.12))",
    edgeShadow: "inset 0 0 70px rgba(0,0,0,0.3), inset 0 0 55px rgba(70,175,255,0.12)",
  },
  orangeBlack: {
    id: "PosterLightMotionOrangeBlack",
    stadiumImage: "assets/stadiums/stadium6.png",
    background: "#100803",
    glowLeft: "255,105,20",
    glowRight: "255,190,65",
    beamTop: "linear-gradient(90deg, transparent 5%, rgba(230,75,0,0.1) 25%, rgba(255,105,20,0.95) 48%, rgba(255,215,145,0.65) 52%, transparent 78%)",
    beamBottom: "linear-gradient(90deg, transparent 8%, rgba(200,75,0,0.12) 28%, rgba(255,155,35,0.95) 50%, rgba(255,225,165,0.6) 55%, transparent 82%)",
    beamTopShadow: "0 0 24px 8px rgba(255,105,20,0.32)",
    beamBottomShadow: "0 0 24px 8px rgba(220,90,10,0.3)",
    highlight: "linear-gradient(112deg, transparent 20%, rgba(255,115,25,0.16) 43%, rgba(255,255,255,0.08) 49%, transparent 67%)",
    edgeTint: "linear-gradient(180deg, rgba(255,105,20,0.15), transparent 22%, transparent 72%, rgba(180,65,0,0.12))",
    edgeShadow: "inset 0 0 70px rgba(0,0,0,0.3), inset 0 0 55px rgba(255,105,20,0.12)",
  },
  emeraldGold: {
    id: "PosterLightMotionEmeraldGold",
    stadiumImage: "assets/stadiums/stadium1.png",
    background: "#03100b",
    glowLeft: "0,210,125",
    glowRight: "255,190,55",
    beamTop: "linear-gradient(90deg, transparent 5%, rgba(0,150,85,0.1) 25%, rgba(0,220,130,0.95) 48%, rgba(170,255,215,0.65) 52%, transparent 78%)",
    beamBottom: "linear-gradient(90deg, transparent 8%, rgba(190,125,20,0.12) 28%, rgba(255,195,55,0.95) 50%, rgba(255,240,175,0.6) 55%, transparent 82%)",
    beamTopShadow: "0 0 24px 8px rgba(0,210,125,0.32)",
    beamBottomShadow: "0 0 24px 8px rgba(255,190,55,0.3)",
    highlight: "linear-gradient(112deg, transparent 20%, rgba(0,210,125,0.16) 43%, rgba(255,255,255,0.08) 49%, transparent 67%)",
    edgeTint: "linear-gradient(180deg, rgba(0,210,125,0.15), transparent 22%, transparent 72%, rgba(255,190,55,0.12))",
    edgeShadow: "inset 0 0 70px rgba(0,0,0,0.3), inset 0 0 55px rgba(0,210,125,0.12)",
  },
  neonPinkPurple: {
    id: "PosterLightMotionNeonPinkPurple",
    stadiumImage: "assets/stadiums/stadium2.png",
    background: "#100518",
    glowLeft: "255,45,190",
    glowRight: "125,45,255",
    beamTop: "linear-gradient(90deg, transparent 5%, rgba(255,35,180,0.1) 25%, rgba(255,65,205,0.95) 48%, rgba(255,190,240,0.65) 52%, transparent 78%)",
    beamBottom: "linear-gradient(90deg, transparent 8%, rgba(100,20,210,0.12) 28%, rgba(145,65,255,0.95) 50%, rgba(220,180,255,0.6) 55%, transparent 82%)",
    beamTopShadow: "0 0 24px 8px rgba(255,45,190,0.32)",
    beamBottomShadow: "0 0 24px 8px rgba(125,45,255,0.3)",
    highlight: "linear-gradient(112deg, transparent 20%, rgba(255,45,190,0.16) 43%, rgba(255,255,255,0.08) 49%, transparent 67%)",
    edgeTint: "linear-gradient(180deg, rgba(255,45,190,0.15), transparent 22%, transparent 72%, rgba(125,45,255,0.12))",
    edgeShadow: "inset 0 0 70px rgba(0,0,0,0.3), inset 0 0 55px rgba(255,45,190,0.12)",
  },
  silverBlue: {
    id: "PosterLightMotionSilverBlue",
    stadiumImage: "assets/stadiums/stadium3.png",
    background: "#070c14",
    glowLeft: "175,195,220",
    glowRight: "45,115,210",
    beamTop: "linear-gradient(90deg, transparent 5%, rgba(150,175,205,0.1) 25%, rgba(210,225,245,0.95) 48%, rgba(255,255,255,0.7) 52%, transparent 78%)",
    beamBottom: "linear-gradient(90deg, transparent 8%, rgba(25,75,160,0.12) 28%, rgba(55,125,235,0.95) 50%, rgba(175,210,255,0.6) 55%, transparent 82%)",
    beamTopShadow: "0 0 24px 8px rgba(175,195,220,0.32)",
    beamBottomShadow: "0 0 24px 8px rgba(45,115,210,0.3)",
    highlight: "linear-gradient(112deg, transparent 20%, rgba(175,195,220,0.16) 43%, rgba(255,255,255,0.1) 49%, transparent 67%)",
    edgeTint: "linear-gradient(180deg, rgba(175,195,220,0.15), transparent 22%, transparent 72%, rgba(45,115,210,0.12))",
    edgeShadow: "inset 0 0 70px rgba(0,0,0,0.3), inset 0 0 55px rgba(175,195,220,0.12)",
  },
};

const PosterLightMotionVariant: React.FC<{ theme: LightTheme }> = ({ theme }) => {
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
    <AbsoluteFill style={{ backgroundColor: theme.background, overflow: "hidden" }}>
      <Img
        src={staticFile(theme.stadiumImage)}
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
        src={staticFile(theme.stadiumImage)}
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
            const color = lamp.side === "left" ? theme.glowLeft : theme.glowRight;
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

export const PosterLightMotionCrimsonBlackEntry: React.FC = () => (
  <Composition id={themes.crimsonBlack.id} component={PosterLightMotionVariant}
    defaultProps={{ theme: themes.crimsonBlack }} durationInFrames={900} fps={30} width={1080} height={1920} />
);

export const PosterLightMotionIceBlueWhiteEntry: React.FC = () => (
  <Composition id={themes.iceBlueWhite.id} component={PosterLightMotionVariant}
    defaultProps={{ theme: themes.iceBlueWhite }} durationInFrames={900} fps={30} width={1080} height={1920} />
);

export const PosterLightMotionOrangeBlackEntry: React.FC = () => (
  <Composition id={themes.orangeBlack.id} component={PosterLightMotionVariant}
    defaultProps={{ theme: themes.orangeBlack }} durationInFrames={900} fps={30} width={1080} height={1920} />
);

export const PosterLightMotionEmeraldGoldEntry: React.FC = () => (
  <Composition id={themes.emeraldGold.id} component={PosterLightMotionVariant}
    defaultProps={{ theme: themes.emeraldGold }} durationInFrames={900} fps={30} width={1080} height={1920} />
);

export const PosterLightMotionNeonPinkPurpleEntry: React.FC = () => (
  <Composition id={themes.neonPinkPurple.id} component={PosterLightMotionVariant}
    defaultProps={{ theme: themes.neonPinkPurple }} durationInFrames={900} fps={30} width={1080} height={1920} />
);

export const PosterLightMotionSilverBlueEntry: React.FC = () => (
  <Composition id={themes.silverBlue.id} component={PosterLightMotionVariant}
    defaultProps={{ theme: themes.silverBlue }} durationInFrames={900} fps={30} width={1080} height={1920} />
);
