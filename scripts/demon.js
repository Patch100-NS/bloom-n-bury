'use strict';
import { GameObject } from './gameObject';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  HALF_TILE_SIZE,
  TILE_SIZE,
  WORLD_COLS,
  WORLD_ROWS,
} from '../main.js';
import { LightningBall, LightningBolt, Lightning } from './lightnings.js';
// import risingDemonURL from '../Audio/SFX/Zombies/sfx_sound_mechanicalnoise1.wav';
import risingDemonURL from '../Audio/SFX/Demon/sfx_movement_portal6.wav';
import growlURL from '../Audio/SFX/Demon/sfx_deathscream_alien1.wav';
import flyingURL from '../Audio/SFX/Demon/sfx_sound_vaporizing.wav';
import fadeURL from '../Audio/SFX/Demon/sfx_sound_mechanicalnoise4.wav';
import dyingURL from '../Audio/SFX/Demon/sfx_exp_cluster6.wav';
import burstURL from '../Audio/SFX/Demon/sfx_exp_odd3.wav';

export class Demon extends GameObject {
  constructor({ game, sprite, position, scale }) {
    super({ game, sprite, position, scale });

    this.init();
  }

  init() {
    //State
    this.isActivated = false;
    this.isVisible = false;
    this.risen = false;
    this.health = 10000;
    this.isDying = false;
    this.currentStage = -1;

    //Data
    this.name = 'The Demon';
    this.text = [
      `At last! The old worm crawls to my doorstep! How many nights have I watched you scurry through my kingdom, placing your pitiful roses, defiling my work? How many of my children have you butchered, thinking yourself a hero? I could just wait a while and let time do away with you the good old way, but that would deny me the pleasure of dispatching you myself. And you know what, once I'm done, I might just raise you up like a puppet on a string, have you do my bidding till you rot away and your pitiful bones scatter in the wind. So go on, entertain me. Show me how long a brittle old man can last against a god.`,
    ];
    this.slides = [];
    this.interactionCounter = 0;
    this.slide = 0;

    this.stages = [
      {
        number: 1,
        maxHealth: 10000,
        minHealth: 8000,
        lightningTimeout: 2000,
        zombieTimeout: 1250,
        flyOverTimeout: 10000,
        numZombiesAlpha: 4,
        numZombiesBeta: 3,
        numZombiesGamma: 2,
        numZombiesDelta: 1,
      },
      {
        number: 2,
        maxHealth: 8000,
        minHealth: 6000,
        lightningTimeout: 1750,
        zombieTimeout: 1000,
        flyOverTimeout: 9000,
        numZombiesAlpha: 3,
        numZombiesBeta: 3,
        numZombiesGamma: 2,
        numZombiesDelta: 2,
      },
      {
        number: 3,
        maxHealth: 6000,
        minHealth: 4000,
        lightningTimeout: 1500,
        zombieTimeout: 750,
        flyOverTimeout: 8000,
        numZombiesAlpha: 2,
        numZombiesBeta: 2,
        numZombiesGamma: 3,
        numZombiesDelta: 3,
      },
      {
        number: 4,
        maxHealth: 4000,
        minHealth: 2000,
        lightningTimeout: 1250,
        zombieTimeout: 500,
        flyOverTimeout: 7000,
        numZombiesAlpha: 1,
        numZombiesBeta: 2,
        numZombiesGamma: 3,
        numZombiesDelta: 4,
      },
      {
        number: 5,
        maxHealth: 2000,
        minHealth: 0,
        lightningTimeout: 1000,
        zombieTimeout: 500,
        flyOverTimeout: 6000,
        numZombiesAlpha: 0,
        numZombiesBeta: 0,
        numZombiesGamma: 0,
        numZombiesDelta: 0,
      },
    ];

    //Visual/Animation
    this.maxFrameRise = 19;
    this.maxFrameShooting = 4;
    this.maxFrameDying = 15;
    this.maxFrameFadingIn = 7;
    this.maxFrameFadingOut = 3;
    this.renderFlyingMotionBlur = false;
    this.shakeFactor = 0;
    this.fadingIn = false;
    this.fadingOut = false;

    this.sprite = {
      image: document.getElementById('demon-sprite-false'),
      x: 0,
      y: 6,
      width: 48,
      height: 48,
    };

    //Lightings
    this.lightnings = [];
    this.lightning = 0;
    this.addLightnings(4, 6);
    this.lightningTimer = 0;
    this.nextLightning = true;

    //Fly Over Attack
    this.flyOverSpeed = 320;
    this.flyOverTimer = 0;
    this.flyOver = false;
    this.flyOverEnded = true;

    //Zombies
    this.zombieTimer = 0;
    this.nextZombie = true;
    this.zombiesQueue = [];
    this.zombiesAdded = false;
    this.provisionalPositionX = 107;

    //Scopes
    this.attackScope = {
      x: 0,
      y: 0,
      radius: HALF_TILE_SIZE,
    };

    this.collisionScope = {
      x: 0,
      y: 0,
      radius: HALF_TILE_SIZE - 1,
    };

    //Audio
    this.risingDemon = new Howl({
      src: [risingDemonURL],
      volume: 0.075,
      rate: 0.6,
    });
    this.flying = new Howl({
      src: [flyingURL],
      volume: 0.15,
      rate: 0.6,
    });
    this.fade = new Howl({
      src: [fadeURL],
      volume: 0.05,
      rate: 1,
    });
    this.growl = new Howl({
      src: [growlURL],
      volume: 0.075,
      rate: 1,
    });
    this.dying = new Howl({
      src: [dyingURL],
      volume: 0.2,
      rate: 0.9,
    });
    this.burst = new Howl({
      src: [burstURL],
      volume: 0.2,
      rate: 1,
    });

    this.soundEffects = [
      this.risingDemon,
      this.flying,
      this.fade,
      this.growl,
      this.dying,
      this.burst,
    ];
  }

