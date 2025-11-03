'use strict';
import {
  GAME_COLS,
  GAME_ROWS,
  GAME_HEIGHT,
  GAME_WIDTH,
  TILE_SIZE,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../main.js';

export class Camera {
  constructor(game) {
    this.game = game;

    this.init();
  }

  init() {
    this.width = GAME_WIDTH; // sirina prozora kamere
    this.height = GAME_HEIGHT; // visina prozora kamere
    this.x = this.game.hero.position.x;
    this.y = this.game.hero.position.y;
    this.maxX = WORLD_WIDTH - this.width; //sirina igrice - sirina kamere
    this.maxY = WORLD_HEIGHT - this.height;
    this.isLocked = false;
    this.onHero = true;
    this.halfWidth = -TILE_SIZE / 2 + GAME_WIDTH / 2;
    this.halfHeight = GAME_HEIGHT / 2;
  }

  moveToHero() {
    this.x = -this.game.hero.position.x + this.halfWidth;
    this.y = -this.game.hero.position.y + this.halfHeight;
  }

  move() {
    if (
      (!this.game.demon.isActivated && this.game.demon.health > 0) ||
      (this.game.demon.isActivated &&
        this.game.demon.health <= 0 &&
        !this.game.world.arena.isActive)
    ) {
      if (this.onHero) {
        this.x = -this.game.hero.position.x + this.halfWidth;
        this.y = -this.game.hero.position.y + this.halfHeight;
      }

      if (!this.onHero)
        if (this.x < -this.game.hero.position.x + this.halfWidth) {
          this.x++;
        }

      if (this.x > -this.game.hero.position.x + this.halfWidth) {
        this.x--;
      }

      if (this.y < -this.game.hero.position.y + this.halfHeight) {
        this.y++;
      }

      if (this.y > -this.game.hero.position.y + this.halfHeight) {
        this.y--;
      }
    } else {
      if (this.x < -this.game.world.arena.area.x) {
        this.x++;
      }

      if (this.x > -this.game.world.arena.area.x) {
        this.x--;
      }

      if (this.y < -this.game.world.arena.area.y) {
        this.y++;
      }

      if (this.y > -this.game.world.arena.area.y) {
        this.y--;
      }
    }

    if (
      Math.trunc(this.x) === Math.trunc(-this.game.world.arena.area.x) &&
      Math.trunc(this.y) === Math.trunc(-this.game.world.arena.area.y)
    ) {
      this.isLocked = true;
    } else {
      this.isLocked = false;
    }

    if (
      Math.trunc(this.x) ===
        Math.trunc(-this.game.hero.position.x + this.halfWidth) &&
      Math.trunc(this.y) ===
        Math.trunc(-this.game.hero.position.y + this.halfHeight)
    ) {
      this.onHero = true;
    } else {
      this.onHero = false;
    }

    // Ogranicavanje vrednosti
    if (this.x >= 0) {
      this.x = 0;
    }
    if (this.y >= 0) {
      this.y = 0;
    }

    if (this.x <= -this.maxX) {
      this.x = -this.maxX;
    }
    if (this.y <= -this.maxY) {
      this.y = -this.maxY;
    }
  }
}
