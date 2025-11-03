'use strict';
import { UP, DOWN, LEFT, RIGHT, SPACE } from './input.js';
import { GAME_HEIGHT, GAME_WIDTH, HALF_TILE_SIZE, TILE_SIZE } from '../main.js';
import { GameObject } from './gameObject.js';
import { Howl, Howler } from 'howler';
import walkAURL from '../Audio/SFX/Hero/sfx_movement_stairs3a.wav';
import walkBURL from '../Audio/SFX/Hero/sfx_movement_stairs3b.wav';
import sneakAURL from '../Audio/SFX/Hero/sfx_movement_footsteps1a.wav';
import sneakBURL from '../Audio/SFX/Hero/sfx_movement_footsteps1b.wav';
import rollURL from '../Audio/SFX/Hero/sfx_movement_footsteps5.wav';
import shovelHitURL from '../Audio/SFX/Hero/sfx_wpn_punch1.wav';
import hammerHitURL from '../Audio/SFX/Hero/sfx_wpn_punch2.wav';
import axeHitURL from '../Audio/SFX/Hero/sfx_wpn_punch3.wav';
import scytheHitURL from '../Audio/SFX/Hero/sfx_wpn_sword2.wav';
import attackURL from '../Audio/SFX/Hero/sfx_weapon_singleshot1.wav';
import collectRoseURL from '../Audio/SFX/Hero/sfx_coin_cluster5.wav'; //sakupljanje ruze
import putRoseURL from '../Audio/SFX/Hero/sfx_coin_cluster3.wav'; //postavljanje
import refillHealthURL from '../Audio/SFX/Hero/sfx_sounds_powerup1.wav'; //fontane
import useBottleURL from '../Audio/SFX/Hero/sfx_sounds_powerup2.wav'; //fontane
import keyURL from '../Audio/SFX/Hero/sfx_sounds_fanfare3.wav'; //kompletiranje sektora
import saveURL from '../Audio/SFX/Hero/sfx_sounds_fanfare2.wav';
import gateURL from '../Audio/SFX/Hero/sfx_sounds_fanfare1.wav'; //otvaranje kapije
import foundItURL from '../Audio/SFX/Hero/sfx_movement_portal1.wav'; //supe/itemi
// import cycleURL from '../Audio/SFX/Hero/sfx_sounds_interaction22.wav'; //oruzja/itemi - d/s
import interactionInURL from '../Audio/SFX/Hero/sfx_sounds_pause2_in.wav';
import interactionOutURL from '../Audio/SFX/Hero/sfx_sounds_pause2_out.wav';
import useHourglassURL from '../Audio/SFX/Hero/sfx_sounds_interaction8.wav';
import scarecrowDownURL from '../Audio/SFX/Hero/sfx_movement_ladder1a.wav';
import scarecrowUpURL from '../Audio/SFX/Hero/sfx_movement_ladder1b.wav';
import candleURL from '../Audio/SFX/Hero/sfx_coin_double7.wav';
import dieURL from '../Audio/SFX/Hero/sfx_sounds_falling3.wav';
import hintURL from '../Audio/SFX/Hero/Hint_Discovered.wav';
import secretURL from '../Audio/SFX/Hero/Secret_Discovered.wav';

export class Hero extends GameObject {
  constructor({ game, sprite, position, scale }) {
    super({ game, sprite, position, scale });

    this.init();
  }

