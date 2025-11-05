'use strict';
import { TILE_SIZE, GAME_WIDTH, GAME_HEIGHT } from '../main';
import { GameObject } from './gameObject';
import launchBallURL from '../Audio/SFX/Lightnings/sfx_exp_medium8.wav';
import chargeBallURL from '../Audio/SFX/Lightnings/sfx_sounds_powerup8.wav';
import launchBoltURL from '../Audio/SFX/Lightnings/sfx_exp_medium4.wav';
import chargeBoltURL from '../Audio/SFX/Lightnings/sfx_sounds_error1.wav';
import hitURL from '../Audio/SFX/Lightnings/sfx_sounds_negative1.wav';

export class Lightning extends GameObject {
  constructor({ game, sprite, position, scale }) {
    super({ game, sprite, position, scale });
    // this.width = 10; //px
    // this.height = 10;

    this.isAvailable = true;
    this.hasTarget = false;

    this.target = {
      x: 0,
      y: 0,
      width: TILE_SIZE,
      height: TILE_SIZE,
    };
    //Audio
    this.hit = new Howl({
      src: [hitURL],
      volume: 0.1,
      rate: 1,
    });
  }

  start() {
    this.isAvailable = false;
  }

  reset() {
    this.isAvailable = true;
    this.sprite.x = 0;
    this.target = {
      x: 0,
      y: 0,
      width: TILE_SIZE,
      height: TILE_SIZE,
    };
  }
}
export class LightningBolt extends Lightning {
  constructor({ game, sprite, position, scale }) {
    //State
    super({ game, sprite, position, scale });
    this.type = 'bolt';
    this.speed = 64;

    //Visual
    this.maxFrame = 15;
    this.maxFrameTarget = 7;

    //Audio
    this.launchBolt = new Howl({
      src: [launchBoltURL],
      volume: 0.125,
      rate: 1,
    });

    this.chargeBolt = new Howl({
      src: [chargeBoltURL],
      volume: 0.05,
      rate: 3,
    });

    this.soundEffects = [this.launchBolt, this.chargeBolt, this.hit];
  }

  setStartPoint() {
    if (this.isAvailable) {
      this.position.x = this.target.x;
      this.position.y = this.target.y;
    }
  }

  setTarget() {
    if (this.isAvailable) {
      if (this.game.scarecrow.isActivated) {
        if (Math.random() < 0.8) {
          this.target.x = this.game.hero.position.x - 2;
          this.target.y = this.game.hero.position.y - 2;
        } else {
          this.target.x = this.game.scarecrow.position.x;
          this.target.y = this.game.scarecrow.position.y;
          this.game.stats.lightningsDeflected++;
        }
      } else {
        this.target.x = this.game.hero.position.x;
        this.target.y = this.game.hero.position.y;
      }
    }
  }

  draw(context) {
    if (!this.isAvailable) {
      context.drawImage(
        this.sprite.image,
        this.sprite.x * this.sprite.width,
        this.sprite.y * this.sprite.height,
        this.sprite.width,
        this.sprite.height,
        this.position.x,
        this.position.y - this.sprite.height + TILE_SIZE,
        this.sprite.width,
        this.sprite.height
      );
    }
  }

  animate() {
    if (this.sprite.x <= this.maxFrame) {
      if (this.sprite.x === 2) {
        this.chargeBolt.play();
      }
      if (this.sprite.x === this.maxFrameTarget) {
        this.chargeBolt.stop();
        this.launchBolt.play();
      }
      if (this.game.spriteUpdate) {
        this.sprite.x++;
      }
    } else {
      this.reset();
    }
  }

  update() {
    if (!this.isAvailable) {
      this.animate();
      this.updateAudioVolume();

      //Collision check - Hero taking damage
      if (
        this.game.hero.isAlive &&
        this.sprite.x > this.maxFrameTarget &&
        this.game.checkRectCollision(this.target, this.game.hero.position)
      ) {
        if (!this.game.godMode && this.game.demon.health > 0) {
          this.game.hero.health--; //ok?
        }
        if (!this.hit.playing()) {
          // this.launchBolt.stop();
          this.hit.play();
        }
        this.game.hero.isTakingDamage = true;
        this.game.hero.isRolling = false;
      } else {
        this.game.hero.isTakingDamage = false;
      }
    }
  }
}
export class LightningBall extends Lightning {
  constructor({ game, sprite, position, scale }) {
    super({ game, sprite, position, scale });

    //State
    this.type = 'ball';
    this.speed = 360;

    //Visual
    this.maxFrameStart = 3;
    this.maxFrameTravel = 6;
    this.maxFrameEnd = 10;

    //Audio
    this.launchBall = new Howl({
      src: [launchBallURL],
      volume: 0.125,
      rate: 1,
    });

    this.chargeBall = new Howl({
      src: [chargeBallURL],
      volume: 0.1,
      rate: 0.4,
    });

    this.soundEffects = [this.launchBall, this.chargeBall, this.hit];
  }

  setStartPoint() {
    if (this.isAvailable) {
      this.position.x = this.game.demon.position.x;
      this.position.y = this.game.demon.position.y;
    }
  }

