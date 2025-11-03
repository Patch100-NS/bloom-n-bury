'use strict';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  HALF_TILE_SIZE,
  TILE_SIZE,
  WORLD_COLS,
  WORLD_ROWS,
} from '../main.js';
import { GameObject } from './gameObject.js';

export class Npc extends GameObject {
  constructor({ game, sprite, position, scale }) {
    super({ game, sprite, position, scale });

    this.init();
  }

  init() {
    //State
    this.id = 'npc';
    this.markedForDelition = false;
    this.isActivated = false;
    this.isReady = true;

    //Interaction state
    this.interactionCounter = -1;
    this.slide = -1;
    this.slides = [];

    //Visual
    this.maxFrame = 7;
    this.hasShadow = true;

    //Scopes
    this.interactionScope = {
      x: 0,
      y: 0,
      radius: HALF_TILE_SIZE,
    };

    this.soundEffects = [];
  }

  animate() {
    if (!this.game.isNight) {
      if (this.game.spriteUpdate) {
        if (this.sprite.x < this.maxFrame) {
          this.sprite.x++;
        } else {
          this.sprite.x = 0;
          if (this.sprite.y === 2) {
            this.sprite.y = 0;
          }
        }
      }
    } else {
      this.sprite.y = 1;

      if (this.game.spriteUpdate) {
        if (this.sprite.x < this.maxFrame) {
          this.sprite.x++;
        } else {
          this.markedForDelition = true; //removeNpcs function not necessery
          this.game.deletedGameObjects.push(this);
        }
      }
    }
  }

  updateScopes() {
    this.interactionScope.x = this.position.scopeX =
      this.position.x + HALF_TILE_SIZE;

    this.interactionScope.y = this.position.scopeY =
      this.position.y + HALF_TILE_SIZE;
  }

  update(deltaTime, ctx, ctxLight) {
    this.updateScopes();
    this.animate();
  }
}
