import { MyComposition } from "./Composition";
import { PosterLightMotionV1Entry } from "./PosterLightMotionComposition";
import {
  LeedsManUtdEntry,
} from "./LeedsManUtdComposition";
import { LeedsManUtdTikTokEntry } from "./LeedsManUtdTikTokComposition";
import { LiverpoolBrightonEntry } from "./LiverpoolBrightonComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <LeedsManUtdEntry />
      <LiverpoolBrightonEntry />
      <LeedsManUtdTikTokEntry />
      <PosterLightMotionV1Entry />
    </>
  );
};
