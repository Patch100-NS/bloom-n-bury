import {
  GAME_HEIGHT,
  GAME_WIDTH,
  HALF_TILE_SIZE,
  TILE_SIZE,
  WORLD_COLS,
  WORLD_ROWS,
} from '../main.js';
import { GameObject } from './gameObject.js';
import risingURL from '../Audio/SFX/Zombies/sfx_exp_various6.wav';
import dyingURL from '../Audio/SFX/Zombies/sfx_sounds_powerup12.wav';
import burstURL from '../Audio/SFX/Zombies/sfx_sounds_interaction11.wav';
import glowURL from '../Audio/SFX/Zombies/sfx_sound_bling.wav';
import expireURL from '../Audio/SFX/Zombies/sfx_sounds_interaction13.wav';
import alphaGrowlURL from '../Audio/SFX/Zombies/sfx_deathscream_human11.wav';
import betaGrowlURL from '../Audio/SFX/Zombies/sfx_deathscream_human4.wav';
import gammaGrowlURL from '../Audio/SFX/Zombies/sfx_deathscream_human5.wav';
import deltaGrowlURL from '../Audio/SFX/Zombies/sfx_deathscream_human3.wav';

export class Zombie extends GameObject {
  constructor({ game, sprite, position, scale }) {
    super({ game, sprite, position, scale });
    //*no init() - added every night/removed every morning

    //State
    this.markedForDelition = false;
    this.health = 100;
    this.isAlive = true;
    this.isActivated = false;
    this.risen = false;
    this.isReady = false;
    this.isRose = false;
    this.isChasing = false;
    this.isAttacking = false;
    this.isInChasingScope = false;
    this.hasLineOfSight = false;
    this.hasLastKnownHeroPosition = false;
    this.isListeningCrow = false;
    this.isTakingDamage = false;

    //Movement
    this.speed = 96;
    this.arrived = true;
    this.direction = 'DOWN';
    this.originalPositionX;
    this.originalPositionY;
    this.lastKnownHeroPosition = {
      x: 0,
      y: 0,
    };
    this.chasingPosition = {
      x: this.game.hero.position.x,
      y: this.game.hero.position.y,
    };

    //Timers
    this.knockdownTimer = 100;
    this.isInKnockdown = false;

    this.roseCollectionTimer = 0;
    this.roseCollectionTimeout = 5000;

    //Scopes
    this.collisionScope = {
      x: 0,
      y: 0,
      radius: HALF_TILE_SIZE - 1,
      isRose: false,
    };

    this.activationScope = {
      x: 0,
      y: 0,
      radius: 9 * TILE_SIZE,
    };

    this.interactionScope = {
      x: 0,
      y: 0,
      radius: HALF_TILE_SIZE + 4,
    };

    this.attackScope = {
      x: 0,
      y: 0,
      radius: HALF_TILE_SIZE,
    };

    //Visual
    this.isOnScreen = false;
    this.maxFrameRise = 13;
    this.maxFrameWalking = 3;
    this.maxFrameDying = 7;
    this.sprite.y = 17;
    this.sprite.x = -1; //-1 kako bi sakrili zombija, da je 0 videli bi crticu
    this.hasShadow = true;

    //Initialization
    this.spotPointsTiles = this.game.world.spotPointsTiles;

    //Audio
    this.rising = new Howl({
      src: [risingURL],
      volume: 0.05,
      rate: 0.8,
    });
    this.dying = new Howl({
      src: [dyingURL],
      volume: 0.04,
      rate: 0.5,
    });
    this.burst = new Howl({
      src: [burstURL],
      volume: 0.05,
      rate: 0.8,
    });
    this.expire = new Howl({
      src: [expireURL],
      volume: 0.05,
    });
    this.glow = new Howl({
      src: [glowURL],
      volume: 0.025,
    });

    this.zombieSoundEffects = [
      this.rising,
      this.dying,
      this.burst,
      this.expire,
      this.glow,
    ];
  }

  //Activation
  activate() {
    if (
      this.game.demon.currentStage < 0 &&
      this.game.isNight &&
      this.game.checkCircleCollision(
        this.activationScope,
        this.game.hero.collisionScope
      )[0]
    ) {
      this.isActivated = true;
    }
  }

