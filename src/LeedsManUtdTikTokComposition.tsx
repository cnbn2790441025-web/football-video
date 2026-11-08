import React from "react";
import {
  AbsoluteFill,
  Composition,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import matchData from "./matchData.json";
import { LiverpoolBrightonComposition } from "./LiverpoolBrightonComposition";

const BASE_DURATION = 1655;
const PLAYER_DURATION = 150;

const TikTokFullScreenPlayer: React.FC<{
  team: "home" | "away";
}> = ({ team }) => {
  const frame = useCurrentFrame();
  const isHome = team === "home";

  const image = isHome ? matchData.homePlayer : matchData.awayPlayer;
  const name = isHome ? matchData.homePlayerName : matchData.awayPlayerName;
  const role = isHome ? matchData.homePlayerRole : matchData.awayPlayerRole;
  const trait = isHome ? matchData.homePlayerTrait : matchData.awayPlayerTrait;
  const teamName = isHome ? matchData.homeTeam : matchData.awayTeam;
  const shortName = isHome ? matchData.homeShort : matchData.awayShort;

  const opacity = interpolate(
    frame,
    [0, 12, PLAYER_DURATION - 12, PLAYER_DURATION],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp" }
  );

  const zoom = interpolate(
    frame,
    [0, PLAYER_DURATION],
    [1, 1.035],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 35%, #183047 0%, #071321 55%, #02060d 100%)",
        opacity,
        overflow: "hidden",
      }}
    >
      {image ? (
        <Img
          src={staticFile(image)}
          style={{
            position: "absolute",
            width: 1080,
            height: 1530,
            bottom: 120,
            left: 0,
            objectFit: "contain",
            transform: `scale(${zoom})`,
            transformOrigin: "center bottom",
          }}
        />
      ) : null}

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          padding: "0 64px 105px",
          background:
            "linear-gradient(180deg, transparent 48%, rgba(2,6,13,0.35) 68%, rgba(2,6,13,0.96) 100%)",
        }}
      >
        <div
          style={{
            color: "#F7D900",
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: 5,
            marginBottom: 14,
          }}
        >
          KEY PLAYER
        </div>

        <div
          style={{
            color: "#FFFFFF",
            fontSize: 54,
            fontWeight: 900,
            lineHeight: 1.05,
            textTransform: "uppercase",
            textShadow: "0 4px 18px rgba(0,0,0,0.8)",
          }}
        >
          {name}
        </div>

        <div
          style={{
            color: "#F7D900",
            fontSize: 25,
            fontWeight: 800,
            marginTop: 16,
          }}
        >
          {role || "PLAYER"}
        </div>

        <div
          style={{
            color: "#FFFFFF",
            fontSize: 21,
            fontWeight: 700,
            marginTop: 10,
          }}
        >
          {trait || ""}
        </div>

        <div
          style={{
            color: "#B8C6D4",
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: 3,
            marginTop: 14,
          }}
        >
          {shortName || teamName}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const LeedsManUtdTikTokComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#030710" }}>
      <Sequence durationInFrames={BASE_DURATION}>
        <LiverpoolBrightonComposition />
      </Sequence>

      <Sequence
        from={BASE_DURATION}
        durationInFrames={PLAYER_DURATION * 2}
      >
        <Sequence durationInFrames={PLAYER_DURATION}>
          <TikTokFullScreenPlayer team="home" />
        </Sequence>

        <Sequence from={PLAYER_DURATION} durationInFrames={PLAYER_DURATION}>
          <TikTokFullScreenPlayer team="away" />
        </Sequence>
      </Sequence>
    </AbsoluteFill>
  );
};

export const LeedsManUtdTikTokEntry: React.FC = () => (
  <Composition
    id="LeedsManUtdTikTok"
    component={LeedsManUtdTikTokComposition}
    durationInFrames={BASE_DURATION + PLAYER_DURATION * 2}
    fps={30}
    width={1080}
    height={1920}
  />
);