  init() {
    //State
    this.id = 'hero';
    this.isTakingDamage = false;
    this.canAttack = true;
    this.isAttacking = false;
    this.heroWins = false;

    //Health
    this.health = 100;
    this.maxHealth = 100;
    this.isAlive = true;
    this.isReady = true;

    //Roses
    this.numRoses = 0;
    this.puttingRose = false;
    this.firstRosePut = false;

    //Items/Weapons
    this.weapons = [
      {
        name: 'shovel',
        damage: 25,
        rank: 1,
      },
    ];
    this.currentWeapon = this.weapons[0];
    this.items = [];
    this.currentItem = this.items[0];
    this.hasKey = false;

    //Movement
    /////////// Demon activation postition
    // this.position.x = 92 * TILE_SIZE;
    // this.position.y = 82 * TILE_SIZE;
    /////////////
    this.position.x = 67 * TILE_SIZE;
    this.position.y = 9 * TILE_SIZE;
    this.direction = 'DOWN';
    this.destinationPosition.x = this.position.x;
    this.destinationPosition.y = this.position.y;
    this.speed = 128;
    this.isMoving = false;
    this.movedUp =
      this.movedDown =
      this.movedLeft =
      this.movedRight =
      this.rolled =
      this.sneaked =
        false;
    this.arrived = true;
    this.canMove = false; //Button Hold Timer
    this.canRoll = true; //Roll Timer

    //Npc interaction
    this.isInteractingWithNpc = false;
    this.isGreeted = false;
    this.npc = 0;
    this.name = 'Geezer';
    this.text = [`Demon or not, you're just another corpse waitin' to happen.`];
    this.slides = [];
    this.interactionCounter = 0;
    this.slide = 0;

    //PF&LOS
    this.nearObstacleTiles = [];
    this.nearObstacleScopes = [];

    //Timers
    this.weaponChangeTimer = 201;
    this.weaponChangeInterval = 200;
    this.canChangeWeaponItem = true;

    this.actionTimer = 0;
    this.actionTimeout = 500;
    this.actionUpdate = false;

    this.buttonHoldTimer = 0;
    this.buttonHoldInterval = 50;

    this.rollTimer = 1001;
    this.rollInterval = 1000;

    //Visual
    this.maxFrameWalking = 3;
    this.maxFrameAttack = 2;
    this.maxFrameTakingDamage = 3;
    this.maxFrameIdle = 5;
    this.maxFrameRoll = 5;
    this.maxFrameWinShovel = 2;
    this.maxFrameWinIdle = 5;
    this.maxFrameDying = 15;
    this.hasShadow = true;

    //Scopes
    this.collisionScope = {
      x: 0,
      y: 0,
      radius: HALF_TILE_SIZE,
    };

    this.interactionScope = {
      x: 0,
      y: 0,
      radius: 3 * TILE_SIZE,
    };

    this.chasingScope = {
      x: 0,
      y: 0,
      radius: 5 * TILE_SIZE,
    };

    this.attackScope = {
      x: 0,
      y: 0,
      radius: HALF_TILE_SIZE,
    };

    this.torchScope = {
      x: 0,
      y: 0,
      radius: 4 * TILE_SIZE,
    };

    //Audio
    this.walkA = new Howl({
      src: [walkAURL],
      volume: 0.1,
      loop: false,
    });
    this.walkB = new Howl({
      src: [walkBURL],
      volume: 0.1,
      loop: false,
    });
    this.sneakA = new Howl({
      src: [sneakAURL],
      volume: 0.03,
      loop: false,
    });
    this.sneakB = new Howl({
      src: [sneakBURL],
      volume: 0.03,
      loop: false,
    });
    this.roll = new Howl({
      src: [rollURL],
      volume: 0.2,
      loop: false,
    });
    this.attack = new Howl({
      src: [attackURL],
      volume: 0.05,
      loop: false,
    });
    this.shovelHit = new Howl({
      src: [shovelHitURL],
      volume: 0.175,
      loop: false,
    });
    this.hammerHit = new Howl({
      src: [hammerHitURL],
      volume: 0.175,
      loop: false,
    });
    this.axeHit = new Howl({
      src: [axeHitURL],
      volume: 0.175,
      loop: false,
    });
    this.scytheHit = new Howl({
      src: [scytheHitURL],
      volume: 0.1,
      loop: false,
    });
    this.collectRose = new Howl({
      src: [collectRoseURL],
      volume: 0.1,
      loop: false,
    });
    this.putRose = new Howl({
      src: [putRoseURL],
      volume: 0.1,
      loop: false,
    });
    this.refillHealth = new Howl({
      //Fade out??
      src: [refillHealthURL],
      volume: 0.05,
      loop: false,
    });
    this.useBottle = new Howl({
      src: [useBottleURL],
      volume: 0.05,
      loop: false,
    });
    this.useHourglass = new Howl({
      src: [useHourglassURL],
      volume: 0.15,
      rate: 0.6,
      loop: false,
    });
    this.candle = new Howl({
      src: [candleURL],
      volume: 0.1,
      loop: false,
    });
    this.scarecrowUp = new Howl({
      src: [scarecrowUpURL],
      volume: 0.3,
      rate: 0.5,
      loop: true,
    });
    this.scarecrowDown = new Howl({
      src: [scarecrowDownURL],
      volume: 0.3,
      rate: 0.5,
      loop: true,
    });
    this.key = new Howl({
      src: [keyURL],
      volume: 0.05,
      loop: true,
    });
    this.save = new Howl({
      src: [saveURL],
      volume: 0.1,
      loop: true,
    });
    this.gate = new Howl({
      src: [gateURL],
      volume: 0.05,
      loop: false,
    });
    this.foundIt = new Howl({
      src: [foundItURL],
      volume: 0.1,
      loop: false,
    });
    // this.cycle = new Howl({
    //   src: [cycleURL],
    //   volume: 0.1,
    //   loop: false,
    // });
    this.interactionIn = new Howl({
      src: [interactionInURL],
      volume: 0.1,
      loop: false,
    });
    this.interactionOut = new Howl({
      src: [interactionOutURL],
      volume: 0.1,
      loop: false,
    });
    this.die = new Howl({
      src: [dieURL],
      volume: 0.2,
      rate: 0.5,
      loop: false,
    });
    this.hint = new Howl({
      src: [hintURL],
      volume: 0.7,

      loop: false,
    });

    this.secret = new Howl({
      src: [secretURL],
      volume: 0.7,
      loop: false,
    });

    this.soundEffects = [
      this.walkA,
      this.walkB,
      this.sneakA,
      this.sneakB,
      this.roll,
      this.attack,
      this.shovelHit,
      this.hammerHit,
      this.axeHit,
      this.scytheHit,
      this.collectRose,
      this.putRose,
      this.refillHealth,
      this.useBottle,
      this.useHourglass,
      this.candle,
      this.scarecrowUp,
      this.scarecrowDown,
      this.key,
      this.save,
      this.gate,
      this.foundIt,
      this.interactionIn,
      this.interactionOut,
      this.die,
      // this.cycle,
    ];
  }

  //Animations
  animateDying() {
    this.sprite.y = 28;

    if (this.game.spriteUpdate) {
      if (this.sprite.x < this.maxFrameDying) {
        this.sprite.x++;
        if (!this.die.playing() && this.sprite.x === 8) {
          this.die.play();
        }
      } else {
        this.game.gameOver = true;
        this.game.ui.gameOverMenu.isVisible = true;
      }
    }
  }

  animateIdle() {
    if (this.direction === 'UP') {
      this.sprite.y = 3;
    } else if (this.direction === 'DOWN') {
      this.sprite.y = 2;
    } else if (this.direction === 'LEFT') {
      this.sprite.y = 1;
    } else if (this.direction === 'RIGHT') {
      this.sprite.y = 0;
    }

    if (this.game.spriteUpdate) {
      if (this.sprite.x < this.maxFrameIdle) {
        this.sprite.x++;
      } else {
        this.sprite.x = 0;
      }
    }
  }

  animateWalking() {
    if (this.direction === 'UP') {
      this.sprite.y = 7;
    } else if (this.direction === 'DOWN') {
      this.sprite.y = 6;
    } else if (this.direction === 'LEFT') {
      this.sprite.y = 5;
    } else if (this.direction === 'RIGHT') {
      this.sprite.y = 4;
    }

    if (this.game.spriteUpdate) {
      if (this.sprite.x < this.maxFrameWalking) {
        this.sprite.x++;
      } else {
        this.sprite.x = 0;
      }

      if (this.sprite.x === 0) {
        this.walkA.play();
      }

      if (this.sprite.x === 2) {
        this.walkB.play();
      }
    }
  }

  animateRoll() {
    if (this.direction === 'UP') {
      this.sprite.y = 19;
    } else if (this.direction === 'DOWN') {
      this.sprite.y = 18;
    } else if (this.direction === 'LEFT') {
      this.sprite.y = 17;
    } else if (this.direction === 'RIGHT') {
      this.sprite.y = 16;
    }

    if (this.game.spriteUpdate) {
      if (this.sprite.x < this.maxFrameRoll) {
        this.sprite.x++;
        if (this.sprite.x === 2) {
          this.roll.play();
        }
      } else {
        this.sprite.x = 0;
        this.isRolling = false;
      }
    }
  }

  animateAttack() {
    if (this.direction === 'UP') {
      this.sprite.y = 23;
    } else if (this.direction === 'DOWN') {
      this.sprite.y = 22;
    } else if (this.direction === 'LEFT') {
      this.sprite.y = 21;
    } else if (this.direction === 'RIGHT') {
      this.sprite.y = 20;
    }

    if (this.game.spriteUpdate) {
      if (this.sprite.x < this.maxFrameAttack) {
        this.sprite.x++;
        if (this.sprite.x === 1 /*&& !this.game.zombiesInCombat.length*/) {
          if (this.attack.playing()) {
            this.attack.stop();
          }
          this.attack.play();
        }

        this.attackScope.radius -= 2;
      } else {
        // this.sprite.x = 0; //Does not loop - reset by mashing button c
        this.isAttacking = false;
        this.attackScope.radius = HALF_TILE_SIZE;
      }
    }
  }