  rise() {
    //Grabbing the edge - Demon fight
    if (this.game.demon.currentStage > -1) {
      this.position.y = 88 * TILE_SIZE + 4;
    }

    if (this.isActivated) {
      if (this.game.spriteUpdate) {
        if (this.sprite.x < this.maxFrameRise) {
          this.sprite.x++;
        } else {
          this.sprite.y = 2;
          this.sprite.x = 0;

          this.risen = true;
        }
      }

      if (
        this.sprite.x === 0 &&
        this.game.checkCircleCollision(this.collisionScope, {
          x: this.game.hero.position.scopeX,
          y: this.game.hero.position.scopeY,
          radius: this.game.hero.torchScope.radius * 2,
        })[0] &&
        !this.rising.playing() &&
        !this.game.zombies.some(zombie => zombie.rising.playing())
      ) {
        this.rising.play();
      }
    }
  }

  //Movement
  randomizeDirection() {
    if (this.direction === 'RIGHT') {
      if (Math.random() <= 0.33) {
        this.direction = 'LEFT';
      } else if (Math.random() > 0.33 && Math.random() <= 0.66) {
        this.direction = 'UP';
      } else {
        this.direction = 'DOWN';
      }
    } else if (this.direction === 'LEFT') {
      if (Math.random() <= 0.33) {
        this.direction = 'RIGHT';
      } else if (Math.random() > 0.33 && Math.random() <= 0.66) {
        this.direction = 'UP';
      } else {
        this.direction = 'DOWN';
      }
    } else if (this.direction === 'UP') {
      if (Math.random() <= 0.33) {
        this.direction = 'DOWN';
      } else if (Math.random() > 0.33 && Math.random() <= 0.66) {
        this.direction = 'LEFT';
      } else {
        this.direction = 'RIGHT';
      }
    } else if (this.direction === 'DOWN') {
      if (Math.random() <= 0.33) {
        this.direction = 'UP';
      } else if (Math.random() > 0.33 && Math.random() <= 0.66) {
        this.direction = 'LEFT';
      } else {
        this.direction = 'RIGHT';
      }
    }
  }

  calculateChasingPosition() {
    ///////////////////////
    // !this.nearObstacleTiles.some(
    //   tile => nextX === tile.x && nextY === tile.y
    // ) &&
    ///////////////////////
    if (
      this.direction === 'LEFT' &&
      !this.game.hero.nearObstacleTiles.some(
        tile =>
          this.game.hero.position.x + TILE_SIZE === tile.x &&
          this.game.hero.position.y === tile.y
      )
    ) {
      this.chasingPosition.x = Math.round(
        this.game.hero.position.x + TILE_SIZE
      );
      this.chasingPosition.y = Math.round(this.game.hero.position.y);
    } else if (
      this.direction === 'RIGHT' &&
      !this.game.hero.nearObstacleTiles.some(
        tile =>
          this.game.hero.position.x - TILE_SIZE === tile.x &&
          this.game.hero.position.y === tile.y
      )
    ) {
      this.chasingPosition.x = Math.round(
        this.game.hero.position.x - TILE_SIZE
      );
      this.chasingPosition.y = Math.round(this.game.hero.position.y);
    } else if (
      this.direction === 'DOWN' &&
      !this.game.hero.nearObstacleTiles.some(
        tile =>
          this.game.hero.position.x === tile.x &&
          this.game.hero.position.y - TILE_SIZE === tile.y
      )
    ) {
      this.chasingPosition.x = Math.round(this.game.hero.position.x);
      this.chasingPosition.y = Math.round(
        this.game.hero.position.y - TILE_SIZE
      );
    } else if (
      this.direction === 'UP' &&
      !this.game.hero.nearObstacleTiles.some(
        tile =>
          this.game.hero.position.x === tile.x &&
          this.game.hero.position.y + TILE_SIZE === tile.y
      )
    ) {
      this.chasingPosition.x = Math.round(this.game.hero.position.x);
      this.chasingPosition.y = Math.round(
        this.game.hero.position.y + TILE_SIZE
      );
    }
  }