  setTarget() {
    if (this.isAvailable) {
      if (this.game.scarecrow.isActivated) {
        if (Math.random() < 0.8) {
          this.target.x = this.game.hero.position.x;
          this.target.y = this.game.hero.position.y;
        } else {
          this.target.x = this.game.scarecrow.position.x;
          this.target.y = this.game.scarecrow.position.y;
        }
      } else {
        this.target.x = this.game.hero.position.x;
        this.target.y = this.game.hero.position.y;
      }
    }
  }
  checkIfOnTarget() {
    if (
      this.position.x === this.target.x &&
      this.position.y === this.target.y &&
      !this.isAvailable
    ) {
      return true;
    } else {
      return false;
    }
  }

  draw(context) {
    if (!this.isAvailable) {
      context.drawImage(
        this.sprite.image,
        this.sprite.x * this.sprite.width,
        this.sprite.y * this.sprite.height,
        this.sprite.width,
        this.sprite.height,
        this.position.x,
        this.position.y,
        this.sprite.width,
        this.sprite.height
      );
    }
  }

  animate() {
    if (this.sprite.x < this.maxFrameStart) {
      if (!this.chargeBall.playing()) {
        this.chargeBall.play();
      }
      if (this.game.spriteUpdate) {
        this.sprite.x++;
      }
    } else {
      if (
        this.game.checkRectCollision(this.position, {
          x: this.game.hero.position.x + 4,
          y: this.game.hero.position.y + 4,
          width: 8,
          height: 8,
        }) ||
        this.game.checkRectCollision(this.position, {
          x: this.game.scarecrow.position.x + 4,
          y: this.game.scarecrow.position.y + 4,
          width: 8,
          height: 8,
        })
      ) {
        if (this.game.spriteUpdate) {
          this.sprite.x++;
        }
        if (this.sprite.x > this.maxFrameEnd) {
          if (
            this.target.x === this.game.scarecrow.position.x &&
            this.target.y === this.game.scarecrow.position.y
          ) {
            this.game.stats.lightningsDeflected++;
          }
          this.reset();
        }
      } else {
        if (this.sprite.x < this.maxFrameTravel) {
          if (
            this.sprite.x === this.maxFrameStart &&
            !this.launchBall.playing()
          ) {
            this.chargeBall.stop();
            this.launchBall.play();
          }
          if (this.game.spriteUpdate) {
            this.sprite.x++;
          }
        } else {
          this.sprite.x = this.maxFrameStart + 1;
        }
      }
    }
  }

  update(deltaTime, ctx, ctxLight) {
    const scaledSpeed = this.speed * (deltaTime / 1000); //Pixels Per Second

    if (!this.checkIsOnScreen()) {
      this.isAvailable = true;
      this.reset();
    }

    if (!this.isAvailable) {
      //Sticky eff
      if (
        this.game.checkRectCollision(this.position, {
          x: this.game.hero.position.x + 4,
          y: this.game.hero.position.y + 4,
          width: 8,
          height: 8,
        }) &&
        !this.game.hero.isRolling &&
        !this.game.hero.isSneaking
      ) {
        this.moveTowards(this.game.hero.position, scaledSpeed);
      } else if (
        this.game.checkRectCollision(this.position, {
          x: this.game.scarecrow.position.x + 4,
          y: this.game.scarecrow.position.y + 4,
          width: 8,
          height: 8,
        })
      ) {
        this.moveTowards(this.game.scarecrow.position, scaledSpeed);
      } else {
        //No collision - keep traveling
        if (this.target.x < this.game.demon.position.x) {
          this.target.x =
            this.target.x -
            Math.abs(this.game.demon.position.x - this.target.x);
          this.target.y =
            this.target.y +
            Math.abs(this.game.demon.position.y - this.target.y);
        } else if (this.target.x > this.game.demon.position.x) {
          this.target.x =
            this.target.x +
            Math.abs(this.game.demon.position.x - this.target.x);
          this.target.y =
            this.target.y +
            Math.abs(this.game.demon.position.y - this.target.y);
        } else {
          this.target.y =
            this.target.y +
            Math.abs(this.game.demon.position.y - this.target.y);
        }
        this.moveTowards(
          this.target,
          this.sprite.x > this.maxFrameStart ? scaledSpeed : 0 //to form lighting ball first
        );
      }

      //Animate
      this.animate();

      //Check collision - Hero taking damage
      if (
        !this.game.hero.isRolling &&
        !this.game.hero.isSneaking &&
        this.game.hero.isAlive &&
        this.game.checkRectCollision(this.position, this.game.hero.position)
      ) {
        if (!this.game.godMode && this.game.demon.health > 0) {
          this.game.hero.health--; //ok?
        }

        if (!this.hit.playing()) {
          this.launchBall.stop();
          this.hit.play();
        }
        this.game.hero.isTakingDamage = true;
        this.game.hero.isRolling = false;
      } else {
        this.game.hero.isTakingDamage = false;
      }
    }
  }
}

/*
// To do:

// Promeni <= u animaciji na <

Lopta:

1. sticky ok?
2. uvek isti damage ok?

3. postavljanje itema prilikom razgovora sa npcjem
4. bag prilikom roll-a - odlozeni damage zbog rolla - 30.03.




*/
