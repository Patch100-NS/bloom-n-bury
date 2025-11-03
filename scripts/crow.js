'use strict';
import { TILE_SIZE, HALF_TILE_SIZE } from '../main.js';
import { GameObject } from './gameObject.js';
// import onScreenURL from '../Audio/SFX/Crow/sfx_deathscream_alien5.wav';
import cawingURL from '../Audio/SFX/Crow/sfx_deathscream_alien6.wav';
import alertURL from '../Audio/SFX/Crow/BNB_Crow_Impact.WAV';

export class Crow extends GameObject {
  constructor({ game, sprite, position, scale }) {
    super({ game, sprite, position, scale });
    //*no init() - added every night/removed every morning

    //State
    this.id = 'crow';
    this.isActivated = false;
    this.isCawing = false;
    this.isVisible = false;
    this.onScreenCawingPlayed = false;
    this.markedForDelition = false;
    this.followers = [];

    //Visual
    this.maxFrameActivated = 3;
    this.maxFrameCawing = 5;
    this.spriteSubX = 0;
    this.hasShadow = false;

    //Timers
    this.idleSpriteTimer = 5001;
    this.idleSpriteTimeout = 5000; //ms

    //Scopes
    this.activationScope = {
      x: 0,
      y: 0,
      radius: 6 * TILE_SIZE,
    };

    this.interactionScope = {
      x: 0,
      y: 0,
      radius: 32 * TILE_SIZE,
    };

    this.collisionScope = {
      x: 0,
      y: 0,
      radius: 4,
    };

    //Audio
    this.cawing = new Howl({
      src: [cawingURL],
      volume: 0.075,
      rate: 0.95,
      loop: false,
    });

    this.alert = new Howl({
      src: [alertURL],
      volume: 0.8,
      loop: false,
    });

    this.soundEffects = [this.cawing, this.alert];
  }

  drawScopes(ctx) {
    // if (!this.isActivated) {
    ctx.fillStyle = 'rgba(179, 255, 0, 0.43)';

    ctx.beginPath();
    ctx.arc(
      this.position.scopeX,
      this.position.scopeY,
      this.interactionScope.radius,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.closePath();
  }

  updateScopes() {
    this.interactionScope.x =
      this.collisionScope.x =
      this.activationScope.x =
      this.position.scopeX =
        this.position.x + HALF_TILE_SIZE;

    this.interactionScope.y =
      this.collisionScope.y =
      this.activationScope.y =
      this.position.scopeY =
        this.position.y + HALF_TILE_SIZE;
  }

  animate(deltaTime) {
    if (!this.isVisible) {
      this.sprite.y = 0;
      this.sprite.x = 0;

      if (this.isCawing) {
        if (this.spriteSubX <= this.maxFrameCawing) {
          if (this.game.spriteUpdate) {
            this.spriteSubX++;
          }
        } else {
          if (!this.cawing.playing()) {
            Math.random() < 0.5
              ? this.cawing.rate(0.9)
              : this.cawing.rate(0.95);
            this.cawing.play();
          }
          this.spriteSubX = 0;
        }
      } else {
        if (this.checkIsOnScreen() && !this.onScreenCawingPlayed) {
          this.cawing.play();
          this.onScreenCawingPlayed = true;
        }
      }
    } else if (this.isVisible && !this.isCawing && this.checkIsOnScreen()) {
      if (this.idleSpriteTimer < this.idleSpriteTimeout) {
        this.idleSpriteTimer += deltaTime;
      } else {
        this.sprite.y = Math.trunc(Math.random() * 3) + 1;
        Math.random() < 0.5 ? this.cawing.rate(0.9) : this.cawing.rate(0.95);
        this.cawing.play();
        this.idleSpriteTimer = 0;
      }
    } else if (this.isVisible && this.isCawing) {
      this.sprite.y = 4;
      if (this.sprite.x <= this.maxFrameCawing) {
        if (this.game.spriteUpdate) {
          this.sprite.x++;
        }
      } else {
        if (!this.cawing.playing()) {
          Math.random() < 0.5 ? this.cawing.rate(0.9) : this.cawing.rate(0.95);
          this.cawing.play();
        }
        this.sprite.x = 3;
      }
    }
  }

  update(ctx, ctxTop, deltaTime) {
    this.updateScopes();
    this.animate(deltaTime);
    this.updateAudioVolume();

    this.followers = this.followers.filter(
      zombie => zombie.crowToFollow === this && zombie.isAlive
    );

    if (
      (this.game.checkCircleCollision(
        this.game.hero.collisionScope,
        this.collisionScope
      )[1] >= this.interactionScope.radius ||
        this.followers.length === 0) &&
      this.isCawing
    ) {
      this.isCawing = false;
      this.markedForDelition = true;
      this.game.deletedGameObjects.push(this);
    }

    if (!this.game.isNight) {
      this.markedForDelition = true;
    }

    //Eyes/crow - Visibility update
    if (
      this.game.checkCircleCollision(
        this.game.hero.torchScope,
        this.collisionScope
      )[0]
    ) {
      this.isVisible = true;
    } else if (
      this.game.world.lightSources.some(
        lightSource =>
          this.game.checkCircleCollision(
            {
              x: lightSource.x + HALF_TILE_SIZE,
              y: lightSource.y + HALF_TILE_SIZE,
              radius: lightSource.radius,
            },
            this.collisionScope
          )[0]
      )
    ) {
      this.isVisible = true;
    } else {
      this.isVisible = false;
    }

    //Hero activates crow
    if (
      this.game.checkCircleCollision(
        this.activationScope,
        this.game.hero.collisionScope
      )[0] &&
      this.game.hero.arrived &&
      !this.game.hero.isSneaking
    ) {
      this.alert.play();

      this.isActivated = true;
      this.isActivatedTimer = 0;
      this.activationScope.radius = 0;
      this.game.pathFindingQueue = [];
      this.game.stats.crowsActivated++;

      //Path finding reset for all zombies
      for (let i = 0; i < this.game.zombies.length; i++) {
        const zombie = this.game.zombies[i];
        zombie.resetPathFindingData();
      }
    }

    //Crow activates zombies
    if (this.isActivated && this.game.hero.arrived) {
      for (let i = 0; i < this.game.zombies.length; i++) {
        const zombie = this.game.zombies[i];

        if (
          this.game.checkCircleCollision(
            this.interactionScope,
            zombie.collisionScope
          )[0]
        ) {
          zombie.isActivated = true;
          zombie.crowToFollow = this;

          if (!this.followers.includes(zombie)) {
            this.followers.push(zombie);
          }
        }

        this.isCawing = true;
        this.isActivated = false;
      }
    }

    //Debug/test
    if (this.game.debug) {
      this.drawScopes(ctx);
    }
  }
}
