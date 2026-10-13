import React from "react";
import {
  AbsoluteFill,
  Composition,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { LeedsManUtdComposition } from "./LeedsManUtdComposition";

const OutroGraphic: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15, 270, 290], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rise = interpolate(frame, [0, 20], [35, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoLeft = interpolate(frame, [0, 32], [-320, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoRight = interpolate(frame, [0, 32], [320, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoScale = interpolate(frame, [0, 32, 45], [0.65, 1.08, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 35%, #183b32 0%, #071610 45%, #020609 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        opacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "9% 7%",
          border: "3px solid rgba(255,255,255,0.8)",
          borderRadius: 12,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "7%",
          right: "7%",
          top: "50%",
          borderTop: "2px solid rgba(255,255,255,0.7)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 270,
          height: 270,
          border: "2px solid rgba(255,255,255,0.7)",
          borderRadius: "50%",
          top: "calc(50% - 135px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "48%",
          height: "16%",
          border: "2px solid rgba(255,255,255,0.65)",
          top: "9%",
          left: "26%",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "48%",
          height: "16%",
          border: "2px solid rgba(255,255,255,0.65)",
          bottom: "9%",
          left: "26%",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "8%",
          width: 250,
          height: 250,
          borderRadius: "50%",
          border: "7px solid #f7d46a",
          background: "radial-gradient(circle, #244c3d, #071610 72%)",
          boxShadow: `0 0 ${35 + pulse * 20}px rgba(247,212,106,${0.25 + pulse * 0.3})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateX(${logoLeft}px) scale(${logoScale})`,
          zIndex: 3,
        }}
      >
        <div style={{ textAlign: "center", fontWeight: 900 }}>
          <div style={{ fontSize: 34, color: "#f7d46a" }}>LUFC</div>
          <div style={{ fontSize: 18, marginTop: 8 }}>LEEDS</div>
          <div style={{ fontSize: 18 }}>UNITED</div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "8%",
          width: 250,
          height: 250,
          borderRadius: "50%",
          border: "7px solid #d9d9e2",
          background: "radial-gradient(circle, #7e1824, #19070b 72%)",
          boxShadow: `0 0 ${35 + pulse * 20}px rgba(220,35,55,${0.25 + pulse * 0.3})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateX(${logoRight}px) scale(${logoScale})`,
          zIndex: 3,
        }}
      >
        <div style={{ textAlign: "center", fontWeight: 900 }}>
          <div style={{ fontSize: 34, color: "#ffffff" }}>MUFC</div>
          <div style={{ fontSize: 18, marginTop: 8 }}>MANCHESTER</div>
          <div style={{ fontSize: 18 }}>UNITED</div>
        </div>
      </div>
      <div
        style={{
          zIndex: 2,
          width: "86%",
          textAlign: "center",
          transform: `translateY(${rise + 85}px)`,
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 8,
            color: "#d8e4dc",
            fontWeight: 700,
          }}
        >
          MATCH PREDICTION
        </div>

        <div
          style={{
            fontSize: 100,
            fontWeight: 900,
            marginTop: 8,
            color: "#ffffff",
            textShadow: "0 0 35px rgba(247,212,106,0.5)",
          }}
        >
          1 — 2
        </div>

        <div
          style={{
            marginTop: 55,
            padding: "24px 18px",
            background: "#f7d46a",
            color: "#071610",
            borderRadius: 14,
            fontSize: 34,
            fontWeight: 900,
          }}
        >
          WHAT'S YOUR PREDICTION?
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const LeedsManUtdTikTokComposition: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#020609" }}>
    <Sequence  durationInFrames={1660}>
      <LeedsManUtdComposition />
    </Sequence>
    <Sequence from={1660} durationInFrames={290}>
      <OutroGraphic />
    </Sequence>
  </AbsoluteFill>
);

export const LeedsManUtdTikTokEntry: React.FC = () => (
  <Composition
    id="LeedsManUtdTikTok"
    component={LeedsManUtdTikTokComposition}
    durationInFrames={1950}
    fps={30}
    width={1080}
    height={1920}
  />
);