  //Combat
  handleCombat(deltaTime) {
    //Knockdown timer
    if (this.isReady && this.isAlive) {
      if (this.knockdownTimer < this.knockdownTimeout) {
        this.knockdownTimer += deltaTime;
        this.isInKnockdown = true;
      } else {
        this.isInKnockdown = false;
      }
    }

    //Triggering attack - chasing position reached
    if (this.checkIfOnChasingPosition()) {
      this.isAttacking = true;
      this.game.hero.isRolling = false;

      if (this.game.spriteUpdate) {
        this.attackScope.radius += 2;
      }

      //Zombie getting hit
      if (this.game.hero.currentWeapon.name !== 'scythe') {
        if (
          this.checkIsFaceToFace() &&
          this.attackScope.radius < this.game.hero.attackScope.radius
        ) {
          if (this.game.spriteUpdate) {
            this.isTakingDamage = true;
            this.health -= this.game.hero.currentWeapon.damage - this.defence;
            this.knockdownTimer = 0;
            this.game.hero.attackScope.radius = this.attackScope.radius; //To prevent double damage until spriteUpdate
            this.attackScope.radius = HALF_TILE_SIZE; //Reseting zombie att scope

            if (this.game.hero.currentWeapon.name === 'shovel') {
              this.game.hero.shovelHit.play();
            } else if (this.game.hero.currentWeapon.name === 'hammer') {
              this.game.hero.hammerHit.play();
            } else if (this.game.hero.currentWeapon.name == 'axe') {
              this.game.hero.axeHit.play();
            }
          }
        } else {
          this.isTakingDamage = false;
        }
      } else {
        if (
          !this.checkIsBehined() &&
          this.attackScope.radius < this.game.hero.attackScope.radius
        ) {
          if (this.game.spriteUpdate) {
            this.isTakingDamage = true;
            this.health -= this.game.hero.currentWeapon.damage - this.defence;
            this.knockdownTimer = 0;
            this.game.hero.attackScope.radius = this.attackScope.radius;
            this.attackScope.radius = HALF_TILE_SIZE;
            this.game.hero.scytheHit.play();
          }
        } else {
          this.isTakingDamage = false;
        }
      }

      //Hero getting hit
      if (
        this.checkIsFaceToFace() &&
        this.attackScope.radius > this.game.hero.attackScope.radius &&
        !this.isInKnockdown
      ) {
        if (!this.game.godMode) {
          if (this.game.spriteUpdate) {
            this.game.hero.isTakingDamage = true;
            this.game.hero.health -= this.damage;
          }
        }
      } else if (
        !this.checkIsFaceToFace() &&
        !this.isInKnockdown &&
        (this.game.hero.currentWeapon.name === 'scythe' &&
        this.direction !== this.game.hero.direction
          ? this.attackScope.radius > this.game.hero.attackScope.radius
          : 1)
      ) {
        if (!this.game.godMode) {
          if (this.game.spriteUpdate) {
            this.game.hero.isTakingDamage = true;
            this.game.hero.health -= this.damage;
          }
        }
      } else {
        this.game.hero.isTakingDamage = false;
      }
    } else {
      this.isAttacking = false;
    }
  }

  //Actions
  animateActions() {
    if (this.game.pathFindingQueue.includes(this)) {
      this.sprite.y = -1; //Invisible while finding path
    } else {
      if (!this.isTakingDamage && !this.isAttacking) {
        //Walk
        if (this.direction === 'UP') {
          this.sprite.y = 3;
        } else if (this.direction === 'DOWN') {
          this.sprite.y = 2;
        } else if (this.direction === 'LEFT') {
          this.sprite.y = 1;
        } else if (this.direction === 'RIGHT') {
          this.sprite.y = 0;
        }
      } else if (this.isAttacking && !this.isTakingDamage) {
        //Attack
        if (this.sprite.x === 0) {
          this.attackScope.radius = HALF_TILE_SIZE;
        }

        if (this.direction === 'UP') {
          this.sprite.y = 7;
        } else if (this.direction === 'DOWN') {
          this.sprite.y = 6;
        } else if (this.direction === 'LEFT') {
          this.sprite.y = 5;
        } else if (this.direction === 'RIGHT') {
          this.sprite.y = 4;
        }
      } else if (this.isTakingDamage) {
        //Taking damage
        if (this.direction === 'UP') {
          this.sprite.y = 11;
        } else if (this.direction === 'DOWN') {
          this.sprite.y = 10;
        } else if (this.direction === 'LEFT') {
          this.sprite.y = 9;
        } else if (this.direction === 'RIGHT') {
          this.sprite.y = 8;
        }
      }

      //Update animation sprite
      if (this.risen) {
        if (this.game.spriteUpdate) {
          if (this.sprite.x < this.maxFrameWalking) {
            this.sprite.x++;
          } else {
            this.sprite.x = 0;
          }
        }
      }
    }
  }

