import { MyComposition } from "./Composition";
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
    </>
  );
};
