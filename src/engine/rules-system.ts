import { LevelRules } from "../types/types.ts";
import { GoalType } from "../types/enums.ts";
import rulesJSON from "./game-rules.json" with { type: "json" };

interface LevelRuleEntry {
  level: number;
  rules: LevelRules;
}

export class RulesSystem {
  private rulesMap: Map<number, LevelRules> = new Map();
  private defaultRules: LevelRules = {
    canFire: true,
    goal: {
      type: GoalType.SCORE,
      value: 1000,
    },
  };

  constructor() {
    this.loadRules();
  }

  private loadRules() {
    const rawRules = rulesJSON as LevelRuleEntry[];
    rawRules.forEach((entry) => {
      this.rulesMap.set(entry.level, entry.rules);
    });
  }

  getRulesForLevel(level: number): LevelRules {
    return this.rulesMap.get(level) || this.defaultRules;
  }
}
