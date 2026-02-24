import { describe, it, expect } from "vitest";
import { DialogSystem } from "../src/interaction/dialogue-system.ts";

describe("DialogSystem", () => {
  const dialogSystem = new DialogSystem();

  it("should load dialogs for level 1", () => {
    const dialog = dialogSystem.getDialog(1);
    expect(dialog).toBeDefined();
    expect(dialog?.level).toBe(1);
  });

  it("should replace placeholders correctly", () => {
    const placeholders = { p1: "Alekos", p2: "AI" };
    const dialog = dialogSystem.getDialog(1, placeholders);

    expect(dialog).toBeDefined();
    // Check levelIntro
    expect(dialog?.levelIntro[0].playerName).toBe("Alekos");
    expect(dialog?.levelIntro[1].playerName).toBe("AI");

    // Check dialogue text (if any placeholders are there)
    // Level 1 Intro first entry: "Hey... despierta chiquitica..." (no placeholders in text yet, but system is prepared)
  });

  it("should return undefined for non-existent levels", () => {
    const dialog = dialogSystem.getDialog(999);
    expect(dialog).toBeUndefined();
  });
});