  rise() {
    this.isVisible = true;
    if (this.game.spriteUpdate) {
      if (this.sprite.x === 0) {
        this.risingDemon.play();
      }
      if (this.sprite.x < this.maxFrameRise) {
        this.sprite.x++;
      } else {
        this.sprite.y = 0;
        this.sprite.x = 0;
        this.risen = true;
      }
    }
  }

  addLightnings(numLightningBalls, numLightningBolts) {
    for (let i = 0; i < numLightningBalls; i++) {
      this.lightnings.push(
        new LightningBall({
          sprite: {
            image: document.getElementById('lightning-ball-sprite'),
            x: 0,
            y: 0,
            width: TILE_SIZE,
            height: TILE_SIZE,
          },
          position: {
            x: 0,
            y: 0,
            width: TILE_SIZE,
            height: TILE_SIZE,
            scopeX: 0,
            scopeY: 0,
          },
          game: this.game,
          scale: 1,
        })
      );
    }
    for (let i = 0; i < numLightningBolts; i++) {
      this.lightnings.push(
        new LightningBolt({
          sprite: {
            image: document.getElementById('lightning-bolt-sprite'),
            x: 2, //smanjujemo broj indikacija
            y: 0,
            width: TILE_SIZE,
            height: GAME_HEIGHT,
          },
          position: { x: 0, y: 0 },
          game: this.game,
          scale: 1,
        })
      );
    }
  }

  getLightning() {
    return this.game
      .shuffleArray(this.lightnings)
      .sort((a, b) => b.isAvailable - a.isAvailable)[0];
    //u sort metodu true values su 1, a false 0, ukoliko arr sortiramo opadajuce (b-a) da prvo idu vece vredosti pa manje, onda cemo prvo dobiti true vrednosti
  }

  shoot() {
    //Animate
    if (this.lightning.type === 'bolt') {
      this.sprite.y = 2;
    } else if (this.lightning.type === 'ball') {
      this.sprite.y = 1;
    }

    if (this.sprite.x === 2) {
      this.lightning.setTarget();
      this.lightning.setStartPoint();
      this.lightning.start();
      if (Math.random() < 0.2) {
        this.growl.rate(1.4);
        this.growl.play();
      }
    }

    if (this.sprite.x < this.maxFrameShooting) {
      if (this.game.spriteUpdate) {
        this.sprite.x++;
      }
    } else {
      this.lightning = 0;
      this.sprite.y = 0;
      this.sprite.x = 0;
    }
  }

