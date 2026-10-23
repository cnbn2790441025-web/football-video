import React from "react";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useCurrentFrame,
  interpolate,
  interpolateColors,
  Easing,
} from "remotion";
import captions from "./activeCaptions.json";

const FPS = 30;

type Caption = {
  start: number;
  end: number;
  text: string;
};

const SubtitleStyle: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 7, 15, 24], [0, 1, 1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const scale = interpolate(frame, [0, 12], [0.96, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const glow = 0.35 + Math.sin(frame / 12) * 0.12;
  const accent = interpolate(Math.sin(frame / 18), [-1, 1], [0, 1]);
  const borderColor =
    `rgba(255, ${Math.round(190 + accent * 65)}, ` +
    `${Math.round(30 + accent * 30)}, 0.8)`;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 300,
        left: 65,
        right: 65,
        padding: "16px 22px",
        backgroundColor: "rgba(5, 8, 18, 0.86)",
        borderRadius: 14,
        border: `2px solid ${borderColor}`,
        color: interpolateColors(
          frame % 240,
          [0, 80, 160, 240],
          ["#FFFFFF", "#FFD84D", "#55C8FF", "#FFFFFF"],
        ),
        fontFamily: "Noto Sans Myanmar",
        fontSize: 42,
        fontWeight: 700,
        lineHeight: 1.5,
        textAlign: "center",
        opacity,
        transform: `scale(${scale})`,
        textShadow:
          `0 2px 3px rgba(0,0,0,0.95), ` +
          `0 0 10px rgba(255,190,30,${glow})`,
        boxShadow: `0 0 18px rgba(255,190,30,${glow * 0.35})`,
      }}
    >
      {text}
    </div>
  );
};

export const SubtitleOverlay: React.FC = () => (
  <AbsoluteFill
    style={{
      justifyContent: "flex-end",
      alignItems: "center",
      pointerEvents: "none",
    }}
  >
    <style>{`
      @font-face {
        font-family: "Noto Sans Myanmar";
        src: url("${staticFile("fonts/NotoSansMyanmar-Regular.woff2")}") format("woff2");
        font-style: normal;
        font-weight: 400;
        font-display: block;
      }
      @font-face {
        font-family: "Noto Sans Myanmar";
        src: url("${staticFile("fonts/NotoSansMyanmar-Bold.woff2")}") format("woff2");
        font-style: normal;
        font-weight: 700;
        font-display: block;
      }
    `}</style>

    {(captions as Caption[]).map((caption, index) => {
      const from = Math.round(caption.start * FPS);
      const end = Math.round(caption.end * FPS);

      return (
        <Sequence
          key={`${index}-${caption.start}`}
          from={from}
          durationInFrames={Math.max(1, end - from)}
        >
          <SubtitleStyle text={caption.text} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