  handleActions(scaledSpeed, deltaTime, ctx) {
    let distance;

    if (this.isChasing || this.isListeningCrow) {
      this.updateOrientation();
    }

    if (this.isInChasingScope && this.hasLineOfSight && !this.isRose) {
      //1. CHASING HERO
      //State
      this.isChasing = true;
      this.isListeningCrow = false;

      //PF Reset
      this.resetPathFindingData(this.game.pathFindingQueue);

      //Move
      this.speed = this.chasingSpeed;
      this.calculateChasingPosition();

      //Collsiion check
      if (!this.checkIfOnChasingPosition())
        this.handleCollision([
          ...this.game.zombiesInInteractionScopes,
          ...this.game.hero.nearObstacleScopes,
        ]);

      //Chasing position reservation
      for (let i = 0; i < this.game.zombies.length; i++) {
        const zombie = this.game.zombies[i];

        if (
          this.isInChasingScope &&
          zombie.isInChasingScope &&
          this !== zombie &&
          zombie.chasingPosition.x === this.chasingPosition.x &&
          zombie.chasingPosition.y === this.chasingPosition.y &&
          this.game.checkCircleCollision(
            this.collisionScope,
            this.game.hero.collisionScope
          )[1] <=
            this.game.checkCircleCollision(
              zombie.collisionScope,
              this.game.hero.collisionScope
            )[1]
        ) {
          !this.checkIfOnChasingPosition()
            ? (zombie.speed = 32)
            : (zombie.speed = zombie.chasingSpeed);
        }
      }

      //To close to hero guard clause
      for (let i = 0; i < this.game.zombiesInCombat.length; i++) {
        const zombie = this.game.zombiesInCombat[i];

        if (
          this !== zombie &&
          zombie.position.x === this.chasingPosition.x &&
          zombie.position.y === this.chasingPosition.y &&
          this.game.checkCircleCollision(
            this.collisionScope,
            this.game.hero.collisionScope
          )[1] <=
            TILE_SIZE * 2
        ) {
          return;
        }
      }

      //Calculating Last Known Position
      if (this.game.hero.arrived) {
        this.lastKnownHeroPosition.x = this.game.moveToGrid(
          this.game.hero.position.x
        );
        this.lastKnownHeroPosition.y = this.game.moveToGrid(
          this.game.hero.position.y
        );
      }
      this.hasLastKnownHeroPosition = true;

      distance = this.moveTowards(this.chasingPosition, scaledSpeed);
      this.destinationPosition.x = this.position.x;
      this.destinationPosition.y = this.position.y;

      //Combat
      this.handleCombat(deltaTime);

      //Growl
      if (
        Math.random() < 0.05 &&
        !this.growl.playing() &&
        !this.game.zombies.some(zombie => zombie.growl.playing())
      ) {
        Math.random() < 0.5 ? this.growl.rate(0.8) : this.growl.rate(0.9);
        this.growl.play();
      }
    } else if (
      this.hasLastKnownHeroPosition &&
      !this.hasLineOfSight &&
      !this.checkIfOnLastKnownPosition()
    ) {
      //2. GOING TO LKP

      //State
      this.isChasing = false;
      this.isListeningCrow = false;

      //PF Reset
      this.resetPathFindingData(this.game.pathFindingQueue);

      //Move
      this.speed = this.chasingSpeed;
      distance = this.moveTowards(this.lastKnownHeroPosition, scaledSpeed);

      this.destinationPosition.x = this.position.x;
      this.destinationPosition.y = this.position.y;
    } else if (
      this.pathStart !== 0 &&
      this.pathEnd !== 0 &&
      this.isReady &&
      !this.pathFound
    ) {
      //3. FINDING PATH
      //State
      this.isListeningCrow = true;
      this.isChasing = false;
      this.hasLastKnownHeroPosition = false;

      //Move
      this.speed = 128;
      distance = this.moveTowards(this.pathStart.position, scaledSpeed);
      this.destinationPosition.x = this.position.x;
      this.destinationPosition.y = this.position.y;

      // //Pushing to PFQueue
      if (
        this.position.x === this.pathStart.position.x &&
        this.position.y === this.pathStart.position.y &&
        !this.pathFound &&
        !this.game.pathFindingQueue.includes(this)
      ) {
        this.game.pathFindingQueue.push(this);
      }
      //Triggeing PF
      if (this.game.pathFindingQueue[0] === this) {
        this.findPath(this.spotPointsTiles, this.pathStart, this.pathEnd, ctx);
      }
    } else if (
      this.pathFound &&
      this.isListeningCrow &&
      this.pathIndex < this.path.length
    ) {
      //4. FOLLOWING PATH
      //State
      this.isChasing = false;
      this.hasLastKnownHeroPosition = false;
      this.isListeningCrow = true;
      //Move
      this.speed = 128;
      distance = this.moveTowards(
        this.path[this.pathIndex]?.position,
        scaledSpeed
      );
      this.destinationPosition.x = this.position.x;
      this.destinationPosition.y = this.position.y;

      //Cheking if on Spot point (Path node) and setting next Spot point
      if (
        this.position.x === this.path[this.pathIndex].position.x &&
        this.position.y === this.path[this.pathIndex].position.y
      ) {
        this.pathIndex++;
      }

      //Cheking if path end is reached
      if (
        this.position.x === this.path[this.path.length - 1].position.x &&
        this.position.y === this.path[this.path.length - 1].position.y
      ) {
        this.isListeningCrow = false;
        this.resetPathFindingData(this.game.pathFindingQueue);
      }
    } else {
      //5. FREE ROAM

      //State
      this.hasLastKnownHeroPosition = false;
      this.isChasing = false;
      this.isListeningCrow = false;

      //Move
      this.speed = this.freeRoamSpeed;
      distance = this.moveTowards(this.destinationPosition, scaledSpeed);
    }
    this.arrived = distance <= scaledSpeed;

    if (this.arrived && !this.isAttacking) {
      if (this.direction === 'UP') {
        this.nextY -= TILE_SIZE;
      } else if (this.direction === 'DOWN') {
        this.nextY += TILE_SIZE;
      } else if (this.direction === 'LEFT') {
        this.nextX -= TILE_SIZE;
      } else if (this.direction === 'RIGHT') {
        this.nextX += TILE_SIZE;
      }

      this.nextX = this.game.moveToGrid(this.nextX);
      this.nextY = this.game.moveToGrid(this.nextY);
      const nextCol = this.nextX / TILE_SIZE;
      const nextRow = this.nextY / TILE_SIZE;
      if (
        this.game.world.getTile(
          this.game.world.collisionLayer,
          nextRow,
          nextCol
        ) !== 1
      ) {
        this.destinationPosition.x = this.nextX;
        this.destinationPosition.y = this.nextY;
      } else {
        this.randomizeDirection();
      }
    }
  }