  animateDying() {
    this.sprite.y = 7;
    if (this.sprite.x < this.maxFrameDying && !this.game.heroWins) {
      if (this.game.spriteUpdate) {
        if (this.sprite.x === 0) {
          this.growl.rate(0.8);
          this.growl.volume(0.2);
          this.growl.play();
          this.dying.play();
        }

        if (this.sprite.x === 7) {
          this.burst.play();
        }

        this.sprite.x++;
      }
    } else {
      //Game Over - Hero Wins
      if (!this.game.heroWins) {
        //World
        //reset tiles
        this.game.world.collisionLayer = this.game.world.noArenaCollisionLayer;
        this.game.world.walkableTiles = [];
        this.game.world.generateTiles(this.game.world.noArenaCollisionLayer);

        //open gates
        for (let i = 0; i < this.game.world.gates.length; i++) {
          const gate = this.game.world.gates[i];
          gate.isLocked = false;
        }

        //Freeze clock
        this.game.clock = 12;

        //Delete all NPCs exept Gabriel, and move him to Murder Field gate
        for (let i = 0; i < this.game.npcs.length; i++) {
          const npc = this.game.npcs[i];

          if (npc.name !== 'Father Gabriel') {
            this.game.npcs.splice(i, 1);
          } else {
            npc.position.x = 93 * TILE_SIZE;
            npc.position.y = 75 * TILE_SIZE;
            npc.interactionCounter = 3;
          }
        }

        this.game.heroWins = true;
        if (!this.game.isSaved) {
          //Final Save
          this.game.stats.demonsKilled++;
          this.game.saveGame();
          this.game.ui.infoText = 'Congratulations, You Won!';
          this.game.ui.infoTextTimer = 0;
        }
      }
    }
  }

  fadeOut() {
    if (!this.fadingOut) {
      this.sprite.x = 0;
      this.sprite.y = 3;
      this.fadingOut = true;
    }
    if (
      this.fadeOut &&
      this.sprite.y === 3 &&
      this.sprite.x < this.maxFrameFadingOut
    ) {
      if (!this.fade.playing()) {
        this.fade.play();
      }
      if (this.game.spriteUpdate) {
        this.sprite.x++;
      }
    } else {
      this.fadingOut = false;
      this.sprite.x = 0;
      this.sprite.y = 0;
      this.game.clock = 0;
    }
  }

  flyOverAttack(scaledSpeed) {
    this.lightningTimer = 0;
    this.flyOverEnded = false;

    if (!this.fadingOut && !this.fadingIn) {
      this.sprite.x = 0;
      this.sprite.y = 3;
      this.fadingOut = true;
    }

    if (this.fadingOut) {
      if (this.sprite.y === 3 && this.sprite.x < this.maxFrameFadingOut) {
        if (!this.fade.playing()) {
          this.fade.play();
        }
        if (this.game.spriteUpdate) {
          this.sprite.x++;
        }
      } else {
        if (!this.fadingIn) {
          if (!this.renderFlyingMotionBlur) {
            this.position.x = this.game.hero.position.x;
            this.position.y = 65 * TILE_SIZE;
            this.sprite.y = 5;
            this.sprite.x = 0;
            this.renderFlyingMotionBlur = true;
            this.flying.play();
          } else {
            this.moveTowards(
              { x: this.position.x, y: 110 * TILE_SIZE },
              scaledSpeed
            );
            if (
              this.position.x === this.position.x &&
              this.position.y === 110 * TILE_SIZE
            ) {
              this.renderFlyingMotionBlur = false;
              this.sprite.y = 3;
              this.sprite.x = this.maxFrameFadingOut;
              this.position.x = 107 * TILE_SIZE;
              this.position.y = 89 * TILE_SIZE;
              this.fadingIn = true;
            }
          }
        }
      }
    }

    if (this.fadingIn) {
      if (this.sprite.y === 3 && this.sprite.x < this.maxFrameFadingIn) {
        if (!this.fade.playing()) {
          this.fade.play();
        }
        if (this.game.spriteUpdate) {
          this.sprite.x++;
        }
      } else {
        this.flyOverTimer = 0;
        this.flyOverEnded = true;
        this.sprite.x = 0;
        this.sprite.y = 0;
        this.fadingOut = false;
        this.fadingIn = false;
      }
    }
  }

