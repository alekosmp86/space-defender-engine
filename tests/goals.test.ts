import { describe, it, expect } from "vitest";
import { GameEngine } from "../src/engine/gameEngine.ts";

describe("GameEngine - Goals & Spawning", () => {
  it("should spawn enemies based on formula: 2 * players * level", () => {
    const engine = new GameEngine(800, 600);
    engine.setWaiting(false);
    engine.addPlayer("p1", "Player 1");

    // Level 1, 1 player -> 2 * 1 * 1 = 2 enemies minimum per wave
    // Our spawn logic triggers every few ticks
    // Set tick to a multiple of spawn interval
    // Interval is (60 - level * 5) = 60 - 5 = 55 in current code?
    // Wait, let's check the interval: 60 - 1*5 = 55.
    // 55 % 55 == 0.

    for (let i = 0; i < 55; i++) engine.update();

    expect(engine.getState().enemies.length).toBeGreaterThanOrEqual(2);
  });

  it("should increase goalProgress when enemies are avoided in Level 1", () => {
    const engine = new GameEngine(800, 600);
    engine.setWaiting(false);
    engine.addPlayer("p1", "Player 1");

    // Level 1 goal is "avoid" 50
    expect(engine.getState().rules.goal.type).toBe("avoid");

    // Manually add an enemy near the bottom
    engine.getState().enemies.push({
      id: 999,
      x: 100,
      y: 995,
      speed: 10,
      pattern: "straight",
      direction: 0,
    });

    engine.update();

    // Enemy should have moved past 1000 and been removed
    expect(engine.getState().enemies.length).toBe(0);
    expect(engine.getState().goalProgress).toBe(1);
  });

  it("should advance level when avoid goal is reached", () => {
    const engine = new GameEngine(800, 600);
    engine.setWaiting(false);
    engine.addPlayer("p1", "Player 1");

    engine.getState().goalProgress = 49;

    // Add one more enemy to avoid
    engine.getState().enemies.push({
      id: 999,
      x: 100,
      y: 1001,
      speed: 0,
      pattern: "straight",
      direction: 0,
    });

    engine.update();

    // Should advance to Level 2
    expect(engine.getState().level).toBe(2);
    expect(engine.getState().goalProgress).toBe(0);
    // Rules update happens in the tick AFTER level increase normally in my engine code
    // because update() sets rules at the end.
    engine.update();
    expect(engine.getState().rules.goal.type).toBe("score");
  });
});