  //Dying
  handleDyingNight() {
    if (!this.isRose) {
      if (this.direction === 'LEFT') {
        this.sprite.y = 13;
      } else if (this.direction === 'RIGHT') {
        this.sprite.y = 12;
      } else if (this.direction === 'UP') {
        this.sprite.y = 15;
      } else if (this.direction === 'DOWN') {
        this.sprite.y = 14;
      }
    }
  }

  animateDyingNight() {
    if (!this.isRose) {
      if (this.game.spriteUpdate) {
        if (this.sprite.x < this.maxFrameDying && this.sprite.y !== 16) {
          this.sprite.x++;
          if (!this.dying.playing()) {
            this.dying.play();
          }
        } else {
          if (this.game.demon.currentStage < 0) {
            this.sprite.y = 16;
            this.burst.play();
            this.isRose = true;
            this.game.stats.zombiesKilled++;
          } else {
            this.markedForDelition = true;

            this.game.deletedGameObjects.push(this);
          }
        }
      }
    }
  }

  handleDyingDay() {
    if (!this.isRose) {
      if (this.direction === 'LEFT') {
        this.sprite.y = 13;
      } else if (this.direction === 'RIGHT') {
        this.sprite.y = 12;
      } else if (this.direction === 'UP') {
        this.sprite.y = 15;
      } else if (this.direction === 'DOWN') {
        this.sprite.y = 14;
      }
    }
  }