  draw(ctx) {
    if (this.game.debug) {
      ctx.fillStyle = 'rgba(0,0,255,0.2)';
      ctx.fillRect(this.position.x, this.position.y, TILE_SIZE, TILE_SIZE);

      ctx.fillStyle = 'rgb(255, 255, 255)';
      ctx.fillText(this.health, this.position.x, this.position.y - 8);
    }

    if (this.isVisible) {
      if (!this.game.heroWins) {
        if (!this.renderFlyingMotionBlur) {
          // Senka

          ctx.beginPath();
          ctx.ellipse(
            this.position.x + HALF_TILE_SIZE,
            this.position.y + TILE_SIZE - 2,
            10,
            6,
            0,
            0,
            2 * Math.PI
          );
          ctx.fillStyle = 'rgba(27,38,50,0.2)';
          ctx.fill();

          ctx.drawImage(
            this.sprite.image,
            this.sprite.x * this.sprite.width,
            this.sprite.y * this.sprite.height,
            this.sprite.width,
            this.sprite.height,
            this.position.x +
              HALF_TILE_SIZE -
              this.width / 2 +
              Math.trunc(this.shakeFactor * Math.random()),
            this.position.y + TILE_SIZE - this.height * 0.9, //ok?
            this.width,
            this.height
          );
        } else {
          for (let i = 0; i < 20; i++) {
            ctx.save();
            ctx.globalAlpha -= i * 0.05;
            ctx.drawImage(
              this.sprite.image,
              this.sprite.x * this.sprite.width,
              this.sprite.y * this.sprite.height,
              this.sprite.width,
              this.sprite.height,
              this.position.x + HALF_TILE_SIZE - this.width / 2,
              this.position.y + TILE_SIZE - this.height * 0.9 - i * 10, //ok?
              this.width,
              this.height
            );
            ctx.restore();
          }
        }
      }
    }
  }

  updateScopes() {
    this.collisionScope.x =
      this.attackScope.x =
      this.position.scopeX =
        this.position.x + HALF_TILE_SIZE;

    this.collisionScope.y =
      this.attackScope.y =
      this.position.scopeY =
        this.position.y + HALF_TILE_SIZE;
  }

  updateSpriteSource() {
    this.sprite.image = document.getElementById(
      `demon-sprite-${this.isTakingDamage}`
    );
  }

  updateTimers(deltaTime) {
    if (
      this.lightningTimer <
      this.stages[this.currentStage].lightningTimeout /*+ Math.random() * 2000*/
    ) {
      this.lightningTimer += deltaTime;
      this.nextLightning = false;
    } else {
      this.nextLightning = true;
    }

    if (this.zombieTimer < this.stages[this.currentStage].zombieTimeout) {
      this.zombieTimer += deltaTime;
      this.nextZombie = false;
    } else {
      this.nextZombie = true;
    }

    if (this.flyOverTimer < this.stages[this.currentStage].flyOverTimeout) {
      this.flyOverTimer += deltaTime;
      this.flyOver = false;
    } else {
      this.flyOver = true;
    }
  }