  animateSneaking() {
    if (!this.isMoving) {
      if (this.direction === 'UP') {
        this.sprite.y = 11;
      } else if (this.direction === 'DOWN') {
        this.sprite.y = 10;
      } else if (this.direction === 'LEFT') {
        this.sprite.y = 9;
      } else if (this.direction === 'RIGHT') {
        this.sprite.y = 8;
      }
    } else {
      if (this.direction === 'UP') {
        this.sprite.y = 15;
      } else if (this.direction === 'DOWN') {
        this.sprite.y = 14;
      } else if (this.direction === 'LEFT') {
        this.sprite.y = 13;
      } else if (this.direction === 'RIGHT') {
        this.sprite.y = 12;
      }
    }

    if (this.game.spriteUpdate) {
      if (
        this.sprite.x <
        (this.isMoving ? this.maxFrameWalking : this.maxFrameIdle)
      ) {
        this.sprite.x++;
      } else {
        this.sprite.x = 0;
      }

      if (this.sprite.x === 0 && this.isMoving) {
        this.sneakA.play();
      }

      if (this.sprite.x === 2 && this.isMoving) {
        this.sneakB.play();
      }
    }
  }

  //DEBUG/TEST
  activateGod() {
    this.items = this.game.items;

    // for (let i = 0; i < this.items.length; i++) {
    //   this.items[i].isFound = true;
    //   this.items[i].canBeUsed = true;
    //   this.items[i].isFilled = true;
    //   this.items[i].waterLeft = 50;
    //   this.items[i].healthBoost = 50;
    //   this.items[i].roseCounter = 50;
    //   // // this.items[i].counter = 50
    //   // this.items[i].day = this.loadedData.itemsData[i][8];
    //   // this.items[i].isActivated = this.loadedData.itemsData[i][9];
    //   // this.items[i].canBePlaced = this.loadedData.itemsData[i][10];
    //   // this.items[i].canBePicked = this.loadedData.itemsData[i][11];
    // }
    // this.weapons.push({ name: 'shovel', damage: 25, rank: 1 });
    // this.weapons.push({ name: 'hammer', damage: 35, rank: 2 });
    // this.weapons.push({ name: 'axe', damage: 60, rank: 3 });
    // this.weapons.push({ name: 'scythe', damage: 50, rank: 4 });
    // this.items.sort((a, b) => a.rank - b.rank);
    // this.game.currentSector = 'Murder Field';
    // this.game.graves.forEach(grave => {
    //   if (grave.sector.name !== 'Murder Field') {
    //     grave.isLocked = true;
    //   }
    // });
  }

