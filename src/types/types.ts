import { Direction, EnemyPattern, MessageType } from "./enums.ts";

export type InputState = {
  move: Direction;
  shoot: boolean;
};

export type Player = {
  name: string;
  x: number;
  y: number;
  cooldown: number;
};

export type Bullet = {
  id: number;
  x: number;
  y: number;
  playerId: string;
};

export type Enemy = {
  id: number;
  x: number;
  y: number;
  speed: number;
  pattern: EnemyPattern;
  direction: Direction;
};

export type GameState = {
  tick: number;
  players: Record<string, Player>;
  bullets: Bullet[];
  enemies: Enemy[];
  level: number;
  score: number;
  gameOver: boolean;
};

export type ClientMessage =
  | {
      type: typeof MessageType.INPUT;
      input: InputState;
    }
  | {
      type: typeof MessageType.INIT;
      name: string;
      dimensions: {
        width: number;
        height: number;
      };
    };

export type ServerMessage =
  | {
      type: typeof MessageType.STATE;
      state: GameState;
    }
  | {
      type: typeof MessageType.ASSIGN_ID;
      id: string;
    };
