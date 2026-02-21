import { BULLET_SPEED, PLAYER_SPEED } from "../constants.ts";
import { Direction, EnemyPattern } from "../types/enums.ts";
import type { GameState, InputState } from "../types/types.ts";

export class GameEngine {
  private state: GameState;
  private input: InputState;
  private width: number;
  private height: number;
  private nextBulletId: number = 0;
  private nextEnemyId: number = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.state = this.createInitialState();
    this.input = { move: 0, shoot: false };
  }

  public update(): void {
    this.state.tick++;

    // Move player
    this.movePlayer();

    // Shooting cooldown
    this.playerShoot();

    // Update bullets
    this.updateBullets();

    // Spawn enemies
    this.spawnEnemies();

    // Update enemies
    this.updateEnemies();

    // Check game over
    this.checkGameOver();
  }

  public getState(): GameState {
    return this.state;
  }

  public setInput(input: InputState): void {
    this.input = input;
  }

  private createInitialState(): GameState {
    return {
      tick: 0,
      player: {
        x: this.width / 2,
        y: this.height - 60,
        cooldown: 0,
      },
      bullets: [],
      enemies: [],
      level: 1,
      score: 0,
      gameOver: false,
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

  private movePlayer(): void {
    this.state.player.x += this.input.move * PLAYER_SPEED;

    if (this.state.player.x < 20) this.state.player.x = 20;
    if (this.state.player.x > this.width - 20)
      this.state.player.x = this.width - 20;
  }

  private playerShoot(): void {
    if (this.state.player.cooldown > 0) {
      this.state.player.cooldown--;
    }

    if (this.input.shoot && this.state.player.cooldown <= 0) {
      this.state.bullets.push({
        id: this.nextBulletId++,
        x: this.state.player.x,
        y: this.state.player.y,
      });

      this.state.player.cooldown = 20;
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

    for (const enemy of this.state.enemies) {
      if (
        this.isColliding(
          enemy.x - 20,
          enemy.y,
          40,
          40,
          this.state.player.x,
          this.state.player.y,
          40,
          40,
        )
      ) {
        this.state.gameOver = true;
        break;
      }
    }
  }
}
