import { BULLET_SPEED, PLAYER_SPEED } from "../constants.ts";
import { Direction, EnemyPattern } from "../types/enums.ts";
import type { GameState, InputState, LevelRules } from "../types/types.ts";
import { RulesSystem } from "./rules-system.ts";

export class GameEngine {
  private state: GameState;
  private inputs: Record<string, InputState> = {};
  private width: number;
  private height: number;
  private nextBulletId: number = 0;
  private nextEnemyId: number = 0;
  private rulesSystem: RulesSystem;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.rulesSystem = new RulesSystem();
    this.state = this.createInitialState();
  }

  public update(): void {
    if (this.state.waiting) return;

    this.state.tick++;

    // Move players and shoot
    for (const id in this.state.players) {
      this.movePlayer(id);
      this.playerShoot(id);
    }

    // Update bullets
    this.updateBullets();

    // Spawn enemies
    this.spawnEnemies();

    // Update enemies
    this.updateEnemies();

    // Check game over
    this.checkGameOver();

    // Update rules if level changed
    this.state.rules = this.rulesSystem.getRulesForLevel(this.state.level);
  }

  public getState(): GameState {
    return this.state;
  }

  public setInput(id: string, input: InputState): void {
    this.inputs[id] = input;
  }

  public setWaiting(waiting: boolean): void {
    this.state.waiting = waiting;
  }

  public addPlayer(id: string, name: string): void {
    this.state.players[id] = {
      name: name,
      x: this.width / 2,
      y: this.height - 60,
      cooldown: 0,
    };
    this.inputs[id] = { move: 0, shoot: false };
  }

  public removePlayer(id: string): void {
    delete this.state.players[id];
    delete this.inputs[id];
  }

  private createInitialState(): GameState {
    return {
      tick: 0,
      players: {},
      bullets: [],
      enemies: [],
      level: 1,
      score: 0,
      gameOver: false,
      waiting: true,
      rules: this.rulesSystem.getRulesForLevel(1),
    };
  }

  private isColliding(
    ax: number,
    ay: number,
    aw: number,
    ah: number,
    bx: number,
    by: number,
    bw: number,
    bh: number,
  ): boolean {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  private movePlayer(id: string): void {
    const player = this.state.players[id];
    const input = this.inputs[id];
    if (!player || !input) return;

    player.x += input.move * PLAYER_SPEED;

    if (player.x < 20) player.x = 20;
    if (player.x > this.width - 20) player.x = this.width - 20;
  }

  private playerShoot(id: string): void {
    const player = this.state.players[id];
    const input = this.inputs[id];
    if (!player || !input) return;

    if (player.cooldown > 0) {
      player.cooldown--;
    }

    if (!this.state.rules.canFire) return;

    if (input.shoot && player.cooldown <= 0) {
      this.state.bullets.push({
        id: this.nextBulletId++,
        x: player.x,
        y: player.y,
        playerId: id,
      });

      player.cooldown = 20;
    }
  }

  private updateBullets(): void {
    for (let i = this.state.bullets.length - 1; i >= 0; i--) {
      const bullet = this.state.bullets[i];
      bullet.y -= BULLET_SPEED;

      let hit = false;

      for (let j = this.state.enemies.length - 1; j >= 0; j--) {
        const enemy = this.state.enemies[j];

        if (
          this.isColliding(
            bullet.x - 3,
            bullet.y,
            6,
            12,
            enemy.x - 20,
            enemy.y,
            40,
            40,
          )
        ) {
          this.state.enemies.splice(j, 1);
          this.state.score += 10;
          hit = true;
          break;
        }
      }

      if (hit || bullet.y < 0) {
        this.state.bullets.splice(i, 1);
      }
    }
  }

  private spawnEnemies(): void {
    if (this.state.tick % (60 - this.state.level * 5) === 0) {
      this.state.enemies.push({
        id: this.nextEnemyId++,
        x: Math.random() * (this.width - 40) + 20,
        y: -20,
        speed: 2 + this.state.level * 0.5,
        pattern:
          this.state.level >= 3 ? EnemyPattern.ZIGZAG : EnemyPattern.STRAIGHT,
        direction: Math.random() > 0.5 ? Direction.LEFT : Direction.RIGHT,
      });
    }
  }

  private updateEnemies(): void {
    for (let i = this.state.enemies.length - 1; i >= 0; i--) {
      const enemy = this.state.enemies[i];

      enemy.y += enemy.speed;

      if (enemy.pattern === EnemyPattern.ZIGZAG) {
        enemy.x += enemy.direction * 2;

        if (enemy.x < 20 || enemy.x > this.width - 20) {
          enemy.direction *= -1;
        }
      }

      // Remove if off screen
      if (enemy.y > 1000) {
        this.state.enemies.splice(i, 1);
      }
    }
  }

  private checkGameOver(): void {
    if (this.state.score >= this.state.level * 200) {
      this.state.level++;
    }

    for (const id in this.state.players) {
      const player = this.state.players[id];
      for (const enemy of this.state.enemies) {
        if (
          this.isColliding(
            enemy.x - 20,
            enemy.y,
            40,
            40,
            player.x,
            player.y,
            40,
            40,
          )
        ) {
          this.state.gameOver = true;
          break;
        }
      }
      if (this.state.gameOver) break;
    }
  }
}
