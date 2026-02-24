import { Dialogue } from "./dialogue.ts";
import dialogsJSON from "./game-dialogues.json" with { type: "json" };

export class DialogSystem {
  private dialogs: Map<number, Dialogue> = new Map();

  constructor() {
    this.loadDialogs();
  }

  loadDialogs() {
    // Since Dialog is an interface, we can cast JSON directly
    const rawDialogs = dialogsJSON as Dialogue[];
    rawDialogs.forEach((dialog) => {
      this.dialogs.set(dialog.level, dialog);
    });
  }

  getDialog(
    level: number,
    placeholders?: Record<string, string>,
  ): Dialogue | undefined {
    const dialog = this.dialogs.get(level);
    if (!dialog) return undefined;

    if (!placeholders) return dialog;

    // Clone dialog to avoid mutating the original Map entry
    return {
      ...dialog,
      levelIntro: dialog.levelIntro.map((seq) => ({
        ...seq,
        playerName: this.replacePlaceholders(seq.playerName, placeholders),
        dialogue: this.replacePlaceholders(seq.dialogue, placeholders),
      })),
      levelOutro: dialog.levelOutro.map((seq) => ({
        ...seq,
        playerName: this.replacePlaceholders(seq.playerName, placeholders),
        dialogue: this.replacePlaceholders(seq.dialogue, placeholders),
      })),
    };
  }

  private replacePlaceholders(
    text: string,
    placeholders: Record<string, string>,
  ): string {
    let result = text;
    for (const [key, value] of Object.entries(placeholders)) {
      // Replaces {key} with value
      const regex = new RegExp(`\\{${key}\\}`, "g");
      result = result.replace(regex, value);
    }
    return result;
  }
}
