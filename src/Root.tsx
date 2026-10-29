import { MyComposition } from "./Composition";
import { PosterLightMotionV1Entry } from "./PosterLightMotionComposition";
import {
  LeedsManUtdEntry,
} from "./LeedsManUtdComposition";
import { LeedsManUtdTikTokEntry } from "./LeedsManUtdTikTokComposition";
import { LiverpoolBrightonEntry, MatchPreviewEntry } from "./LiverpoolBrightonComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <LeedsManUtdEntry />
      <LiverpoolBrightonEntry />
      <MatchPreviewEntry />
      <LeedsManUtdTikTokEntry />
      <PosterLightMotionV1Entry />
    </>
  );
};
