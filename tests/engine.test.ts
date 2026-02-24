import { describe, it, expect } from "vitest";
import { GameEngine } from "../src/engine/gameEngine.ts";

describe("GameEngine - Pause Mechanism", () => {
  it("should initialize in a waiting state", () => {
    const engine = new GameEngine(800, 600);
    expect(engine.getState().waiting).toBe(true);
  });

  it("should not advance ticks or logic when waiting", () => {
    const engine = new GameEngine(800, 600);
    const initialState = JSON.parse(JSON.stringify(engine.getState()));

    engine.update();

    expect(engine.getState().tick).toBe(initialState.tick);
    expect(engine.getState().enemies.length).toBe(0);
  });

  it("should start updating when unpaused", () => {
    const engine = new GameEngine(800, 600);
    engine.setWaiting(false);

    expect(engine.getState().waiting).toBe(false);

    engine.update();
    expect(engine.getState().tick).toBe(1);
  });

  it("should automatically pause again if set to waiting", () => {
    const engine = new GameEngine(800, 600);
    engine.setWaiting(false);
    engine.update();
    expect(engine.getState().tick).toBe(1);

    engine.setWaiting(true);
    engine.update();
    expect(engine.getState().tick).toBe(1); // Should still be 1
  });
});
