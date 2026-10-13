import { MyComposition } from "./Composition";
import { PosterLightMotionV1Entry } from "./PosterLightMotionComposition";
import {
  LeedsManUtdEntry,
} from "./LeedsManUtdComposition";
import { LeedsManUtdTikTokEntry } from "./LeedsManUtdTikTokComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <LeedsManUtdEntry />
      <LeedsManUtdTikTokEntry />
      <PosterLightMotionV1Entry />
    </>
  );
};
