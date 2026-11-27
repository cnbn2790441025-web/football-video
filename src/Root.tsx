import { MyComposition } from "./Composition";
import { WingOverloadEntry } from "./WingOverloadComposition";
import { OverlappingUnderlappingEntry } from "./OverlappingUnderlappingComposition";
import { ThroughBallAttackEntry } from "./ThroughBallComposition";
import { CutbackAttackEntry } from "./CutbackAttackComposition";
import { CounterAttackEntry } from "./CounterAttackComposition";
import { HighPressEntry } from "./HighPressComposition";
import { PosterLightMotionV1Entry } from "./PosterLightMotionComposition";
import {
  PosterLightMotionPurpleCyanEntry,
  PosterLightMotionGoldWhiteEntry,
  PosterLightMotionGreenAmberEntry,
  PosterLightMotionCrimsonBlackEntry,
  PosterLightMotionIceBlueWhiteEntry,
  PosterLightMotionOrangeBlackEntry,
  PosterLightMotionEmeraldGoldEntry,
  PosterLightMotionNeonPinkPurpleEntry,
  PosterLightMotionSilverBlueEntry,
} from "./PosterLightMotionVariants";
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
      <PosterLightMotionPurpleCyanEntry />
      <PosterLightMotionGoldWhiteEntry />
      <PosterLightMotionGreenAmberEntry />
      <PosterLightMotionCrimsonBlackEntry />
      <PosterLightMotionIceBlueWhiteEntry />
      <PosterLightMotionOrangeBlackEntry />
      <PosterLightMotionEmeraldGoldEntry />
      <PosterLightMotionNeonPinkPurpleEntry />
      <PosterLightMotionSilverBlueEntry />
      <WingOverloadEntry />
      <OverlappingUnderlappingEntry />
      <ThroughBallAttackEntry />
      <CutbackAttackEntry />
      <CounterAttackEntry />
      <HighPressEntry />
    </>
  );
};