  animateDyingDay() {
    if (!this.isRose) {
      if (this.game.spriteUpdate) {
        if (this.sprite.x < this.maxFrameDying) {
          this.sprite.x++;
        } else {
          this.markedForDelition = true;
          this.game.deletedGameObjects.push(this);
        }
      }
    }
  }

  //Rose
  handleRose(deltaTime) {
    //Collection timer
    if (
      this.roseCollectionTimer < this.roseCollectionTimeout &&
      this.game.hero.isAlive
    ) {
      this.roseCollectionTimer += deltaTime;
    } else {
      if (!this.game.zombies.some(zombie => zombie.expire.playing())) {
        this.expire.play();
      }
      this.markedForDelition = true;
      this.game.stats.rosesMissed++;
      this.game.rosesNotCollected.push(this);
      this.game.deletedGameObjects.push(this);
    }

    //Hero-rose collision
    if (
      this.game.checkCircleCollision(
        this.collisionScope,
        this.game.hero.collisionScope
      )[0]
    ) {
      this.game.hero.numRoses++;
      this.game.stats.rosesCollected++;
      if (!this.game.hero.collectRose.playing()) {
        this.game.hero.collectRose.play();
      }
      // this.game.hero.sprite.x = 0;
      this.markedForDelition = true;
      this.game.deletedGameObjects.push(this);

      if (this.game.hourglass.isFound) {
        this.game.hourglass.roseCounter++;
      }
    }
  }

  animateRose() {
    this.sprite.y = 16;

    if (this.game.spriteUpdate) {
      if (this.sprite.x < this.maxFrameWalking) {
        this.sprite.x++;
      } else {
        this.sprite.x = 0;
        if (
          !this.glow.playing() &&
          !this.game.zombies.some(zombie => zombie.glow.playing())
        ) {
          this.glow.play();
          if (!this.game.hero.isAlive) {
            this.glow.stop();
          }
        }
      }
    }
  }

  //Updates
  updateScopes() {
    this.attackScope.x =
      this.interactionScope.x =
      this.activationScope.x =
      this.collisionScope.x =
      this.position.scopeX =
        this.position.x + HALF_TILE_SIZE;
    this.attackScope.y =
      this.interactionScope.y =
      this.activationScope.y =
      this.collisionScope.y =
      this.position.scopeY =
        this.position.y + HALF_TILE_SIZE;
  }

  updateState() {
    //Health
    this.health > 0 ? (this.isAlive = true) : (this.isAlive = false);

    //Checkig if is ready
    if (this.position.y - this.originalPositionY >= TILE_SIZE) {
      this.isReady = true;
    }

    //Next tiles - for free roam
    this.nextX = this.destinationPosition.x;
    this.nextY = this.destinationPosition.y;
  }

  updateSpriteSource() {
    this.sprite.image = document.getElementById(
      `zombie-sprite-${this.type}-${this.isTakingDamage}`
    );
  }

  updateOrientation() {
    let chasingAngle;

    if (this.isChasing) {
      let chasingDistanceX = Math.floor(
        this.game.hero.position.x + HALF_TILE_SIZE - this.collisionScope.x
      );
      let chasingDistanceY = Math.floor(
        this.game.hero.position.y + HALF_TILE_SIZE - this.collisionScope.y
      );
      chasingAngle = Math.atan2(chasingDistanceY, chasingDistanceX);

      if (chasingAngle > 2.355 || chasingAngle < -2.355) {
        this.direction = 'LEFT';
      } else if (chasingAngle > -0.785 && chasingAngle < 0.785) {
        this.direction = 'RIGHT';
      } else if (chasingAngle > 0.785 && chasingAngle < 2.355) {
        this.direction = 'DOWN';
      } else if (chasingAngle > -2.355 && chasingAngle < -0.785) {
        this.direction = 'UP';
      }
    } else if (this.isListeningCrow) {
      let chasingDistanceX = Math.floor(
        this.path[this.pathIndex]?.position.x +
          HALF_TILE_SIZE -
          this.collisionScope.x
      );
      let chasingDistanceY = Math.floor(
        this.path[this.pathIndex]?.position.y +
          HALF_TILE_SIZE -
          this.collisionScope.y
      );
      chasingAngle = Math.atan2(chasingDistanceY, chasingDistanceX);

      if (chasingAngle > 2.355 || chasingAngle < -2.355) {
        this.direction = 'LEFT';
      } else if (chasingAngle > -0.785 && chasingAngle < 0.785) {
        this.direction = 'RIGHT';
      } else if (chasingAngle > 0.785 && chasingAngle < 2.355) {
        this.direction = 'DOWN';
      } else if (chasingAngle > -2.355 && chasingAngle < -0.785) {
        this.direction = 'UP';
      }
    }
  }

