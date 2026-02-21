import { WebSocketServer } from "ws";
import { GameEngine } from "./engine/gameEngine.ts";
import { TICK_INTERVAL } from "./constants.ts";
import type { ClientMessage, InputState, ServerMessage } from "./types/types.ts";
import { MessageType } from "./types/enums.ts";

const wss = new WebSocketServer({ port: 8080 });

console.log("Server running on ws://localhost:8080");

wss.on("connection", (ws) => {
  let engine: GameEngine | null = null;
  let latestInput: InputState = {
    move: 0,
    shoot: false,
  };
  let interval: NodeJS.Timeout | null = null;

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString()) as ClientMessage;

      if (data.type === MessageType.INIT && !engine) {
        const { width, height } = data.dimensions;
        engine = new GameEngine(width, height);

        // Start game loop only after initialization
        interval = setInterval(() => {
          if (!engine) return;

          engine.setInput(latestInput);
          engine.update();

          const message: ServerMessage = {
            type: MessageType.STATE,
            state: engine.getState(),
          };
          ws.send(JSON.stringify(message));
        }, TICK_INTERVAL);
      } else if (data.type === MessageType.INPUT && engine) {
        latestInput = data.input;
      }
    } catch (err) {
      console.error("Failed to process message:", err);
    }
  });

  ws.on("close", () => {
    if (interval) clearInterval(interval);
  });
});
