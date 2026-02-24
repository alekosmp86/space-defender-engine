import { describe, it, expect } from "vitest";
import { GameEngine } from "../src/engine/gameEngine.ts";

describe("GameEngine - Rules System", () => {
  it("should disable firing at level 1", () => {
    const engine = new GameEngine(800, 600);
    engine.setWaiting(false); // Unpause

    // Add a player
    engine.addPlayer("p1", "Test Player");

    // Try to shoot
    engine.setInput("p1", { move: 0, shoot: true });
    engine.update();

    expect(engine.getState().rules.canFire).toBe(false);
    expect(engine.getState().bullets.length).toBe(0);
  });

  it("should enable firing at level 2", () => {
    const engine = new GameEngine(800, 600);
    engine.setWaiting(false);

    // Force level 2
    engine.addPlayer("p1", "Player 1");
    // We need to trigger a rules update. In gameEngine it happens at the end of update()
    // but it's based on state.level.

    // Mocking level increase (or just reaching score)
    // Score requirement for L2 is level * 200 = 1 * 200 = 200
    engine.getState().goalProgress = 51; // NEW WAY
    engine.update(); // This should trigger level++ and then rules update

    expect(engine.getState().level).toBe(2);
    expect(engine.getState().rules.canFire).toBe(true);

    // Try to shoot
    engine.setInput("p1", { move: 0, shoot: true });
    engine.update();

    expect(engine.getState().bullets.length).toBe(1);
  });
});