  drawScope(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.31)';
    ctx.beginPath();
    ctx.arc(
      this.position.scopeX,
      this.position.scopeY,
      this.attackScope.radius,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = 'rgba(255,0,255,0.3)';
    ctx.beginPath();
    ctx.arc(
      this.position.scopeX,
      this.position.scopeY,
      this.chasingScope.radius,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.closePath();

    // this.nearObstacleTiles.forEach(obstacle => {
    //   ctx.fillStyle = 'rgba(255,255,255,0.7)';

    //   ctx.fillRect(obstacle.x, obstacle.y, TILE_SIZE, TILE_SIZE);
    // });
  }

  openGate(gate) {
    gate.isLocked = false;
    this.hasKey = false;
    this.gate.play();
    this.game.level++;
    this.game.stats.gatesOpened++;
    this.game.zombies = [];

    this.game.sectorTracker.push(gate.forSector);
  }

  updateScopes() {
    this.chasingScope.x =
      this.torchScope.x =
      this.interactionScope.x =
      this.attackScope.x =
      this.collisionScope.x =
      this.position.scopeX =
        this.position.x + HALF_TILE_SIZE;
    this.chasingScope.y =
      this.torchScope.y =
      this.interactionScope.y =
      this.attackScope.y =
      this.collisionScope.y =
      this.position.scopeY =
        this.position.y + HALF_TILE_SIZE;

    if (this.game.demon.currentStage < 0) {
      if (this.game.crows.some(crow => crow.isCawing)) {
        this.chasingScope.radius = 10 * TILE_SIZE;
      } else if (this.isSneaking) {
        this.chasingScope.radius = 2.5 * TILE_SIZE;
      } else {
        this.chasingScope.radius = 5 * TILE_SIZE;
      }
    } else {
      this.chasingScope.radius = 25 * TILE_SIZE;
    }
  }

  updateTimers(deltaTime) {
    if (this.actionTimer < this.actionTimeout) {
      this.actionTimer += deltaTime;
      this.actionUpdate = false;
    } else {
      this.actionUpdate = true;
    }

    if (this.weaponChangeTimer < this.weaponChangeInterval) {
      this.canChangeWeaponItem = false;
      this.weaponChangeTimer += deltaTime;
    } else {
      this.canChangeWeaponItem = true;
    }

    if (this.rollTimer < this.rollInterval) {
      this.canRoll = false;
      this.rollTimer += deltaTime;
    } else {
      this.canRoll = true;
    }

    //Moving/rotating - key tap/hold logic
    if (this.game.input.movementKeys.length === 0) {
      this.canMove = false;
    } else if (this.game.input.movementKeys.length > 0) {
      if (this.buttonHoldTimer < this.buttonHoldInterval) {
        this.canMove = false;
        this.buttonHoldTimer += deltaTime;
      } else {
        this.canMove = true;
      }
    }

    if (!this.isMoving) {
      this.buttonHoldTimer = 0;
    }
  }

  updateNearObstacles() {
    this.nearObstacleTiles = this.game.world.collisionTiles.filter(
      obstacle =>
        this.game.checkCircleRectCollision(this.chasingScope, obstacle)[0]
    );

    this.nearObstacleScopes = this.game.world.collisionScopes.filter(
      obstacle => this.game.checkCircleCollision(this.chasingScope, obstacle)[0]
    );
  }

  placeScarecrow(positionX, positionY) {
    this.game.scarecrow.position.x = positionX;
    this.game.scarecrow.position.y = positionY;
    this.game.scarecrow.position.radius = 0;
    this.game.scarecrow.isActivated = true;
    this.game.scarecrow.interactionScopeRadius = 32 * TILE_SIZE;
    this.actionTimer = 0;
    this.game.stats.scarecrowPlaced++;
    this.scarecrowDown.play();
    setTimeout(() => {
      this.scarecrowDown.stop();
    }, this.scarecrowDown.duration() * 1000 * 4);
  }

  interactWithNpc() {
    //Interact with NPC/Demon
    for (let i = 0; i < this.game.npcs.length; i++) {
      const npc = this.game.npcs[i];

      if (
        this.game.checkCircleCollision(
          this.collisionScope,
          npc.interactionScope
        )[0]
      ) {
        if (
          !this.isMoving &&
          !this.isInteractingWithNpc &&
          this.game.input.lastActionKey === 'a' &&
          this.actionUpdate
        ) {
          this.isInteractingWithNpc = true;
          this.npc = npc;
          this.actionTimer = 0;
          this.game.ui.infoText = '';

          this.game.ui.infoTextTimer = 3001;
          this.game.stats.npcInteractions++;

          if (npc.interactionCounter < npc.slides.length - 1) {
            npc.interactionCounter++; //sa -1 na 0, itd

            for (let j = 0; j < this.game.npcsData.length; j++) {
              const npcData = this.game.npcsData[j];
              if (npcData.name === npc.name) {
                npcData.interactionCounter++; //sa -1 na 0, itd
              }
            }
          }
        }

        if (
          this.isInteractingWithNpc &&
          this.game.input.lastActionKey === 'a' &&
          this.actionUpdate
        ) {
          this.actionTimer = 0;

          if (!this.game.heroWins) {
            if (npc.item !== 0) {
              if (npc.name === 'Father Gabriel') {
                if (
                  !npc.item.canBeFound &&
                  !npc.item.isFound &&
                  npc.interactionCounter === 1
                ) {
                  npc.item.canBeFound = true;
                }
              } else if (!npc.item.canBeFound && !npc.item.isFound) {
                npc.item.canBeFound = true;
              }

              if (npc.item.canBeFound) {
                if (npc.name === 'Father Gabriel') {
                  npc.interactionCounter = 1;

                  if (
                    !this.game.ui.journal.secrets.content.includes(
                      npc.secrets[npc.interactionCounter - 1]
                    )
                  ) {
                    this.game.ui.journal.secrets.content.unshift(
                      npc.secrets[npc.interactionCounter - 1]
                    );

                    this.game.ui.journal.secrets.isUnread = true;
                    this.game.ui.journal.lastOption =
                      this.game.ui.journal.secrets;

                    this.game.ui.infoText = 'Secret Discovered!';
                  }
                } else {
                  npc.interactionCounter = 0;
                  if (
                    !this.game.ui.journal.secrets.content.includes(
                      npc.secrets[npc.interactionCounter]
                    )
                  ) {
                    this.game.ui.journal.secrets.content.unshift(
                      npc.secrets[npc.interactionCounter]
                    );
                    this.game.ui.journal.secrets.isUnread = true;
                    this.game.ui.journal.lastOption =
                      this.game.ui.journal.secrets;

                    this.game.ui.infoText = 'Secret Discovered!';
                  }
                }
              }

              if (npc.item.isFound) {
                if (npc.name === 'Father Gabriel') {
                  npc.interactionCounter = 2;
                } else {
                  npc.interactionCounter = 1;
                }
              }
            } else {
              if (
                npc.hints[npc.interactionCounter] &&
                !this.game.ui.journal.hints.content.includes(
                  npc.hints[npc.interactionCounter]
                )
              ) {
                this.game.ui.journal.hints.content.unshift(
                  npc.hints[npc.interactionCounter]
                );
                this.game.ui.journal.hints.isUnread = true;
                this.game.ui.journal.lastOption = this.game.ui.journal.hints;

                this.game.ui.infoText = 'Hint Acquired!';
              }
            }
          }

          npc.slide++; //sa -1 na 0
          this.interactionIn.play();

          if (npc.slide === npc.slides[npc.interactionCounter].length) {
            //Delay

            if (this.game.ui.infoText !== '')
              setTimeout(() => {
                if (this.game.ui.infoText === 'Hint Acquired!') {
                  this.hint.play();
                } else if (this.game.ui.infoText === 'Secret Discovered!') {
                  this.secret.play();
                }

                this.game.ui.infoTextTimer = 0;
              }, 500);

            this.actionTimer = 0;
            this.interactionIn.stop();
            this.interactionOut.play();
            this.isInteractingWithNpc = false;
            npc.slide = -1;
            this.npc = 0;

            if (!this.isGreeted) {
              this.isGreeted = true;
              this.numRoses = 20;

              //Adding other NPCS
              //reseting npcs array
              this.game.npcs = [];
              //adding npcs
              this.game.addNpcs(this.game.npcsData);
              //avoiding fade in sprite animation
              for (let i = 0; i < this.game.npcs.length; i++) {
                const npc = this.game.npcs[i];
                npc.sprite.y = 0;
              }
              //setting Father Gabriel`s interaction after greeting
              this.game.npcs[0].interactionCounter = 0;

              //Adding First Hint
              this.game.ui.journal.hints.content.unshift(
                this.game.npcs[0].hints[0]
              );
              this.game.ui.journal.hints.isUnread = true;

              this.game.ui.journal.lastOption = this.game.ui.journal.hints;

              this.game.ui.infoText = 'Hint Acquired!';
              this.game.ui.infoTextTimer = 0;

              //Moved, rolled, sneaked
              this.movedUp =
                this.movedDown =
                this.movedLeft =
                this.movedRight =
                this.rolled =
                this.sneaked =
                  true;

              this.game.saveGame();
              // this.game.ui.infoText = 'Game saved!';
              // this.game.ui.infoTextTimer = 0;
              this.game.ui.info.play();
            }

            if (this.game.heroWins) {
              this.game.gameOver = true;
              this.game.isPaused = true;
              this.game.input.actionKeys = [];

              //Final stats formatig
              this.game.stats.realTimeElapsed = this.game.formatTime(
                this.game.stats.realTimeElapsed
              );
              this.game.stats.gameTimeElapsed += ' days';
              this.game.stats.shedsExplored += ' of 3';
              this.game.stats.itemsFound += ' of 4';
              this.game.stats.candlesPlaced += ' of 60';
              this.game.stats.gatesOpened += ' of 4';
              //Triggering stats
              this.game.ui.stats.isVisible = true;
            }
          }
        }
      }
    }
  }

  interactWithDemon(ctx) {
    if (this.game.demon.risen && this.game.demon.currentStage < 0) {
      this.game.demon.splitTextToSlides(ctx, this.game.demon.text, 8, 215);
      this.splitTextToSlides(ctx, this.text, 8, 215);
      if (
        !this.game.isNight &&
        !this.isMoving &&
        !this.isInteractingWithNpc &&
        this.actionUpdate
      ) {
        this.isInteractingWithNpc = true;
        this.npc = this.game.demon;
        this.actionTimer = 0;

        if (
          this.game.demon.interactionCounter <
          this.game.demon.slides.length - 1
        ) {
          this.game.demon.interactionCounter++; //sa -1 na 0, itd
        }
      }

      if (
        this.isInteractingWithNpc &&
        this.game.input.lastActionKey === 'a' &&
        this.actionUpdate
      ) {
        this.actionTimer = 0;
        this.interactionIn.play();
        this.game.demon.slide++; //sa -1 na 0

        if (
          this.game.demon.slide ===
          this.game.demon.slides[this.game.demon.interactionCounter].length
        ) {
          this.npc = this;
          this.actionTimer = 0;
          this.interactionIn.stop();
          this.interactionOut.play();
        } else if (this.npc === this) {
          this.isInteractingWithNpc = false;
          this.npc = 0;
          this.actionTimer = 0;
          this.interactionIn.stop();
          this.interactionOut.play();

          this.game.demon.currentStage = 0;
        }
      }
    }
  }

  handleActions() {
    //Attack
    if (
      !this.isRolling &&
      this.isAlive &&
      this.game.input.lastActionKey === 'c' &&
      this.canAttack &&
      this.isGreeted &&
      !(this.game.demon.health <= 0 && !this.game.camera.onHero) &&
      this.sprite.x > 1
    ) {
      this.sprite.x = 0;
      this.isAttacking = true;
      this.attackScope.radius = TILE_SIZE;
      this.canAttack = false;
      this.game.stats.attacks++;
    }

    //Roll
    if (
      this.game.hero.movedUp &&
      this.game.hero.movedDown &&
      this.game.hero.movedLeft &&
      this.game.hero.movedRight &&
      this.game.hero.sneaked &&
      !this.isRolling &&
      this.isMoving &&
      this.game.input.lastActionKey === 'x' &&
      this.canRoll &&
      this.canMove &&
      !(this.game.demon.health <= 0 && !this.game.camera.onHero)
    ) {
      this.rolled = true;
      this.sprite.x = 0;
      this.isRolling = true;
      this.rollTimer = 0;
      this.game.stats.rolls++;
    }

    //Sneak
    if (
      this.game.hero.movedUp &&
      this.game.hero.movedDown &&
      this.game.hero.movedLeft &&
      this.game.hero.movedRight &&
      this.game.input.lastActionKey === 'z' &&
      !this.isAttacking &&
      !(this.game.demon.health <= 0 && !this.game.camera.onHero)
    ) {
      if (!this.isSneaking) {
        this.game.stats.sneaks++;
      }
      this.isSneaking = true;
      this.sneaked = true;
    } else {
      this.isSneaking = false;
    }
    ///////////////////////////////////////////////////////
    // //Change weapon
    // if (
    //   this.canChangeWeaponItem &&
    //   this.game.input.lastActionKey === 'd' &&
    //   this.weapons.length > 1
    // ) {
    //   let index = this.weapons.indexOf(this.currentWeapon);

    //   if (index < this.weapons.length - 1) {
    //     this.currentWeapon = this.weapons[index + 1];
    //   } else {
    //     this.currentWeapon = this.weapons[0];
    //   }
    //   this.cycle.play();
    //   this.weaponChangeTimer = 0;
    // }

    // //Change item
    // if (
    //   this.canChangeWeaponItem &&
    //   this.game.input.lastActionKey === 's' &&
    //   this.items.length
    // ) {
    //   let index = this.items.indexOf(this.currentItem);
    //   if (index < this.items.length) {
    //     this.currentItem = this.items[index + 1];
    //   } else {
    //     this.currentItem = this.items[0];
    //   }
    //   this.cycle.play();
    //   this.weaponChangeTimer = 0;
    // }
    ///////////////////////////////////////////////////////
    // DAY
    if (!this.game.isNight) {
      //Finding items
      for (let i = 0; i < this.game.items.length; i++) {
        const item = this.game.items[i];

        if (
          this.game.checkCircleCollision(this.collisionScope, {
            x: item.position.scopeX,
            y: item.position.scopeY,
            radius: item.position.radius,
          })[0] &&
          item.canBeFound &&
          !item.isFound &&
          this.game.input.lastActionKey === 'a'
        ) {
          this.actionTimer = 0;
          item.isFound = true;
          item.canBeFound = false;
          this.game.stats.itemsFound++;

          if (!this.items.includes(item)) {
            this.items.push(item);
            this.items.sort((a, b) => a.rank - b.rank);

            this.game.ui.infoText = `${item.name} found!`;
            this.game.ui.infoTextTimer = 0;
            this.foundIt.play();
          }
        }
      }

      //Refill health - fontains
      for (let i = 0; i < this.game.world.fontains.length; i++) {
        const fontain = this.game.world.fontains[i];
        if (
          this.game.checkCircleCollision(this.collisionScope, {
            x: fontain.x + HALF_TILE_SIZE,
            y: fontain.y + TILE_SIZE + HALF_TILE_SIZE,
            radius: fontain.radius,
          })[0]
        ) {
          if (
            this.game.spriteUpdate &&
            !this.isAttacking &&
            !this.isTakingDamage &&
            this.game.input.lastActionKey === 'a'
          ) {
            if (this.health <= 99) {
              this.health++;
              this.game.stats.healthRefilled++;
              this.refillHealth.rate(this.health / 100);

              if (!this.refillHealth.playing()) {
                this.refillHealth.play();
              }
            }
          }
          //Bottle refill
          if (
            !this.game.bottle.isFilled &&
            this.game.bottle.isFound &&
            this.game.input.lastActionKey === '2'
          ) {
            this.useBottle.play();
            this.game.bottle.isFilled = true;
          }
        }
      }

      //Putting a rose
      for (let i = 0; i < this.game.graves.length; i++) {
        const grave = this.game.graves[i];
        if (
          !grave.isLocked &&
          this.position.x === grave.position.x &&
          this.position.y === grave.position.y + TILE_SIZE &&
          this.game.input.lastActionKey === 'a' &&
          this.numRoses > 0
        ) {
          this.puttingRose = true;
          grave.isLocked = true;
          this.firstRosePut = true;

          if (!this.game.godMode) {
            this.numRoses -= 1;
            this.putRose.play();
          }
        }
      }

      //Putting a candle

      for (let i = 0; i < this.game.graves.length; i++) {
        const grave = this.game.graves[i];
        if (
          !grave.hasCandle &&
          this.position.x === grave.position.x &&
          this.position.y ===
            (grave.sector.name === 'Memorial Meadow'
              ? grave.position.y - TILE_SIZE
              : grave.position.y - 2 * TILE_SIZE) &&
          this.game.input.lastActionKey === '1' &&
          this.game.candles.counter > 0 &&
          this.game.candles.isFound
        ) {
          grave.hasCandle = true;
          this.candle.play();
          this.game.candles.counter--;
          this.game.stats.candlesPlaced++;

          if (grave.sector.name === 'Memorial Meadow') {
            this.game.world.lightSources.push({
              x: grave.position.x,
              y: grave.position.y,
              radius: 48,
              blinkingRadius: 0, //falsy
              isCandle: true,
            });
          } else {
            this.game.world.lightSources.push({
              x: grave.position.x,
              y: grave.position.y - TILE_SIZE,
              radius: 48,
              blinkingRadius: 0, //falsy
              isCandle: true,
            });
          }
        }
      }
      //All candles used
      if (this.game.candles.counter < 1) {
        this.items.splice(this.items.indexOf(this.game.candles), 1);
      }

      //Scarecrow
      if (
        this.actionUpdate &&
        this.game.scarecrow.isFound &&
        !this.isMoving &&
        !this.game.scarecrow.isActivated &&
        !this.game.npcs.some(
          npc =>
            this.game.checkCircleCollision(
              this.collisionScope,
              npc.interactionScope
            )[0]
        )
      ) {
        if (
          this.direction === 'UP' &&
          this.game.world.walkableTiles.some(
            tile =>
              this.position.x === tile.x &&
              this.position.y - TILE_SIZE === tile.y
          ) &&
          !(
            this.position.x === this.game.demon.position.x &&
            this.position.y - TILE_SIZE === this.game.demon.position.y
          )
        ) {
          this.game.scarecrow.canBePlaced = true;
          if (this.game.input.lastActionKey === '3') {
            this.placeScarecrow(this.position.x, this.position.y - TILE_SIZE);
          }
        } else if (
          this.direction === 'DOWN' &&
          this.game.world.walkableTiles.some(
            tile =>
              this.position.x === tile.x &&
              this.position.y + TILE_SIZE === tile.y
          ) &&
          !(
            this.position.x === this.game.demon.position.x &&
            this.position.y + TILE_SIZE === this.game.demon.position.y
          )
        ) {
          this.game.scarecrow.canBePlaced = true;
          if (this.game.input.lastActionKey === '3') {
            this.placeScarecrow(this.position.x, this.position.y + TILE_SIZE);
          }
        } else if (
          this.direction === 'LEFT' &&
          this.game.world.walkableTiles.some(
            tile =>
              this.position.x - TILE_SIZE === tile.x &&
              this.position.y === tile.y
          ) &&
          !(
            this.position.x - TILE_SIZE === this.game.demon.position.x &&
            this.position.y === this.game.demon.position.y
          )
        ) {
          this.game.scarecrow.canBePlaced = true;

          if (this.game.input.lastActionKey === '3') {
            this.placeScarecrow(this.position.x - TILE_SIZE, this.position.y);
          }
        } else if (
          this.direction === 'RIGHT' &&
          this.game.world.walkableTiles.some(
            tile =>
              this.position.x + TILE_SIZE === tile.x &&
              this.position.y === tile.y
          ) &&
          !(
            this.position.x + TILE_SIZE === this.game.demon.position.x &&
            this.position.y === this.game.demon.position.y
          )
        ) {
          this.game.scarecrow.canBePlaced = true;
          if (this.game.input.lastActionKey === '3') {
            this.placeScarecrow(this.position.x + TILE_SIZE, this.position.y);
          }
        }
      } else {
        this.game.scarecrow.canBePlaced = false;
      }

      if (
        this.game.checkCircleCollision(this.collisionScope, {
          x: this.game.scarecrow.position.scopeX,
          y: this.game.scarecrow.position.scopeY,
          radius: this.game.scarecrow.position.radius,
        })[0]
      ) {
        if (
          !this.isMoving &&
          this.game.scarecrow.isActivated &&
          this.actionUpdate &&
          !this.game.npcs.some(
            npc =>
              this.game.checkCircleCollision(
                this.collisionScope,
                npc.interactionScope
              )[0]
          )
        ) {
          this.game.scarecrow.canBePicked = true;

          if (
            this.game.scarecrow.isFound &&
            this.game.input.lastActionKey === '3'
          ) {
            this.game.scarecrow.isActivated = false;
            this.game.scarecrow.interactionScopeRadius = 0;
            this.actionTimer = 0;
            this.scarecrowUp.play();
            setTimeout(() => {
              this.scarecrowUp.stop();
            }, this.scarecrowUp.duration() * 1000 * 4);
          }
        }
      } else {
        this.game.scarecrow.canBePicked = false;
      }

      //Opening a shed
      for (let i = 0; i < this.game.world.sheds.length; i++) {
        const shed = this.game.world.sheds[i];

        if (
          this.position.x === shed.x &&
          this.position.y === shed.y + TILE_SIZE
        ) {
          if (
            !shed.isExplored &&
            this.game.input.lastActionKey === 'a' &&
            this.currentWeapon.name === 'shovel' &&
            !this.weapons.some(weapon => weapon.name === 'hammer')
          ) {
            this.weapons.push({
              name: 'hammer',
              damage: 35,
              rank: 2,
            });
            this.game.ui.infoText = `Hammer found!`;
            this.game.ui.infoTextTimer = 0;
            this.foundIt.play();
            shed.isExplored = true;
            this.game.weapons.isFound = true;
            this.game.stats.shedsExplored++;
          }
          if (
            !shed.isExplored &&
            this.game.input.lastActionKey === 'a' &&
            this.currentWeapon.name === 'hammer' &&
            !this.weapons.some(weapon => weapon.name === 'axe')
          ) {
            this.weapons.push({
              name: 'axe',
              damage: 50,
              rank: 3,
            });
            this.game.ui.infoText = `Axe found!`;
            this.game.ui.infoTextTimer = 0;
            this.foundIt.play();
            this.game.weapons.isFound = true;
            shed.isExplored = true;
            this.game.stats.shedsExplored++;
          }
          if (
            !shed.isExplored &&
            this.game.input.lastActionKey === 'a' &&
            this.currentWeapon.name === 'axe' &&
            !this.weapons.some(weapon => weapon.name === 'scythe')
          ) {
            this.weapons.push({
              name: 'scythe',
              damage: 60,
              rank: 4,
            });
            this.game.ui.infoText = `Scythe found!`;
            this.game.ui.infoTextTimer = 0;
            this.foundIt.play();
            this.game.weapons.isFound = true;
            shed.isExplored = true;
            this.game.stats.shedsExplored++;
          }

          this.weapons.sort((a, b) => b.rank - a.rank);
          this.currentWeapon = this.weapons[0];
        }
      }

      //Unlocking gates
      for (let i = 0; i < this.game.world.gates.length; i++) {
        const gate = this.game.world.gates[i];

        const gateTile = this.game.world.collisionTiles.find(
          tile => tile.x === gate.x && tile.y === gate.y
        );

        if (!gate.isLocked) {
          this.game.world.collisionLayer[gateTile.index] = 0;

          if (gate.width === 32) {
            this.game.world.collisionLayer[gateTile.index + 1] = 0;
          }
        }

        if (gate.width === 16) {
          if (
            gate.forSector === 'Marquess Alley' &&
            this.position.x === gate.x &&
            this.position.y === gate.y - TILE_SIZE
          ) {
            if (
              this.game.input.lastActionKey === 'a' &&
              this.hasKey &&
              gate.isLocked
            ) {
              this.openGate(gate);
            }
          }
          if (
            gate.forSector === 'Memorial Meadow' &&
            this.position.x === gate.x &&
            this.position.y === gate.y + TILE_SIZE
          ) {
            if (
              this.game.input.lastActionKey === 'a' &&
              this.hasKey &&
              gate.isLocked
            ) {
              this.openGate(gate);
            }
          }
        }
        if (gate.width === 32) {
          if (
            gate.forSector === "Oliver's Gully" &&
            this.position.y === gate.y + TILE_SIZE &&
            (this.position.x === gate.x ||
              this.position.x === gate.x + TILE_SIZE)
          ) {
            if (
              this.game.input.lastActionKey === 'a' &&
              this.hasKey &&
              gate.isLocked
            ) {
              this.openGate(gate);
            }
          }
          if (
            gate.forSector === 'Murder Field' &&
            this.position.y === gate.y - TILE_SIZE &&
            (this.position.x === gate.x ||
              this.position.x === gate.x + TILE_SIZE)
          ) {
            if (
              this.game.input.lastActionKey === 'a' &&
              this.hasKey &&
              gate.isLocked &&
              this.game.level === 4
            ) {
              this.openGate(gate);
            }
          }
        }
      }
    } else {
      //NIGHT
      //Using hourglass
      if (
        this.game.hourglass.isFound &&
        this.game.hourglass.roseCounter >= 50
      ) {
        this.game.hourglass.canBeUsed = true;
        if (this.game.input.lastActionKey === '4') {
          if (this.game.demon.currentStage < 0) {
            this.game.clock = 5.77; //ok?
            this.useHourglass.play();
          } else {
            for (let i = 0; i < this.game.zombies.length; i++) {
              const zombie = this.game.zombies[i];
              zombie.risen = true;
              // this.game.clock = 6; //ok?
              zombie.health = 0;
            }
          }
          this.game.hourglass.roseCounter = 0;
          this.game.stats.hourglassUsed++;
        }
      } else {
        this.game.hourglass.canBeUsed = false;
      }
    }

    //DAY AND NIGHT
    //Bottle
    if (
      this.health < 100 &&
      !this.isAttacking &&
      !this.isTakingDamage &&
      this.game.bottle.isFilled &&
      this.game.bottle.isFound &&
      !(
        this.game.world.fontains.some(
          fontain =>
            this.game.checkCircleCollision(this.collisionScope, {
              x: fontain.x + TILE_SIZE,
              y: fontain.y + TILE_SIZE + HALF_TILE_SIZE,
              radius: fontain.radius,
            })[0]
        ) && !this.game.isNight
      )
    ) {
      this.game.bottle.canBeUsed = true;
      if (this.game.input.lastActionKey === '2') {
        this.game.bottle.isActivated = true;
        this.game.bottle.waterLeft = this.game.bottle.healthBoost;
        this.game.bottle.isFilled = false;
        this.game.stats.bottleUsed++;
        this.useBottle.play();
      }
    } else {
      this.game.bottle.canBeUsed = false;
    }

    if (this.isAlive && this.game.bottle.isActivated) {
      if (this.game.bottle.waterLeft >= 1 && this.health <= 99) {
        if (this.game.spriteUpdate) {
          this.health += 5;
          this.game.bottle.waterLeft -= 5;
          this.game.stats.healthRefilled += 5;

          if (this.health > 100) {
            this.health = 100;
          }
        }
      } else {
        this.game.bottle.isActivated = false;
      }
    }
  }

  handleMovement(deltaTime) {
    let nextX = this.destinationPosition.x;
    let nextY = this.destinationPosition.y;

    const scaledSpeed = this.speed * (deltaTime / 1000); //Pixels Per Second

    const distance = this.moveTowards(this.destinationPosition, scaledSpeed); // Vraca distancu koju igrac mora preci

    this.arrived = distance <= scaledSpeed; // bice true ako je distanca manja od brzine, odnosno ako je u gridu
    //Krece se samo kada imamo pritisnum movement taster ili kada nije stigao na destinaciju
    if (
      (this.game.input.movementKeys.length > 0 || !this.arrived) &&
      !(this.game.demon.currentStage < 0 && this.game.demon.isActivated) &&
      !(this.game.demon.health <= 0 && !this.game.camera.onHero)
    ) {
      this.isMoving = true;
    } else {
      this.isMoving = false;
    }

    if (
      this.arrived &&
      !(this.game.demon.currentStage < 0 && this.game.demon.isActivated) &&
      !(this.game.demon.health <= 0 && !this.game.camera.onHero)
    ) {
      if (this.game.input.lastMovementKey === UP) {
        this.direction = 'UP';
        this.movedUp = true;
        if (this.canMove) nextY -= TILE_SIZE;
      } else if (this.game.input.lastMovementKey === DOWN) {
        this.direction = 'DOWN';
        this.movedDown = true;
        if (this.canMove) nextY += TILE_SIZE;
      } else if (this.game.input.lastMovementKey === LEFT) {
        this.direction = 'LEFT';
        this.movedLeft = true;
        if (this.canMove) nextX -= TILE_SIZE;
      } else if (this.game.input.lastMovementKey === RIGHT) {
        this.direction = 'RIGHT';
        this.movedRight = true;
        if (this.canMove) nextX += TILE_SIZE;
      }

      //Handling collision
      //1. Priveravamo koji su red i kolona sledeceg tilea
      //2. Azuriramo destination poziciju samo ukoliko sledeci tile nije oznacen kao 1
      //3. U suprotnom destinationPosition ce ostati nepromenjene u sledecem frame-u

      const nextCol = nextX / TILE_SIZE;
      const nextRow = nextY / TILE_SIZE;

      if (
        ///////////////////////
        // !this.nearObstacleTiles.some(
        //   tile => nextX === tile.x && nextY === tile.y
        // ) &&
        ///////////////////////

        this.game.world.getTile(
          this.game.world.collisionLayer,
          nextRow,
          nextCol
        ) !== 1 &&
        !this.game.zombies.some(
          zombie =>
            ((Math.abs(zombie.position.x - nextX) < TILE_SIZE &&
              Math.abs(zombie.position.y - this.position.y) <= 5) ||
              (Math.abs(zombie.position.y - nextY) < TILE_SIZE &&
                Math.abs(zombie.position.x - this.position.x) <= 5)) &&
            zombie.isReady &&
            zombie.isAlive
        ) &&
        !this.game.npcs.some(
          npc => nextX === npc.position.x && nextY === npc.position.y
        ) &&
        (this.game.demon.currentStage > -1 && this.game.demon.health > 0
          ? !(
              nextX === this.game.demon.position.x &&
              nextY === this.game.demon.position.y
            )
          : 1)
      ) {
        this.destinationPosition.x = nextX;
        this.destinationPosition.y = nextY;
      }
    }
  }

  updateSpriteSource() {
    if (this.isGreeted) {
      if (this.game.isNight) {
        this.sprite.image = document.getElementById(
          `hero-night-${this.currentWeapon.name}-${this.isTakingDamage}`
        );
      } else {
        this.sprite.image = document.getElementById(
          `hero-day-${this.currentWeapon.name}-${this.isTakingDamage}`
        );
      }
    } else {
      this.sprite.image = document.getElementById(`hero-initial`);
    }
  }

  updateState() {
    //Health
    if (this.health > 0) {
      this.isAlive = true;
    } else {
      this.isTakingDamage = false;
      this.isAlive = false;
    }

    //Attack - mashing
    if (this.game.input.actionKeys.indexOf('c') === -1) {
      this.canAttack = true;
    }

    //Rollig - speed and torch radius
    if (this.isRolling) {
      this.speed = 128;
      this.torchScope.radius = 2 * TILE_SIZE;
    } else if (this.isSneaking) {
      this.speed = 32;
      this.torchScope.radius = 4 * TILE_SIZE;
    } else {
      this.speed = 80;
      this.torchScope.radius = 4 * TILE_SIZE;
    }

    //Key
    if (
      this.game.graves.some(
        grave =>
          grave.sector.name === this.game.currentSector && !grave.isLocked
      ) ||
      this.game.currentSector === 'Murder Field'
    ) {
      this.hasKey = false;
    } else {
      this.hasKey = true;
      if (
        !this.game.ui.journal.hints.content.some(
          hint =>
            hint.text[0] ===
            `-Keys: After covering all graves with roses in one area,`
        )
      ) {
        this.game.ui.journal.hints.content.unshift({
          text: [
            `-Keys: After covering all graves with roses in one area,`,
            `you'll receive a key to the next region and your progress`,
            `is saved automatically.`,
          ],
          isUnread: true,
        });
        this.game.ui.journal.hints.isUnread = true;

        this.game.ui.journal.lastOption = this.game.ui.journal.hints;
      }
    }
    if (this.isAlive) {
      if (
        this.game.zombiesInInteractionScopes.length === 0 &&
        this.game.demon.currentStage < 0
      ) {
        this.isTakingDamage = false;
      }
    }
  }

  autoSave() {
    if (this.hasKey) {
      if (!this.game.isSaved) {
        this.game.saveGame();
        this.game.ui.infoText =
          this.game.level === 4
            ? `Gold Key received!`
            : this.game.level === 1
            ? `Key received! Hint Acquired!`
            : `Key received!`;
        this.game.ui.infoTextTimer = 0;
        this.key.play();

        setTimeout(() => {
          this.key.stop();
        }, this.key.duration() * 1000 * 3);
      }
    } else {
      this.game.isSaved = false;
    }
  }

  manualSave() {
    if (
      !this.game.heroWins &&
      this.isGreeted &&
      this.position.x === this.game.world.saveSpot.x &&
      this.position.y === this.game.world.saveSpot.y &&
      !this.game.isNight &&
      this.direction === 'UP'
    ) {
      if (this.game.input.lastActionKey === 'a' && this.actionUpdate) {
        this.game.saveGame();
        this.game.ui.infoText = 'Game saved!';
        this.game.ui.infoTextTimer = 0;

        this.save.play();

        setTimeout(() => {
          this.save.stop();
        }, this.save.duration() * 1000 * 3);

        this.actionTimer = 0;
      }
    }
  }

  activateArena() {
    if (
      this.game.demon.health > 0 &&
      !this.game.world.arena.isActive &&
      this.game.checkRectCollision(
        this.position,
        this.game.world.arena.activationArea
      )
    ) {
      if (!this.game.world.arena.isActivated) {
        this.game.world.collisionLayer = this.game.world.arena.collisionLayer;
        this.game.world.walkableTiles = [];
        this.game.world.generateTiles(this.game.world.arena.collisionLayer);
        this.game.world.arena.isActivated = true;
      }
    }
  }

  activateDemon() {
    if (
      this.game.world.arena.isActive &&
      !this.game.demon.isActivated &&
      this.game.checkRectCollision(
        this.position,
        this.game.world.arena.demonActivationArea
      )
    ) {
      this.game.demon.isActivated = true;
      this.direction = 'UP';
    }
  }

  update(deltaTime, ctx, ctxTop) {
    this.updateTimers(deltaTime);
    this.updateScopes();
    this.updateNearObstacles();
    this.updateSpriteSource();
    //Update state
    this.updateState();
    //Update audio
    this.updateAudioVolume();

    //Movement and Actions
    if (!this.isInteractingWithNpc && this.isAlive) {
      this.handleMovement(deltaTime);
      this.handleActions();
    }

    //Animate
    if (!this.isAlive) {
      if (!this.game.gameOver) {
        this.animateDying();
      }
    } else {
      if (this.isAttacking) {
        this.animateAttack();
      } else if (this.isRolling) {
        this.animateRoll();
      } else if (this.isSneaking) {
        this.animateSneaking();
      } else if (this.isMoving) {
        this.animateWalking();
      } else if (!this.isMoving) {
        this.animateIdle();
      }
    }

    if (!this.game.isNight) {
      this.activateArena();
      this.activateDemon();
      this.interactWithNpc();
      this.interactWithDemon(ctx); //sets Demon stage to 0 - triggers Boss fight
      this.autoSave();
      this.manualSave();
    }
  }
}