  update(deltaTime, ctx, ctxLight) {
    const scaledSpeed = this.flyOverSpeed * (deltaTime / 1000);

    this.updateScopes();
    this.updateSpriteSource();
    this.updateAudioVolume();

    //Rising
    if (this.game.camera.isLocked) {
      if (this.isActivated && !this.risen) {
        this.rise();
      }
    }

    //Active
    if (this.currentStage > -1) {
      //Timers
      this.updateTimers(deltaTime);

      //Day/night - Demon/zombies dynamic
      if (this.health <= this.stages[this.currentStage].minHealth) {
        this.lightningTimer = 0;

        if (this.health > 0) {
          if (
            this.position.x === 107 * TILE_SIZE &&
            this.position.y === 89 * TILE_SIZE
          ) {
            this.fadeOut(); //sets clock to 0
          }
          this.game.numZombies = 10;

          this.game.numZombiesAlpha =
            this.stages[this.currentStage].numZombiesAlpha;
          this.game.numZombiesBeta =
            this.stages[this.currentStage].numZombiesBeta;
          this.game.numZombiesGamma =
            this.stages[this.currentStage].numZombiesGamma;
          this.game.numZombiesDelta =
            this.stages[this.currentStage].numZombiesDelta;

          if (!this.zombiesAdded && this.game.clock === 0) {
            this.position.x = -TILE_SIZE;
            this.position.y = -TILE_SIZE;

            if (!this.game.musicDemonZombies.playing()) {
              this.game.musicDemonZombies.play();
            }

            this.zombiesAdded = true;
          }

          this.zombiesQueue = this.game.zombies.filter(
            zombie => !zombie.isActivated
          );

          if (this.nextZombie && this.zombiesQueue.length > 0) {
            this.zombiesQueue[0].isActivated = true;
            this.zombieTimer = 0;
          }

          if (
            this.game.zombies.length === 0 &&
            this.game.clock > 0 &&
            this.game.clock < 5.77
          ) {
            this.game.clock = 5.77;
            this.flyOverTimer = this.flyOverTimeout;
            this.currentStage++;
            this.zombiesAdded = false;
            this.health = this.stages[this.currentStage].maxHealth;
          }
        } else {
          if (!this.isDying) {
            this.sprite.x = 0;
            this.isDying = true;
          } else {
            this.animateDying();
          }
        }
      }

      //Lightings
      //Getting
      if (this.nextLightning) {
        this.lightning = this.getLightning();
        this.lightningTimer = 0;
        this.isTakingDamage = false;
        // this.shoot();
      }
      //Shooting
      if (
        this.lightning &&
        this.game.clock > 6.5 &&
        this.flyOverEnded &&
        this.health > 0
      ) {
        if (
          this.health > this.stages[this.currentStage].minHealth &&
          this.game.hero.isAlive
        ) {
          this.shoot();
        }
      }

      //Fly Over Attack
      if (this.flyOver) {
        if (
          this.game.hero.isAlive &&
          this.renderFlyingMotionBlur &&
          this.game.checkRectCollision(
            {
              x: this.position.x - TILE_SIZE,
              y: this.position.y - TILE_SIZE,
              width: 3 * TILE_SIZE,
              height: 3 * TILE_SIZE,
            },
            this.game.hero.position
          )
        ) {
          if (!this.game.godMode) {
            this.game.hero.health -= 10; //ok?
          }
          this.game.hero.isTakingDamage = true;
        } else {
          this.game.hero.isTakingDamage = false;
        }
      }

      if (
        this.game.hero.isAlive &&
        !this.nextLightning &&
        this.flyOver &&
        this.game.clock > 6 &&
        this.health > 0
      ) {
        // this.flyOverEnded = false;
        this.flyOverAttack(scaledSpeed);
      }
    }

    //Combat - Demon talking damage
    if (
      this.game.checkCircleCollision(
        this.attackScope,
        this.game.hero.attackScope
      )[0]
    ) {
      if (
        this.game.spriteUpdate &&
        this.attackScope.radius < this.game.hero.attackScope.radius &&
        this.sprite.x === 0 &&
        this.sprite.y === 0
      ) {
        if (this.game.hero.currentWeapon.name !== 'scythe') {
          if (
            (this.game.hero.direction === 'UP' &&
              this.game.hero.position.x === this.position.x) ||
            (this.game.hero.direction === 'RIGHT' &&
              this.game.hero.position.y === this.position.y &&
              this.game.hero.position.x === this.position.x - TILE_SIZE) ||
            (this.game.hero.direction === 'LEFT' &&
              this.game.hero.position.y === this.position.y &&
              this.game.hero.position.x === this.position.x + TILE_SIZE)
          ) {
            this.isTakingDamage = true;

            if (Math.random() < 0.5 && !this.growl.playing()) {
              this.growl.rate(1);
              this.growl.play();
            }

            if (this.game.hero.currentWeapon.name === 'shovel') {
              this.game.hero.shovelHit.play();
              this.shakeFactor = 2;
            } else if (this.game.hero.currentWeapon.name === 'hammer') {
              this.game.hero.hammerHit.play();
              this.shakeFactor = 3;
            } else if (this.game.hero.currentWeapon.name === 'axe') {
              this.game.hero.axeHit.play();
              this.shakeFactor = 4;
            }

            this.health -=
              this.game.hero.currentWeapon.damage; /* - this.defence;*/ //ok?
            // this.knockdownTimer = 0;
            this.game.hero.attackScope.radius = this.attackScope.radius; //to prevent double damage until spriteUpdate
            // this.attackScope.radius = HALF_TILE_SIZE; //Reseting zombie att scope
          }
        } else {
          if (
            !(
              this.game.hero.direction === 'DOWN' &&
              this.game.hero.position.x === this.position.x
            ) &&
            !(
              this.game.hero.direction === 'LEFT' &&
              this.game.hero.position.y === this.position.y &&
              this.game.hero.position.x === this.position.x - TILE_SIZE
            ) &&
            !(
              this.game.hero.direction === 'RIGHT' &&
              this.game.hero.position.y === this.position.y &&
              this.game.hero.position.x === this.position.x + TILE_SIZE
            )
          ) {
            this.isTakingDamage = true;
            this.shakeFactor = 5;
            this.game.hero.scytheHit.play();
            this.health -=
              this.game.hero.currentWeapon.damage; /* - this.defence;*/ //ok?
            // this.knockdownTimer = 0;
            this.game.hero.attackScope.radius = this.attackScope.radius; //to prevent double damage until spriteUpdate
            // this.attackScope.radius = HALF_TILE_SIZE; //Reseting zombie att scope
          }
        }
      }
    } else {
      this.isTakingDamage = false;
      this.shakeFactor = 0;
    }
  }
}
