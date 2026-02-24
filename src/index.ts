import { WebSocketServer } from "ws";
import { GameEngine } from "./engine/gameEngine.ts";
import { TICK_INTERVAL } from "./constants.ts";
import type {
  ClientMessage,
  InputState,
  ServerMessage,
} from "./types/types.ts";
import { MessageType } from "./types/enums.ts";

const wss = new WebSocketServer({ port: 8080 });
let engine: GameEngine | null = null;
let nextPlayerId = 1;
let interval: NodeJS.Timeout | null = null;

console.log("Server running on ws://localhost:8080");

wss.on("connection", (ws) => {
  const playerId = (nextPlayerId++).toString();

  // Send the assigned ID to the client
  ws.send(
    JSON.stringify({
      type: MessageType.ASSIGN_ID,
      id: playerId,
    } as ServerMessage),
  );

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString()) as ClientMessage;

      if (data.type === MessageType.INIT) {
        if (!engine) {
          const { width, height } = data.dimensions;
          engine = new GameEngine(width, height);

          // Start game loop broadcast
          interval = setInterval(() => {
            if (!engine) return;

            engine.update();

            const message: ServerMessage = {
              type: MessageType.STATE,
              state: engine.getState(),
            };
            const serializedState = JSON.stringify(message);

            wss.clients.forEach((client) => {
              if (client.readyState === 1) {
                client.send(serializedState);
              }
            });
          }, TICK_INTERVAL);
        }
        engine.addPlayer(playerId, data.name);
      } else if (data.type === MessageType.INPUT && engine) {
        engine.setInput(playerId, data.input);
      }
    } catch (err) {
      console.error("Failed to process message:", err);
    }
  });

  ws.on("close", () => {
    if (engine) engine.removePlayer(playerId);

    // If no clients left, we could optionally reset the engine
    if (wss.clients.size === 0 && interval) {
      clearInterval(interval);
      interval = null;
      engine = null;
    }
  });
});
