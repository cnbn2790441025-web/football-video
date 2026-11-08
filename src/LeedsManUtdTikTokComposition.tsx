import React from "react";
import { AbsoluteFill, Composition, Sequence } from "remotion";
import matchData from "./matchData.json";
import {
  LiverpoolBrightonComposition,
  PlayerCueGraphic,
  type CueItem,
} from "./LiverpoolBrightonComposition";

const BASE_DURATION = 1655;
const PLAYER_DURATION = 150;

export const LeedsManUtdTikTokComposition: React.FC = () => {
  const homeCue: Extract<CueItem, { kind: "player" }> = {
    captionIndex: 1,
    kind: "player",
    team: "home",
    name: matchData.homePlayerName,
    image: matchData.homePlayer,
  };

  const awayCue: Extract<CueItem, { kind: "player" }> = {
    captionIndex: 1,
    kind: "player",
    team: "away",
    name: matchData.awayPlayerName,
    image: matchData.awayPlayer,
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#030710" }}>
      <Sequence durationInFrames={BASE_DURATION}>
        <LiverpoolBrightonComposition />
      </Sequence>

      <Sequence from={BASE_DURATION} durationInFrames={PLAYER_DURATION * 2}>
        <Sequence durationInFrames={PLAYER_DURATION}>
          <PlayerCueGraphic cue={homeCue} duration={PLAYER_DURATION} />
        </Sequence>

        <Sequence from={PLAYER_DURATION} durationInFrames={PLAYER_DURATION}>
          <PlayerCueGraphic cue={awayCue} duration={PLAYER_DURATION} />
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
