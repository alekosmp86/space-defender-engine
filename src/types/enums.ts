export const MessageType = {
  INPUT: "input",
  STATE: "state",
  INIT: "init",
  ASSIGN_ID: "assign_id",
} as const;
export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export const EnemyPattern = {
  STRAIGHT: "straight",
  ZIGZAG: "zigzag",
} as const;
export type EnemyPattern = (typeof EnemyPattern)[keyof typeof EnemyPattern];

export const Direction = {
  LEFT: -1,
  RIGHT: 1,
  NONE: 0,
} as const;
export type Direction = (typeof Direction)[keyof typeof Direction];

export const GoalType = {
  AVOID: "avoid",
  SCORE: "score",
} as const;
export type GoalType = (typeof GoalType)[keyof typeof GoalType];
