import { DialogSystem } from "./src/interaction/dialogue-system.ts";

const dialogSystem = new DialogSystem();
const placeholders = { p1: "Alekos", p2: "AI" };
const dialog = dialogSystem.getDialog(1, placeholders);

console.log("Dialog Level:", dialog?.level);
console.log("First Entry Player Name:", dialog?.levelIntro[0].playerName);
console.log("Second Entry Player Name:", dialog?.levelIntro[1].playerName);

if (
  dialog?.levelIntro[0].playerName === "Alekos" &&
  dialog?.levelIntro[1].playerName === "AI"
) {
  console.log("VERIFICATION SUCCESSFUL: Placeholders replaced correctly.");
} else {
  console.log("VERIFICATION FAILED: Placeholders not replaced correctly.");
  process.exit(1);
}
