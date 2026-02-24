import { DialogueSequence } from "./dialogue-sequence.ts";

export interface Dialogue {
  level: number;
  levelIntro: DialogueSequence[];
  levelOutro: DialogueSequence[];
}
