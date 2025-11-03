'use strict';
import {
  TILE_SIZE,
  WORLD_COLS,
  WORLD_ROWS,
  GAME_WIDTH,
  GAME_HEIGHT,
} from '../main.js';
import { GameObject } from './gameObject.js';

export class Grave extends GameObject {
  constructor({ game, sprite, position, scale }) {
    super({ game, sprite, position, scale });

    //Visual
    this.candleImagePositionX =
      Math.random() < 0.5 ? this.position.x : this.position.x - 8;

    this.flowerpotRoseImage = document.getElementById('rose-image-flowerpot');

    //State
    this.isLocked = false;
    this.isOccupied = false;
    this.hasCrow = false;
    this.hasCandle = false;
    this.candleDays = 0;
    this.sector = '';
    this.calculateSector();
  }

  calculateSector() {
    for (let i = 0; i < this.game.world.sectors.length; i++) {
      for (let j = 0; j < this.game.world.sectors[i].area.length; j++) {
        let sector = this.game.world.sectors[i];
        let area = sector.area[j];

        if (this.game.checkRectCollision(this.position, area)) {
          this.sector = sector;
        }
      }
    }
  }

  drawFlowerpotRose(ctx) {
    if (this.isLocked) {
      this.sector.name === 'Memorial Meadow'
        ? ctx.drawImage(
            this.flowerpotRoseImage,
            this.position.x,
            this.position.y
          )
        : ctx.drawImage(
            this.flowerpotRoseImage,
            this.position.x,
            this.position.y - TILE_SIZE
          );
    }
  }

  drawCandle(ctx) {
    let candleImage = document.getElementById('candle-image-full');

    if (this.candleDays > 7 && this.candleDays < 15) {
      candleImage = document.getElementById('candle-image-half');
    }

    if (this.candleDays > 16) {
      candleImage = document.getElementById('candle-image-end');
    }

    if (this.hasCandle) {
      this.sector.name === 'Memorial Meadow'
        ? ctx.drawImage(candleImage, this.candleImagePositionX, this.position.y)
        : ctx.drawImage(
            candleImage,
            this.candleImagePositionX,
            this.position.y - TILE_SIZE
          );
    }
  }
}