  //Helpers
  checkIfOnLastKnownPosition() {
    if (
      this.position.x === this.lastKnownHeroPosition.x &&
      this.position.y === this.lastKnownHeroPosition.y
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkIfOnChasingPosition() {
    if (
      this.isAlive &&
      this.position.x === this.chasingPosition.x &&
      this.position.y === this.chasingPosition.y
    ) {
      return true;
    } else {
      return false;
    }
  }

  checkIsInChasingScope() {
    if (
      this.isReady &&
      this.game.checkCircleCollision(
        this.game.hero.chasingScope,
        this.collisionScope
      )[0] &&
      this.game.hero.isAlive
    ) {
      this.isInChasingScope = true;
    } else {
      this.isInChasingScope = false;
      this.hasLineOfSight = false;
    }
  }

  handleCollision(arr) {
    const obstacleScopes = [
      this.game.hero.isAlive ? this.game.hero.collisionScope : {}, //0?,
      ...arr,
    ];

    if (
      this.isReady &&
      this.isAlive &&
      (this.hasLineOfSight || this.hasLastKnownHeroPosition)
    ) {
      for (let i = 0; i < obstacleScopes.length; i++) {
        const obstacleScope = obstacleScopes[i];

        let [collision, distance, sumOfRadii, distX, distY] =
          this.game.checkCircleCollision(this.collisionScope, obstacleScope);

        if (
          collision &&
          !(
            obstacleScope.x === this.collisionScope.x &&
            obstacleScope.y === this.collisionScope.y
          )
        ) {
          const vectorX = distX / distance; //cosinus
          const vectorY = distY / distance; //sinus

          // if (!vectorX && !vectorY) {
          //   return;
          // }

          if (this.checkIfOnChasingPosition()) {
            //move to if statement
            return;
          }

          this.position.x =
            obstacleScope.x + (sumOfRadii + 1) * vectorX - HALF_TILE_SIZE;

          this.position.y =
            obstacleScope.y + (sumOfRadii + 1) * vectorY - HALF_TILE_SIZE;
        } else {
          this.speed = this.chasingSpeed;
        }
      }
    }
  }

  checkLineOfSight(ctx) {
    if (
      this.game.hero.nearObstacleTiles.some(obstacleScope =>
        this.game.checkRectLineCollision(
          obstacleScope,
          this.collisionScope,
          this.game.hero.collisionScope
        )
      )
    ) {
      this.hasLineOfSight = false;
    } else {
      this.hasLineOfSight = true;
    }
  }

  checkIsFaceToFace() {
    if (this.direction === 'LEFT' && this.game.hero.direction === 'RIGHT') {
      return true;
    } else if (
      this.direction === 'RIGHT' &&
      this.game.hero.direction === 'LEFT'
    ) {
      return true;
    } else if (this.direction === 'UP' && this.game.hero.direction === 'DOWN') {
      return true;
    } else if (this.direction === 'DOWN' && this.game.hero.direction === 'UP') {
      return true;
    } else {
      return false;
    }
  }

  checkIsBehined() {
    if (this.direction === this.game.hero.direction) {
      return true;
    } else {
      return false;
    }
  }

  //TEST/DEBUG
  drawScopes(ctx) {
    if (!this.isActivated) {
      ctx.fillStyle = 'rgba(0,255,255,0.1)';
      ctx.beginPath();
      ctx.arc(
        this.scopeX,
        this.scopeY,
        this.activationScope.radius,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.closePath();
    }

    ctx.beginPath();
    ctx.arc(
      this.attackScope.x,
      this.attackScope.y,
      this.attackScope.radius,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.closePath();

    //draw LOS
    if (this.hasLineOfSight) {
      ctx.beginPath();
      ctx.moveTo(this.collisionScope.x, this.collisionScope.y);
      ctx.lineTo(
        this.game.hero.collisionScope.x,
        this.game.hero.collisionScope.y
      );
      ctx.stroke();
    }
  }

  update(deltaTime, ctx, ctxLight) {
    this.updateState();
    this.updateSpriteSource();
    this.updateScopes();
    this.updateAudioVolume();

    this.checkIsInChasingScope();
    if (this.isInChasingScope) {
      this.checkLineOfSight(ctx);
    }

    //Activate & Rise
    this.activate();

    if (!this.risen) {
      this.rise();
      //Memorial Meadow Compensation
      if (this.game.currentSector === 'Memorial Meadow') {
        this.isReady = true;
        this.destinationPosition.y = this.position.y;
        Math.random() < 0.5
          ? (this.direction = 'RIGHT')
          : (this.direction = 'LEFT');
      }
    }

    //Calculating Path start and Path End
    if (
      this.isReady &&
      this.crowToFollow !== 0 &&
      this.pathStart === 0 &&
      this.pathEnd === 0
    ) {
      this.pathStart = this.findClosestSpotPoint(this.spotPointsTiles);
      this.pathEnd = this.game.hero.findClosestSpotPoint(
        this.game.hero.spotPointsTiles
      );
    }

    if (this.risen) {
      const scaledSpeed = this.speed * (deltaTime / 1000); //Pixels Per Second

      if (this.game.isNight) {
        if (this.isAlive) {
          this.handleActions(scaledSpeed, deltaTime, ctx);
          this.animateActions();
        } else {
          this.handleDyingNight();
          this.animateDyingNight();
        }
      } else {
        this.handleDyingDay();
        this.animateDyingDay();
      }

      //Ruza
      if (this.isRose) {
        this.handleRose(deltaTime);
        this.animateRose();
      }
    }
  }
}

export class Alpha extends Zombie {
  constructor({ game, sprite, position, scale }) {
    super({ game, sprite, position, scale });

    //State
    this.type = 'alpha';

    //Movement
    this.freeRoamSpeed = 48;
    this.chasingSpeed = 64;
    //Combat
    this.damage = 5;
    this.knockdownTimeout = 2500;
    this.defence = 0;
    //Audio
    this.growl = new Howl({
      src: [alphaGrowlURL],
      volume: 0.2,
    });

    this.soundEffects = [this.growl, ...this.zombieSoundEffects];
  }
}

export class Beta extends Zombie {
  constructor({ game, sprite, position, scale }) {
    super({ game, sprite, position, scale });

    //State
    this.type = 'beta';

    //Movement
    this.freeRoamSpeed = 64;
    this.chasingSpeed = 80;
    //Combat
    this.damage = 5;
    this.knockdownTimeout = 2500;
    this.defence = 0;
    //Audio
    this.growl = new Howl({
      src: [betaGrowlURL],
      volume: 0.2,
    });

    this.soundEffects = [this.growl, ...this.zombieSoundEffects];
  }
}
export class Gamma extends Zombie {
  constructor({ game, sprite, position, scale }) {
    super({ game, sprite, position, scale });
    //State
    this.type = 'gamma';

    //Movement
    this.freeRoamSpeed = 32;
    this.chasingSpeed = 48;
    //Combat
    this.damage = 15;
    this.knockdownTimeout = 1500;
    this.defence = 10;
    //Audio
    this.growl = new Howl({
      src: [gammaGrowlURL],
      volume: 0.2,
    });

    this.soundEffects = [this.growl, ...this.zombieSoundEffects];
  }
}
export class Delta extends Zombie {
  constructor({ game, sprite, position, scale }) {
    super({ game, sprite, position, scale });
    //State
    this.type = 'delta';

    //Movement
    this.freeRoamSpeed = 32;
    this.chasingSpeed = 48;
    //Combat
    this.damage = 30;
    this.knockdownTimeout = 1000;
    this.defence = 15;
    //Audio
    this.growl = new Howl({
      src: [deltaGrowlURL],
      volume: 0.2,
    });
    this.soundEffects = [this.growl, ...this.zombieSoundEffects];
  }
}
