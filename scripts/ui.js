'use strict';
import {
  GAME_ROWS,
  GAME_COLS,
  TILE_SIZE,
  WORLD_COLS,
  WORLD_ROWS,
  GAME_WIDTH,
  GAME_HEIGHT,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  HALF_TILE_SIZE,
} from '../main.js'; //../ - 2 levels up

import { UP, DOWN, LEFT, RIGHT, SPACE } from './input.js';
import { Howl, Howler } from 'howler';
import toggleURL from '../Audio/SFX/UI/sfx_menu_move1.wav';
import selectURL from '../Audio/SFX/UI/sfx_menu_move2.wav';
import backURL from '../Audio/SFX/UI/sfx_menu_move4.wav';
import welcomeURL from '../Audio/SFX/UI/sfx_menu_select4.wav';
import infoURL from '../Audio/SFX/UI/sfx_sounds_interaction3.wav';

export class Ui {
  constructor(game) {
    this.game = game;

    this.hud = {
      day: document.getElementById('hud-day'),
      night: document.getElementById('hud-night'),
      master: document.getElementById('hud-master'),
      demonMaster: document.getElementById('hud-demon-master'),
      demonHealthFrame: document.getElementById('hud-demon-health-frame'),
      demonIcon: document.getElementById('hud-demon-icon'),
      healthFrame: document.getElementById('hud-health-frame'),
      dialogBox: document.getElementById('hud-dialog'),
      journalOpened: document.getElementById('journal-opened'),
      journalClosed: document.getElementById('journal-closed'),
    };

    this.introScreen = {
      imagePressA: document.getElementById('intro-press-a'),
      imageWarDucks: document.getElementById('war-ducks-intro'),
      isVisible: true,
    };

    this.mainMenu = {
      background: document.getElementById('main-background'),
      logo: document.getElementById('main-logo'),
      flowers: document.getElementById('main-flowers'),
      rose: document.getElementById('main-rose'),
      gravesNewGame: document.getElementById('main-new'),
      gravesContinue: document.getElementById('main-continue'),
      isVisible: false,
      options: [
        { text: 'Continue' },
        { text: 'New Game' },
        { text: 'Settings' },
        { text: 'Credits' },
        { text: 'Quit' },
      ],
      availableOptions: 0,
      selectedOption: 0,
      optionIndex: 0,
    };

    this.pauseMenu = {
      background: document.getElementById('pause-background'),
      isVisible: false,
      options: [
        { text: 'Resume' },
        { text: 'Settings' },
        { text: 'Main Menu' },
      ],
      selectedOption: 0,
      optionIndex: 0,
    };

    this.settingsMain = {
      background: document.getElementById('main-background'),
      logo: document.getElementById('main-logo'),
      flowers: document.getElementById('main-flowers'),
      isVisible: false,
      options: [
        { text: 'Full Screen: ON' },
        { text: 'Sound Effects: ON' },
        { text: 'Music: ON' },
        { text: 'Controls' },
        { text: 'Back' },
      ],
      selectedOption: 0,
      optionIndex: 0,
    };

    this.settingsPause = {
      background: document.getElementById('pause-background'),
      isVisible: false,
      options: [
        { text: 'Full Screen: ON' },
        { text: 'Sound Effects: ON' },
        { text: 'Music: ON' },
        { text: 'Controls' },
        { text: 'Back' },
      ],
      selectedOption: 0,
      optionIndex: 0,
    };

    this.dialogMenu = {
      background: document.getElementById('pause-background'),
      isVisible: false,
      options: [{ text: 'Yes' }, { text: 'No' }],
      selectedOption: 0,
      optionIndex: 0,
    };

    this.gameOverMenu = {
      background: document.getElementById('pause-background'),
      isVisible: false,
      options: [{ text: 'Try Again' }, { text: 'Main Menu' }],
      selectedOption: 0,
      optionIndex: 0,
    };

    this.credits = {
      background: document.getElementById('main-background'),
      logo: document.getElementById('main-logo'),
      logoWarDucks: document.getElementById('war-ducks-logo'),
      flowers: document.getElementById('main-flowers'),
      isVisible: false,
      positionY: 0,
      text: [
        `Thank you for playing!`,
        ``,
        `Developed by:`,
        ` War Ducks Gaming Studio`,
        ``,
        `Programming:`,
        ` Nemanja Stokrp`,
        ``,
        `Visual Design:`,
        ` Aleksandar Rotar`,
        ``,
        `Music:`,
        `Aleksandar Rotar`,
        ``,
        `Narrative and Dialogue:`,
        ` Aleksa Cupic`,
        ``,
        `Visual Asset:`,
        `Based on "Thai Astronomical Manuscripts on Fortune Telling"`,
        `Courtesy of the Wellcome Collection`,
        `Original image via Wikimedia Commons`,
        `Licensed under CC BY 3.0`,
        `Modified version by jojo-ojoj`,
        ``,
        `Sound Effects:`,
        `"512 Sound Effects: 8-bit style" by Juhani Junkala licensed CC0`,
        ``,
        `Audio Engine:`,
        `Powered by Howler.js`,
        `© 2013–2025 James Simpson – howlerjs.com`,
        `Licensed under the MIT License`,
        ``,
        `© 2025 War Ducks Gaming Studio.`,
        `All rights reserved.`,
        `This game and all associated content, including but not limited to artwork,`,
        `characters, dialogue, music, and source code, are the intellectual property`,
        `of War Ducks Gaming Studio. Unauthorized reproduction, distribution, or use`,
        `is strictly prohibited.`,
        ``,
        `Portions of sound design, limited to sound effects,`,
        `may include licensed or public domain material credited accordingly.`,
      ],
    };

    this.stats = {
      background: document.getElementById('main-background'),
      logo: document.getElementById('main-logo'),
      flowers: document.getElementById('main-flowers'),
      arrowUp: document.getElementById('arrow-up-white'),
      arrowDown: document.getElementById('arrow-down-white'),
      isVisible: false,
      text: [
        'Real Time Elapsed:',
        'In Game Time Elapsed:',
        'Saves:',
        'Loads:',
        'NPC Interactions:',
        'Sheds Explored:',
        'Items Found:',
        'Candles Placed:',
        'Scarecrow Placed:',
        'Bottle Used:',
        'Hourglass Used:',
        'Gates Opened:',
        'Health Refilled:',
        'Rolls:',
        'Sneaks:',
        'Attacks:',
        'Crows Activated:',
        'Lightings Deflected:',
        'Zombies Killed:',
        'Roses Collected:',
        'Roses Missed:',
        'Deaths:',
        'Demons Killed:',
      ],
      positionY: 0,
    };

    this.controls = {
      background: document.getElementById('main-background'),
      logo: document.getElementById('main-logo'),
      flowers: document.getElementById('main-flowers'),
      isVisible: false,
      options: [{ text: 'Back' }],
      text: [
        'Arrows.....................Move',
        'Z........................Crouch',
        'X..........................Roll',
        'C........................Attack',
        'A........................Action',
        'J.......................Journal',
        '1-4.......................Items',
        'P.........................Pause',
      ],
      lastMenu: 0,
    };

    this.letter = {
      image: document.getElementById('letter'),
      arrowUp: document.getElementById('arrow-up-black'),
      arrowDown: document.getElementById('arrow-down-black'),
      text: [
        'To the Keeper of the Departed,',
        '',
        'The graveyard is stirring.',
        '',
        'I write to you not as a priest, but as a desperate',
        'man. The dead no longer rest. Each night, they',
        'claw their way back into our world, defying the',
        'peace we swore to grant them. Something',
        'unnatural festers beneath this land, something',
        'I cannot fight alone.',
        '',
        'Many have tried to put an end to this,',
        'gravekeepers, hunters, even men of faith. They',
        'discovered one truth: roses, when placed upon',
        'the graves, keep the dead from rising. But none',
        'have lived long enough to finish the task. I fear',
        'the unrest is no mere curse... but the work of',
        'something greater.',
        '',
        'You, Geezer, have spent your life tending to the',
        'departed, ensuring they remain where they belong.',
        'I ask you now to do what you have always done,',
        'lay them to rest. Permanently. Come to the',
        'graveyard at once. The living need you, and the',
        'dead... well, they need you more.',
        '',
        'This is your calling now, Geezer. The graves need',
        'a keeper... and the dead need an end.',
        '',
        '',
        '',
        'Father Gabriel',
        'Church of Saint Othric',
      ],
      isVisible: false,
      positionY: 0,
    };

    this.colorCorrectionConsole = {
      options: {
        blur: 0,
        brightness: 100,
        contrast: 100,
        grayscale: 0,
        invert: 0,
        opacity: 100,
        saturate: 100,
        sepia: 0,
        hueRotate: 0,
      },
      selectedCanvas: 0,
      selectedCanvasText: 'Main',
      currentSettings: '',
      optionIndex: 0,
      isVisible: false,
    };

    this.init(); //Adds Journal

    //In game text
    this.actionText = '';
    this.infoText = '';

    //Timers
    this.infoTextTimeout = 3000;
    this.infoTextTimer = 3001;
    this.infoTextVisible = false;

    this.menuTimer = 201;
    this.menuInterval = 200;
    this.canChangeOption = true;

    this.colorCorrectionConsoleTimer = 51;
    this.colorCorrectionConsoleInterval = 50;
    this.colorCorrectionConsoleCanChangeOption = true;

    //Audio
    this.welcome = new Howl({
      src: [welcomeURL],
      volume: 0.2,
      loop: false,
    });

    this.select = new Howl({
      src: [selectURL],
      volume: 0.2,
      loop: false,
    });

    this.back = new Howl({
      src: [backURL],
      volume: 0.2,
      loop: false,
    });

    this.toggle = new Howl({
      src: [toggleURL],
      volume: 0.2,
      loop: false,
    });

    this.info = new Howl({
      src: [infoURL],
      volume: 0.1,
      loop: false,
    });

    this.soundEffects = [
      this.welcome,
      this.select,
      this.back,
      this.toggle,
      this.info,
    ];
  }

  //Init
  //Reset journal, stats position
  init() {
    this.journal = {
      image: document.getElementById('journal-menu'),
      hints: {
        content: [],
        isVisible: true,
        isUnread: true,
        positionY: 0,
        rowCounter: 0,
      },

      secrets: {
        content: [],
        isVisible: false,
        isUnread: false,
        positionY: 0,
        rowCounter: 0,
      },

      isVisible: false,
      selectedOption: 0,
      lastOption: 0,
    };

    this.stats.positionY = 0;
  }

  //Audio
  updateAudioVolume() {
    for (let i = 0; i < this.soundEffects.length; i++) {
      const sfx = this.soundEffects[i];

      //Zadaj originalni volume samo ako nije 0 - no falsy
      if (sfx.volume()) {
        sfx.originalVolume = sfx.volume();
      }

      if (!this.game.isPlayingSFX) {
        sfx.volume(0);
      } else {
        sfx.volume(sfx.originalVolume);
      }
    }
  }

  //Journal
  drawJournal(ctx) {
    ctx.drawImage(
      this.journal.image,
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT,
      -this.game.camera.x,
      -this.game.camera.y,
      GAME_WIDTH,
      GAME_HEIGHT
    );

    ctx.font = '12px EarlyGameBoy';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,1)';

    if (this.journal.hints.isVisible) {
      ctx.fillText(
        'Hints',
        -this.game.camera.x + GAME_WIDTH / 2,
        -this.game.camera.y + 48
      );
    } else {
      ctx.fillText(
        'Secrets',
        -this.game.camera.x + GAME_WIDTH / 2,
        -this.game.camera.y + 48
      );
    }

    ctx.font = '6px EarlyGameBoy';
    ctx.textAlign = 'left';
    let rowCounter = 0;
    for (let i = 0; i < this.journal.selectedOption.content.length; i++) {
      for (
        let j = 0;
        j < this.journal.selectedOption.content[i].text.length;
        j++
      ) {
        this.journal.selectedOption.content[i].isUnread
          ? (ctx.fillStyle = 'rgb(231, 255, 12)')
          : (ctx.fillStyle = 'rgba(255,255,255,1)');
        ctx.fillText(
          this.journal.selectedOption.content[i].text[j],
          -this.game.camera.x + 32,
          -this.game.camera.y +
            72 +
            8 * j +
            10 * rowCounter -
            this.journal.selectedOption.positionY
        );
      }
      rowCounter += this.journal.selectedOption.content[i].text.length;
    }
  }

  updateJournal(ctx) {
    if (this.journal.isVisible) {
      document.getElementById('canvas--main').style.filter = 'blur(2px)';

      //isUnread check - additional
      if (this.journal.selectedOption === 0) {
        // for (let i = 0; i < this.journal.hints.content.length; i++) {
        //   const item = this.journal.hints.content[i];

        //   if (!this.journal.hints.isUnread && item.isUnread) {
        //     item.isUnread = false;
        //   }
        // }

        // for (let i = 0; i < this.journal.secrets.content.length; i++) {
        //   const item = this.journal.secrets.content[i];

        //   if (!this.journal.secrets.isUnread && item.isUnread) {
        //     item.isUnread = false;
        //   }
        // }
        this.journal.selectedOption =
          this.journal.lastOption === 0
            ? this.journal.hints
            : this.journal.lastOption;

        this.journal.selectedOption.isVisible = true;
      }

      //Selecting
      if (
        this.canChangeOption &&
        (this.game.input.lastMovementKey === RIGHT ||
          this.game.input.lastMovementKey === LEFT)
      ) {
        this.menuTimer = 0;
        this.toggle.play();

        //Elemination
        if (this.journal.selectedOption === this.journal.hints) {
          this.journal.selectedOption = this.journal.secrets;
          this.journal.lastOption = this.journal.secrets;
          this.journal.hints.isVisible = false;
          this.journal.secrets.isVisible = true;
        } else if (this.journal.selectedOption === this.journal.secrets) {
          this.journal.selectedOption = this.journal.hints;
          this.journal.lastOption = this.journal.hints;
          this.journal.hints.isVisible = true;
          this.journal.secrets.isVisible = false;
        }
      }
      //is Visible, is Unread
      if (
        this.journal.selectedOption.content.length &&
        this.journal.selectedOption.isVisible
      ) {
        this.journal.selectedOption.isUnread = false;
      }
    } else {
      this.journal.hints.isVisible = false;
      this.journal.secrets.isVisible = false;

      //Check on exit
      if (this.journal.selectedOption) {
        for (let i = 0; i < this.journal.hints.content.length; i++) {
          const item = this.journal.hints.content[i];

          if (!this.journal.hints.isUnread && item.isUnread) {
            item.isUnread = false;
          }
        }

        for (let i = 0; i < this.journal.secrets.content.length; i++) {
          const item = this.journal.secrets.content[i];

          if (!this.journal.secrets.isUnread && item.isUnread) {
            item.isUnread = false;
          }
        }
      }

      this.journal.selectedOption = 0;
    }
  }

  //Letter
  drawLetter(ctx) {
    ctx.drawImage(
      this.letter.image,
      -this.game.camera.x,
      -this.game.camera.y - this.letter.positionY
    );

    ctx.font = '20px Piacevoli';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.textAlign = 'left';

    for (let i = 0; i < this.letter.text.length; i++) {
      ctx.fillText(
        this.letter.text[i],
        -this.game.camera.x + 32,
        -this.game.camera.y + 48 + 13 * i - this.letter.positionY
      );
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(17, 24, 31, 1)';
    if (this.letter.positionY < GAME_HEIGHT) {
      ctx.drawImage(
        this.letter.arrowDown,
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT,
        -this.game.camera.x,
        -this.game.camera.y,
        GAME_WIDTH,
        GAME_HEIGHT
      );
    } else if (this.letter.positionY === GAME_HEIGHT) {
      ctx.font = '14px EarlyGameBoy';
      ctx.fillText(
        'Press A to Continue',
        -this.game.camera.x + GAME_WIDTH / 2,
        -this.game.camera.y + 267
      );
    }

    if (this.letter.positionY > 0) {
      ctx.drawImage(
        this.letter.arrowUp,
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT,
        -this.game.camera.x,
        -this.game.camera.y,
        GAME_WIDTH,
        GAME_HEIGHT
      );
    }
  }

  updateLetter() {
    if (this.letter.isVisible) {
      if (this.game.input.lastMovementKey === DOWN && this.game.spriteUpdate) {
        if (this.letter.positionY < GAME_HEIGHT) {
          this.letter.positionY += 16;
        }
      }

      if (this.game.input.lastMovementKey === UP && this.game.spriteUpdate) {
        if (this.letter.positionY > 0) {
          this.letter.positionY -= 16;
        }
      }

      if (
        this.letter.positionY === GAME_HEIGHT &&
        this.game.input.lastActionKey === 'a'
      ) {
        this.game.hero.gate.play();

        this.letter.isVisible = false;
        this.letter.positionY = 0;
        this.game.isPaused = false;
      }
    }
  }

  //Intro Screen
  drawIntroScreen(ctx) {
    if (!this.game.isInitialized) {
      ctx.drawImage(
        this.introScreen.imageWarDucks,
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT,
        -this.game.camera.x,
        -this.game.camera.y,
        GAME_WIDTH,
        GAME_HEIGHT
      );
    } else {
      ctx.drawImage(
        this.introScreen.imagePressA,
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT,
        -this.game.camera.x,
        -this.game.camera.y,
        GAME_WIDTH,
        GAME_HEIGHT
      );

      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.font = '14px EarlyGameBoy';
      ctx.fillText(
        'Press A to start',
        -this.game.camera.x + 48,
        -this.game.camera.y + 240
      );
    }
  }

  //Main menu
  drawMainMenu(ctx) {
    ctx.drawImage(
      this.mainMenu.background,
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT,
      -this.game.camera.x,
      -this.game.camera.y,
      GAME_WIDTH,
      GAME_HEIGHT
    );

    ctx.drawImage(
      this.mainMenu.logo,
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT,
      -this.game.camera.x,
      -this.game.camera.y,
      GAME_WIDTH,
      GAME_HEIGHT
    );

    ctx.drawImage(
      this.mainMenu.flowers,
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT,
      -this.game.camera.x,
      -this.game.camera.y,
      GAME_WIDTH,
      GAME_HEIGHT
    );

    ctx.drawImage(
      localStorage.getItem('gameSave') === null
        ? this.mainMenu.gravesNewGame
        : this.mainMenu.gravesContinue,
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT,
      -this.game.camera.x,
      -this.game.camera.y,
      GAME_WIDTH,
      GAME_HEIGHT
    );

    ctx.font = '6px EarlyGameBoy';
    ctx.textAlign = 'center';

    for (let i = 0; i < this.mainMenu.options.length; i++) {
      const option = this.mainMenu.options[i];

      if (i === 0 && localStorage.getItem('gameSave') === null) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      } else if (option.text === this.mainMenu.selectedOption.text) {
        ctx.fillStyle = 'rgb(231, 255, 12)';
      } else {
        ctx.fillStyle = 'rgba(255,255,255,1)';
      }
      ctx.fillText(
        option.text,
        -this.game.camera.x + 67 + i * 63,
        -this.game.camera.y + 190
      );

      //Draw menu rose
      if (option.text === this.mainMenu.selectedOption.text) {
        ctx.drawImage(
          this.mainMenu.rose,
          0,
          0,
          GAME_WIDTH,
          GAME_HEIGHT,
          -this.game.camera.x + 61 + i * 63,
          -this.game.camera.y + 146,
          GAME_WIDTH,
          GAME_HEIGHT
        );
      }
    }
  }

  updateMainMenu() {
    //Update main menu
    if (this.mainMenu.isVisible) {
      if (localStorage.getItem('gameSave') === null) {
        this.mainMenu.availableOptions = [
          { text: 'New Game' },
          { text: 'Settings' },
          { text: 'Credits' },
          { text: 'Quit' },
        ];
      } else {
        this.mainMenu.availableOptions = [
          { text: 'Continue' },
          { text: 'New Game' },
          { text: 'Settings' },
          { text: 'Credits' },
          { text: 'Quit' },
        ];
      }
      if (this.mainMenu.selectedOption === 0) {
        this.mainMenu.selectedOption = this.mainMenu.availableOptions[0];
      }

      if (this.mainMenu.isVisible && !this.dialogMenu.isVisible) {
        //Menu toggle
        if (this.canChangeOption && this.game.input.lastMovementKey === RIGHT) {
          this.menuTimer = 0;
          this.toggle.play();
          if (
            this.mainMenu.optionIndex <
            this.mainMenu.availableOptions.length - 1
          ) {
            this.mainMenu.optionIndex++;
            this.mainMenu.selectedOption =
              this.mainMenu.availableOptions[this.mainMenu.optionIndex];
          }
        }

        if (this.canChangeOption && this.game.input.lastMovementKey === LEFT) {
          this.menuTimer = 0;
          this.toggle.play();
          if (this.mainMenu.optionIndex > 0) {
            this.mainMenu.optionIndex--;
            this.mainMenu.selectedOption =
              this.mainMenu.availableOptions[this.mainMenu.optionIndex];
          }
        }

        //Selecting
        if (this.canChangeOption) {
          if (
            this.mainMenu.selectedOption.text === 'Continue' &&
            (this.game.input.lastActionKey === 'a' ||
              this.game.input.lastActionKey === 'enter')
          ) {
            this.menuTimer = 0;

            this.select.play();
            this.game.mainMenuMusic.stop();
            this.game.loadGame();
            this.game.isPaused = false;
            this.mainMenu.isVisible = false;
            this.game.isSaved = true;
          } else if (
            this.mainMenu.selectedOption.text === 'New Game' &&
            (this.game.input.lastActionKey === 'a' ||
              this.game.input.lastActionKey === 'enter')
          ) {
            if (localStorage.getItem('gameSave') === null) {
              this.menuTimer = 0;

              this.select.play();

              this.game.mainMenuMusic.stop();
              this.mainMenu.isVisible = false;
              this.game.gameStarted = true;
              this.game.startNewGame();
              // this.game.isPaused = false;
              this.letter.isVisible = true;
            } else {
              this.menuTimer = 0;
              this.dialogMenu.isVisible = true;
            }
          } else if (
            this.mainMenu.selectedOption.text === 'Settings' &&
            (this.game.input.lastActionKey === 'a' ||
              this.game.input.lastActionKey === 'enter')
          ) {
            this.menuTimer = 0;
            this.select.play();
            this.mainMenu.isVisible = false;
            this.settingsMain.isVisible = true;
          } else if (
            this.mainMenu.selectedOption.text === 'Credits' &&
            (this.game.input.lastActionKey === 'a' ||
              this.game.input.lastActionKey === 'enter')
          ) {
            this.menuTimer = 0;
            this.select.play();
            this.mainMenu.isVisible = false;
            this.credits.isVisible = true;
          } else if (
            this.mainMenu.selectedOption.text === 'Quit' &&
            (this.game.input.lastActionKey === 'a' ||
              this.game.input.lastActionKey === 'enter')
          ) {
            this.menuTimer = 0;
            this.select.play();
            this.dialogMenu.isVisible = true;
          }
        }
      }
    } else {
      this.mainMenu.selectedOption = 0;
    }
  }

  //Pause Menu
  drawPauseMenu(ctx) {
    ctx.drawImage(
      this.pauseMenu.background,
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT,
      -this.game.camera.x,
      -this.game.camera.y,
      GAME_WIDTH,
      GAME_HEIGHT
    );

    ctx.font = '16px EarlyGameBoy';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,1)';

    ctx.fillText(
      'Game Paused',
      -this.game.camera.x + GAME_WIDTH / 2,
      -this.game.camera.y + 94
    );

    for (let i = 0; i < this.pauseMenu.options.length; i++) {
      const option = this.pauseMenu.options[i];

      if (option.text === this.pauseMenu.selectedOption.text) {
        ctx.fillStyle = 'rgb(231, 255, 12)';
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      }
      ctx.font = '12px EarlyGameBoy';
      ctx.fillText(
        option.text,
        -this.game.camera.x + GAME_WIDTH / 2,
        -this.game.camera.y + 132 + i * 24
      );
    }
  }

  updatePauseMenu(ctx) {
    if (this.pauseMenu.isVisible) {
      // document.getElementById('canvas--main').style.filter = 'blur(2px)';
      document.getElementById('canvas--main').style.filter = 'blur(2px)';
      this.pauseMenu.selectedOption =
        this.pauseMenu.options[this.pauseMenu.optionIndex];

      //Menu toggle
      if (this.canChangeOption && this.game.input.lastMovementKey === DOWN) {
        this.menuTimer = 0;
        this.toggle.play();
        if (this.pauseMenu.optionIndex < this.pauseMenu.options.length - 1) {
          this.pauseMenu.optionIndex++;
          this.pauseMenu.selectedOption =
            this.pauseMenu.options[this.pauseMenu.optionIndex];
        }
      }

      if (this.canChangeOption && this.game.input.lastMovementKey === UP) {
        this.menuTimer = 0;
        this.toggle.play();
        if (this.pauseMenu.optionIndex > 0) {
          this.pauseMenu.optionIndex--;
          this.pauseMenu.selectedOption =
            this.pauseMenu.options[this.pauseMenu.optionIndex];
        }
      }

      //Selecting
      if (this.canChangeOption) {
        if (
          this.pauseMenu.selectedOption.text === 'Resume' &&
          (this.game.input.lastActionKey === 'a' ||
            this.game.input.lastActionKey === 'enter')
        ) {
          this.menuTimer = 0;
          this.select.play();
          this.pauseMenu.optionIndex = 0;
          this.pauseMenu.isVisible = false;
          if (!this.journal.isVisible) {
            this.game.isPaused = false;
          }
        } else if (
          this.pauseMenu.selectedOption.text === 'Settings' &&
          (this.game.input.lastActionKey === 'a' ||
            this.game.input.lastActionKey === 'enter')
        ) {
          this.menuTimer = 0;
          this.select.play();
          this.pauseMenu.optionIndex = 0;
          this.pauseMenu.isVisible = false;
          this.settingsPause.isVisible = true;
        } else if (
          this.pauseMenu.selectedOption.text === 'Main Menu' &&
          (this.game.input.lastActionKey === 'a' ||
            this.game.input.lastActionKey === 'enter')
        ) {
          this.menuTimer = 0;
          this.select.play();
          this.pauseMenu.optionIndex = 0;
          this.pauseMenu.isVisible = false;
          this.dialogMenu.isVisible = true;
        }
      }
    } else {
      if (
        !this.dialogMenu.isVisible &&
        !this.settingsPause.isVisible &&
        !this.gameOverMenu.isVisible
      ) {
        document.getElementById('canvas--main').style.filter = this.game.isNight
          ? 'blur(0px) brightness(100%) contrast(145%) grayscale(0%) invert(10%) opacity(100%) saturate(145%) sepia(10%) hue-rotate(-5deg)'
          : 'blur(0px) brightness(100%) contrast(120%) grayscale(0%) invert(0%) opacity(100%) saturate(125%) sepia(0%) hue-rotate(-5deg)';
        // ctx.filter = 'none';
      }
    }
  }

  // Credits
  drawCredits(ctx) {
    ctx.fillStyle = 'rgba(27,38,50,1)';
    ctx.fillRect(
      -this.game.camera.x,
      -this.game.camera.y,
      GAME_WIDTH,
      GAME_HEIGHT
    );

    ctx.drawImage(
      this.credits.logo,
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT,
      -this.game.camera.x,
      -this.game.camera.y - this.credits.positionY + GAME_HEIGHT,
      GAME_WIDTH,
      GAME_HEIGHT
    );

    ctx.fillStyle = 'rgba(255,255,255,1)';
    for (let i = 0; i < this.credits.text.length; i++) {
      ctx.font = '4px EarlyGameBoy';
      ctx.textAlign = 'center';
      ctx.fillText(
        this.credits.text[i],
        -this.game.camera.x + GAME_WIDTH / 2,
        -this.game.camera.y + 100 + 8 * i - this.credits.positionY + GAME_HEIGHT
      );
    }
    ctx.drawImage(
      this.credits.logoWarDucks,
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT,
      -this.game.camera.x + GAME_WIDTH / 2 - 32,
      -this.game.camera.y +
        100 +
        8 * this.credits.text.length -
        this.credits.positionY +
        GAME_HEIGHT,
      GAME_WIDTH,
      GAME_HEIGHT
    );
  }

  updateCredits() {
    if (this.credits.isVisible && !this.mainMenu.selectedOption) {
      this.credits.positionY += 0.5;

      if (
        ((this.game.input.lastActionKey === 'a' ||
          this.game.input.lastActionKey === 'enter') &&
          this.canChangeOption) ||
        this.credits.positionY > GAME_HEIGHT * 2.7
      ) {
        this.menuTimer = 0;
        this.credits.positionY = 0;
        this.credits.isVisible = false;
        this.mainMenu.isVisible = true;
        this.mainMenu.optionIndex = 0;
      }
    }
  }

  //Stats
  drawStats(ctx) {
    ctx.drawImage(
      this.stats.background,
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT,
      -this.game.camera.x,
      -this.game.camera.y,
      GAME_WIDTH,
      GAME_HEIGHT
    );

    ctx.drawImage(
      this.stats.flowers,
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT,
      -this.game.camera.x,
      -this.game.camera.y,
      GAME_WIDTH,
      GAME_HEIGHT
    );

    ctx.drawImage(
      this.stats.logo,
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT,
      -this.game.camera.x,
      -this.game.camera.y - this.stats.positionY,
      GAME_WIDTH,
      GAME_HEIGHT
    );
    ctx.fillStyle = 'rgba(255,255,255,1)';
    for (let i = 0; i < Object.values(this.game.stats).length; i++) {
      ctx.font = '6px EarlyGameBoy';
      ctx.textAlign = 'center';
      ctx.fillText(
        'Congratulations! You have completed the game!',
        -this.game.camera.x + GAME_WIDTH / 2,
        -this.game.camera.y + 100 - this.stats.positionY
      );

      ctx.fillText(
        'Stats',
        -this.game.camera.x + GAME_WIDTH / 2,
        -this.game.camera.y + 114 - this.stats.positionY
      );

      ctx.textAlign = 'left';
      ctx.fillText(
        this.stats.text[i],
        -this.game.camera.x + GAME_WIDTH / 2 - 120,
        -this.game.camera.y + 128 - this.stats.positionY + i * 14
      );
      ctx.textAlign = 'right';
      ctx.fillText(
        Object.values(this.game.stats)[i],
        -this.game.camera.x + GAME_WIDTH / 2 + 116,
        -this.game.camera.y + 128 - this.stats.positionY + i * 14
      );
    }

    ctx.textAlign = 'center';

    ctx.fillStyle = 'rgb(255, 255, 255,1)';
    if (this.stats.positionY < GAME_HEIGHT * 0.7) {
      ctx.drawImage(
        this.stats.arrowDown,
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT,
        -this.game.camera.x,
        -this.game.camera.y,
        GAME_WIDTH,
        GAME_HEIGHT
      );
    } else if (this.stats.positionY >= GAME_HEIGHT * 0.7) {
      ctx.font = '14px EarlyGameBoy';
      ctx.fillText(
        'Press A to Continue',
        -this.game.camera.x + GAME_WIDTH / 2,
        -this.game.camera.y + 267
      );
    }

    if (this.stats.positionY > 0) {
      ctx.drawImage(
        this.stats.arrowUp,
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT,
        -this.game.camera.x,
        -this.game.camera.y,
        GAME_WIDTH,
        GAME_HEIGHT
      );
    }
  }

  updateStats() {
    if (this.stats.isVisible && !this.mainMenu.selectedOption) {
      if (!this.game.musicHeroWins.playing()) {
        this.game.musicHeroWins.play();
      }
      if (this.stats.isVisible) {
        if (this.game.input.lastMovementKey === DOWN) {
          if (this.stats.positionY < GAME_HEIGHT * 0.7) {
            this.stats.positionY += 2;
          }
        }

        if (this.game.input.lastMovementKey === UP) {
          if (this.stats.positionY > 0) {
            this.stats.positionY -= 2;
          }
        }

        if (
          this.stats.positionY >= GAME_HEIGHT * 0.7 &&
          this.game.input.lastActionKey === 'a' &&
          this.canChangeOption
        ) {
          this.menuTimer = 0;
          this.select.play();
          this.game.musicHeroWins.stop();
          this.mainMenu.optionIndex = 0;
          this.stats.isVisible = false;
          this.introScreen.isVisible = true;
          this.game.input.actionKeys = [];
          localStorage.clear();
        }
      }
    }
  }

  //Settings Main
  drawSettingsMain(ctx) {
    ctx.drawImage(
      this.settingsMain.background,
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT,
      -this.game.camera.x,
      -this.game.camera.y,
      GAME_WIDTH,
      GAME_HEIGHT
    );

    ctx.drawImage(
      this.settingsMain.logo,
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT,
      -this.game.camera.x,
      -this.game.camera.y,
      GAME_WIDTH,
      GAME_HEIGHT
    );

    ctx.drawImage(
      this.settingsMain.flowers,
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT,
      -this.game.camera.x,
      -this.game.camera.y,
      GAME_WIDTH,
      GAME_HEIGHT
    );

    ctx.font = '16px EarlyGameBoy';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,1)';

    ctx.fillText(
      'Settings',
      -this.game.camera.x + GAME_WIDTH / 2,
      -this.game.camera.y + 94
    );

    for (let i = 0; i < this.settingsMain.options.length; i++) {
      const option = this.settingsMain.options[i];

      if (option.text === this.settingsMain.selectedOption.text) {
        ctx.fillStyle = 'rgb(231, 255, 12)';
      } else {
        ctx.fillStyle = 'rgb(255, 255, 255)';
      }
      ctx.font = '8px EarlyGameBoy';
      ctx.fillText(
        option.text,
        -this.game.camera.x + GAME_WIDTH / 2,
        -this.game.camera.y + 124 + i * 18
      );
    }
  }
  updateSettingsMain() {
    if (this.settingsMain.isVisible) {
      //FullScren update text
      if (document.fullscreenElement) {
        this.settingsMain.options[0].text = 'Full Screen: ON';
      } else {
        this.settingsMain.options[0].text = 'Full Screen: OFF';
      }

      //Menu toggle
      if (this.canChangeOption && this.game.input.lastMovementKey === DOWN) {
        this.menuTimer = 0;
        this.toggle.play();
        if (
          this.settingsMain.optionIndex <
          this.settingsMain.options.length - 1
        ) {
          this.settingsMain.optionIndex++;
          this.settingsMain.selectedOption =
            this.settingsMain.options[this.settingsMain.optionIndex];
        }
      }

      if (this.canChangeOption && this.game.input.lastMovementKey === UP) {
        this.menuTimer = 0;
        this.toggle.play();
        if (this.settingsMain.optionIndex > 0) {
          this.settingsMain.optionIndex--;
          this.settingsMain.selectedOption =
            this.settingsMain.options[this.settingsMain.optionIndex];
        }
      }

      //Selecting
      if (this.canChangeOption) {
        if (
          this.settingsMain.selectedOption.text === 'Full Screen: ON' &&
          (this.game.input.lastActionKey === 'a' ||
            this.game.input.lastActionKey === 'enter')
        ) {
          this.settingsMain.selectedOption.text = 'Full Screen: OFF';
          this.menuTimer = 0;
          this.select.play();
          this.settingsMain.optionIndex = 0;
          this.settingsMain.selectedOption = 0;

          if (document.fullscreenElement) {
            document.exitFullscreen();
          }
          // this.settingsMain.isVisible = false;
          // this.mainMenu.isVisible = true;
        } else if (
          this.settingsMain.selectedOption.text === 'Full Screen: OFF' &&
          (this.game.input.lastActionKey === 'a' ||
            this.game.input.lastActionKey === 'enter')
        ) {
          this.settingsMain.selectedOption.text = 'Full Screen: ON';
          this.menuTimer = 0;
          this.select.play();
          this.settingsMain.optionIndex = 0;
          this.settingsMain.selectedOption = 0;
          document.getElementById('game').requestFullscreen();
        }

        if (
          this.settingsMain.selectedOption.text === 'Sound Effects: ON' &&
          (this.game.input.lastActionKey === 'a' ||
            this.game.input.lastActionKey === 'enter')
        ) {
          this.settingsMain.selectedOption.text = 'Sound Effects: OFF';
          this.menuTimer = 0;
          this.game.isPlayingSFX = false;

          this.settingsMain.optionIndex = 1;
        } else if (
          this.settingsMain.selectedOption.text === 'Sound Effects: OFF' &&
          (this.game.input.lastActionKey === 'a' ||
            this.game.input.lastActionKey === 'enter')
        ) {
          this.settingsMain.selectedOption.text = 'Sound Effects: ON';
          this.menuTimer = 0;
          this.game.isPlayingSFX = true;
          this.select.play();
          this.settingsMain.optionIndex = 1;
        }

        if (
          this.settingsMain.selectedOption.text === 'Music: ON' &&
          (this.game.input.lastActionKey === 'a' ||
            this.game.input.lastActionKey === 'enter')
        ) {
          this.settingsMain.selectedOption.text = 'Music: OFF';
          this.menuTimer = 0;
          this.game.isPlayingMusic = false;
          this.select.play();
          this.settingsMain.optionIndex = 2;
        } else if (
          this.settingsMain.selectedOption.text === 'Music: OFF' &&
          (this.game.input.lastActionKey === 'a' ||
            this.game.input.lastActionKey === 'enter')
        ) {
          this.settingsMain.selectedOption.text = 'Music: ON';
          this.menuTimer = 0;
          this.game.isPlayingMusic = true;
          this.select.play();
          this.game.mainMenuMusic.play();
          this.settingsMain.optionIndex = 2;
        }

        if (
          this.settingsMain.selectedOption.text === 'Controls' &&
          (this.game.input.lastActionKey === 'a' ||
            this.game.input.lastActionKey === 'enter')
        ) {
          this.menuTimer = 0;
          this.select.play();
          this.settingsMain.optionIndex = 0;
          this.settingsMain.isVisible = false;
          this.controls.isVisible = true;
          this.mainMenu.optionIndex = 0;
          this.controls.optionIndex = 0;
          this.controls.lastMenu = this.settingsMain;
        }

        if (
          this.settingsMain.selectedOption.text === 'Back' &&
          (this.game.input.lastActionKey === 'a' ||
            this.game.input.lastActionKey === 'enter')
        ) {
          this.menuTimer = 0;
          this.back.play();
          this.settingsMain.optionIndex = 0;
          this.settingsMain.isVisible = false;
          this.mainMenu.isVisible = true;
          this.mainMenu.optionIndex = 0;
        }
        this.settingsMain.selectedOption =
          this.settingsMain.options[this.settingsMain.optionIndex];
      }
    } else {
      this.settingsMain.selectedOption = 0;

      this.settingsPause.options = this.settingsMain.options;
    }
  }

  //Settings Pause
  drawSettingsPause(ctx) {
    ctx.drawImage(
      this.settingsPause.background,
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT,
      -this.game.camera.x,
      -this.game.camera.y,
      GAME_WIDTH,
      GAME_HEIGHT
    );

    ctx.font = '16px EarlyGameBoy';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,1)';

    ctx.fillText(
      'Settings',
      -this.game.camera.x + GAME_WIDTH / 2,
      -this.game.camera.y + 94
    );

    for (let i = 0; i < this.settingsPause.options.length; i++) {
      const option = this.settingsPause.options[i];

      if (option.text === this.settingsPause.selectedOption.text) {
        ctx.fillStyle = 'rgb(231, 255, 12)';
      } else {
        ctx.fillStyle = 'rgb(255, 255, 255)';
      }
      ctx.font = '8px EarlyGameBoy';
      ctx.fillText(
        option.text,
        -this.game.camera.x + GAME_WIDTH / 2,
        -this.game.camera.y + 124 + i * 18
      );
    }
  }

  updateSettingsPause(ctx) {
    if (this.settingsPause.isVisible) {
      document.getElementById('canvas--main').style.filter = 'blur(2px)';

      //FullScren update text
      if (document.fullscreenElement) {
        this.settingsPause.options[0].text = 'Full Screen: ON';
      } else {
        this.settingsPause.options[0].text = 'Full Screen: OFF';
      }

      //Menu toggle
      if (this.canChangeOption && this.game.input.lastMovementKey === DOWN) {
        this.menuTimer = 0;
        this.toggle.play();
        if (
          this.settingsPause.optionIndex <
          this.settingsPause.options.length - 1
        ) {
          this.settingsPause.optionIndex++;
          this.settingsPause.selectedOption =
            this.settingsPause.options[this.settingsPause.optionIndex];
        }
      }

      if (this.canChangeOption && this.game.input.lastMovementKey === UP) {
        this.menuTimer = 0;
        this.toggle.play();
        if (this.settingsPause.optionIndex > 0) {
          this.settingsPause.optionIndex--;
          this.settingsPause.selectedOption =
            this.settingsPause.options[this.settingsPause.optionIndex];
        }
      }

      //Selecting
      if (this.canChangeOption) {
        if (
          this.settingsPause.selectedOption.text === 'Full Screen: ON' &&
          (this.game.input.lastActionKey === 'a' ||
            this.game.input.lastActionKey === 'enter')
        ) {
          this.settingsPause.selectedOption.text = 'Full Screen: OFF';
          this.menuTimer = 0;
          this.select.play();
          this.settingsPause.optionIndex = 0;
          this.settingsPause.selectedOption = 0;
          document.exitFullscreen();
          // this.settingsPause.isVisible = false;
          // this.mainMenu.isVisible = true;
        } else if (
          this.settingsPause.selectedOption.text === 'Full Screen: OFF' &&
          (this.game.input.lastActionKey === 'a' ||
            this.game.input.lastActionKey === 'enter')
        ) {
          this.settingsPause.selectedOption.text = 'Full Screen: ON';
          this.menuTimer = 0;

          this.settingsPause.optionIndex = 0;
          this.settingsPause.selectedOption = 0;
          document.getElementById('game').requestFullscreen();
        }

        if (
          this.settingsPause.selectedOption.text === 'Sound Effects: ON' &&
          (this.game.input.lastActionKey === 'a' ||
            this.game.input.lastActionKey === 'enter')
        ) {
          this.settingsPause.selectedOption.text = 'Sound Effects: OFF';
          this.menuTimer = 0;
          this.game.isPlayingSFX = false;
          this.settingsPause.optionIndex = 1;
        } else if (
          this.settingsPause.selectedOption.text === 'Sound Effects: OFF' &&
          (this.game.input.lastActionKey === 'a' ||
            this.game.input.lastActionKey === 'enter')
        ) {
          this.settingsPause.selectedOption.text = 'Sound Effects: ON';
          this.menuTimer = 0;
          this.game.isPlayingSFX = true;
          this.select.volume(0.5);
          this.select.play();

          this.settingsPause.optionIndex = 1;
        }

        if (
          this.settingsPause.selectedOption.text === 'Music: ON' &&
          (this.game.input.lastActionKey === 'a' ||
            this.game.input.lastActionKey === 'enter')
        ) {
          this.settingsPause.selectedOption.text = 'Music: OFF';
          this.menuTimer = 0;
          this.game.isPlayingMusic = false;
          this.select.play();
          this.settingsPause.optionIndex = 2;
        } else if (
          this.settingsPause.selectedOption.text === 'Music: OFF' &&
          (this.game.input.lastActionKey === 'a' ||
            this.game.input.lastActionKey === 'enter')
        ) {
          this.settingsPause.selectedOption.text = 'Music: ON';
          this.menuTimer = 0;
          this.game.isPlayingMusic = true;
          this.select.play();

          this.settingsPause.optionIndex = 2;
        }

        if (
          this.settingsPause.selectedOption.text === 'Controls' &&
          (this.game.input.lastActionKey === 'a' ||
            this.game.input.lastActionKey === 'enter')
        ) {
          this.menuTimer = 0;
          this.select.play();
          this.settingsPause.optionIndex = 0;
          this.settingsPause.isVisible = false;
          this.controls.isVisible = true;
          this.mainMenu.optionIndex = 0;
          this.controls.optionIndex = 0;
          this.controls.lastMenu = this.settingsPause;
        }

        if (
          this.settingsPause.selectedOption.text === 'Back' &&
          (this.game.input.lastActionKey === 'a' ||
            this.game.input.lastActionKey === 'enter')
        ) {
          this.menuTimer = 0;
          this.back.play();
          this.settingsPause.optionIndex = 0;
          this.settingsPause.isVisible = false;
          this.pauseMenu.isVisible = true;
          this.pauseMenu.optionIndex = 0;
        }
        this.settingsPause.selectedOption =
          this.settingsPause.options[this.settingsPause.optionIndex];
      }
    } else {
      this.settingsPause.selectedOption = 0;
      this.settingsMain.options = this.settingsPause.options;

      if (
        !this.dialogMenu.isVisible &&
        !this.controls.isVisible &&
        !this.pauseMenu.isVisible &&
        !this.gameOverMenu.isVisible
      ) {
        document.getElementById('canvas--main').style.filter = this.game.isNight
          ? 'blur(0px) brightness(100%) contrast(145%) grayscale(0%) invert(10%) opacity(100%) saturate(145%) sepia(10%) hue-rotate(-5deg)'
          : 'blur(0px) brightness(100%) contrast(120%) grayscale(0%) invert(0%) opacity(100%) saturate(125%) sepia(0%) hue-rotate(-5deg)';
      }
    }
  }

  //Controls
  drawControls(ctx) {
    if (this.controls.lastMenu === this.settingsMain) {
      ctx.drawImage(
        this.controls.background,
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT,
        -this.game.camera.x,
        -this.game.camera.y,
        GAME_WIDTH,
        GAME_HEIGHT
      );

      ctx.drawImage(
        this.controls.logo,
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT,
        -this.game.camera.x,
        -this.game.camera.y,
        GAME_WIDTH,
        GAME_HEIGHT
      );

      ctx.drawImage(
        this.controls.flowers,
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT,
        -this.game.camera.x,
        -this.game.camera.y,
        GAME_WIDTH,
        GAME_HEIGHT
      );
    } else {
      ctx.drawImage(
        this.settingsPause.background,
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT,
        -this.game.camera.x,
        -this.game.camera.y,
        GAME_WIDTH,
        GAME_HEIGHT
      );
    }

    ctx.font = '16px EarlyGameBoy';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,1)';

    ctx.fillText(
      'Controls',
      -this.game.camera.x + GAME_WIDTH / 2,
      -this.game.camera.y + 94
    );

    for (let i = 0; i < this.controls.text.length; i++) {
      ctx.font = '6px EarlyGameBoy';
      ctx.textAlign = 'left';
      ctx.fillText(
        this.controls.text[i],
        -this.game.camera.x + GAME_WIDTH / 4,
        -this.game.camera.y + 116 + 10 * i
      );
    }

    ctx.fillStyle = 'rgb(231, 255, 12)';

    ctx.font = '8px EarlyGameBoy';
    ctx.textAlign = 'center';
    ctx.fillText(
      this.controls.selectedOption.text,
      -this.game.camera.x + GAME_WIDTH / 2,
      -this.game.camera.y + 204
    );
  }

  updateControls(ctx) {
    if (this.controls.isVisible) {
      document.getElementById('canvas--main').style.filter = 'blur(2px)';

      //Selecting
      if (this.canChangeOption) {
        if (
          this.controls.selectedOption.text === 'Back' &&
          (this.game.input.lastActionKey === 'a' ||
            this.game.input.lastActionKey === 'enter')
        ) {
          this.menuTimer = 0;
          this.back.play();
          this.controls.optionIndex = 0;
          this.controls.isVisible = false;

          if (this.controls.lastMenu === this.settingsMain) {
            this.settingsMain.isVisible = true;
            this.settingsMain.optionIndex = 0;
          } else if (this.controls.lastMenu === this.settingsPause) {
            this.settingsPause.isVisible = true;
            this.settingsPause.optionIndex = 0;
          }
        }
        this.controls.selectedOption =
          this.controls.options[this.controls.optionIndex];
      }
    } else {
      this.controls.selectedOption = 0;

      if (
        !this.dialogMenu.isVisible &&
        !this.settingsPause.isVisible &&
        !this.pauseMenu.isVisible &&
        !this.gameOverMenu.isVisible
      ) {
        document.getElementById('canvas--main').style.filter = this.game.isNight
          ? 'blur(0px) brightness(100%) contrast(145%) grayscale(0%) invert(10%) opacity(100%) saturate(145%) sepia(10%) hue-rotate(-5deg)'
          : 'blur(0px) brightness(100%) contrast(120%) grayscale(0%) invert(0%) opacity(100%) saturate(125%) sepia(0%) hue-rotate(-5deg)';
      }
    }
  }

  //Dialog Menu
  drawDialogMenu(ctx) {
    ctx.drawImage(
      this.dialogMenu.background,
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT,
      -this.game.camera.x,
      -this.game.camera.y,
      GAME_WIDTH,
      GAME_HEIGHT
    );

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,1)';
    ctx.font = '8px EarlyGameBoy';

    if (this.pauseMenu.selectedOption.text === 'Main Menu') {
      ctx.fillText(
        'Any unsaved progress will be lost.',
        -this.game.camera.x + GAME_WIDTH / 2,
        -this.game.camera.y + 98
      );
      ctx.fillText(
        'Are you sure?',
        -this.game.camera.x + GAME_WIDTH / 2,
        -this.game.camera.y + 118
      );
    }

    if (this.mainMenu.selectedOption.text === 'New Game') {
      ctx.fillText(
        'This will reset game progress.',
        -this.game.camera.x + GAME_WIDTH / 2,
        -this.game.camera.y + 98
      );
      ctx.fillText(
        'Are you sure?',
        -this.game.camera.x + GAME_WIDTH / 2,
        -this.game.camera.y + 118
      );
    }
    if (this.mainMenu.selectedOption.text === 'Quit') {
      ctx.fillText(
        'Are you sure?',
        -this.game.camera.x + GAME_WIDTH / 2,
        -this.game.camera.y + 108
      );
    }

    for (let i = 0; i < this.dialogMenu.options.length; i++) {
      const option = this.dialogMenu.options[i];

      if (option.text === this.dialogMenu.selectedOption.text) {
        ctx.fillStyle = 'rgb(231, 255, 12)'; //ok?
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      }
      ctx.font = '12px EarlyGameBoy';
      ctx.fillText(
        option.text,
        -this.game.camera.x + 128 + i * 128,
        -this.game.camera.y + 164
      );
    }
  }

  updateDialogMenu(ctx) {
    if (this.dialogMenu.isVisible) {
      //Menu toggle
      if (this.canChangeOption && this.game.input.lastMovementKey === RIGHT) {
        this.menuTimer = 0;
        this.toggle.play();
        if (this.dialogMenu.optionIndex < this.dialogMenu.options.length - 1) {
          this.dialogMenu.optionIndex++;
          this.dialogMenu.selectedOption =
            this.dialogMenu.options[this.dialogMenu.optionIndex];
        }
      }

      if (this.canChangeOption && this.game.input.lastMovementKey === LEFT) {
        this.menuTimer = 0;
        this.toggle.play();
        if (this.dialogMenu.optionIndex > 0) {
          this.dialogMenu.optionIndex--;
          this.dialogMenu.selectedOption =
            this.dialogMenu.options[this.dialogMenu.optionIndex];
        }
      }

      //Selecting
      if (this.canChangeOption) {
        if (this.pauseMenu.selectedOption.text === 'Main Menu') {
          if (
            this.dialogMenu.selectedOption.text === 'Yes' &&
            (this.game.input.lastActionKey === 'a' ||
              this.game.input.lastActionKey === 'enter')
          ) {
            this.menuTimer = 0;
            this.select.play();
            this.dialogMenu.optionIndex = 0;
            this.dialogMenu.selectedOption = 0;
            this.pauseMenu.isVisible = false;
            this.dialogMenu.isVisible = false;
            this.mainMenu.isVisible = true;
          } else if (
            this.dialogMenu.selectedOption.text === 'No' &&
            (this.game.input.lastActionKey === 'a' ||
              this.game.input.lastActionKey === 'enter')
          ) {
            this.menuTimer = 0;
            this.back.play();
            this.dialogMenu.optionIndex = 0;
            this.dialogMenu.selectedOption = 0;
            this.pauseMenu.isVisible = true;
            this.dialogMenu.isVisible = false;
          }
        }

        if (this.mainMenu.selectedOption.text === 'New Game') {
          if (
            this.dialogMenu.selectedOption.text === 'Yes' &&
            (this.game.input.lastActionKey === 'a' ||
              this.game.input.lastActionKey === 'enter')
          ) {
            this.game.mainMenuMusic.stop();
            this.game.startNewGame();
            this.menuTimer = 0;
            this.select.play();
            this.dialogMenu.optionIndex = 0;
            this.pauseMenu.isVisible = false;
            this.dialogMenu.isVisible = false;
            this.mainMenu.isVisible = false;
            this.letter.isVisible = true;
            this.game.gameStarted = true;
          }
          if (
            this.dialogMenu.selectedOption.text === 'No' &&
            (this.game.input.lastActionKey === 'a' ||
              this.game.input.lastActionKey === 'enter')
          ) {
            this.menuTimer = 0;
            this.back.play();
            this.dialogMenu.optionIndex = 0;
            this.pauseMenu.isVisible = true;
            this.dialogMenu.isVisible = false;
          }
        }
        if (this.mainMenu.selectedOption.text === 'Quit') {
          if (
            this.dialogMenu.selectedOption.text === 'Yes' &&
            (this.game.input.lastActionKey === 'a' ||
              this.game.input.lastActionKey === 'enter')
          ) {
            this.select.play();
            window.close();
          }
          if (
            this.dialogMenu.selectedOption.text === 'No' &&
            (this.game.input.lastActionKey === 'a' ||
              this.game.input.lastActionKey === 'enter')
          ) {
            this.menuTimer = 0;
            this.back.play();
            this.dialogMenu.optionIndex = 0;
            this.pauseMenu.isVisible = false;
            this.dialogMenu.isVisible = false;
            this.mainMenu.isVisible = true;
          }
        }

        this.dialogMenu.selectedOption =
          this.dialogMenu.options[this.dialogMenu.optionIndex];
      }
    } else {
      if (!this.pauseMenu.isVisible) {
        this.pauseMenu.selectedOption = 0;
      }
      this.dialogMenu.selectedOption = 0;
    }
  }

  //Game over
  drawGameOverMenu(ctx) {
    ctx.drawImage(
      this.dialogMenu.background,
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT,
      -this.game.camera.x,
      -this.game.camera.y,
      GAME_WIDTH,
      GAME_HEIGHT
    );

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,1)';
    ctx.font = '16px EarlyGameBoy';

    ctx.fillText(
      'You died',
      -this.game.camera.x + GAME_WIDTH / 2,
      -this.game.camera.y + 118
    );

    for (let i = 0; i < this.gameOverMenu.options.length; i++) {
      const option = this.gameOverMenu.options[i];

      if (option.text === this.gameOverMenu.selectedOption.text) {
        ctx.fillStyle = 'rgb(231, 255, 12)'; //ok?
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      }
      ctx.font = '12px EarlyGameBoy';
      ctx.fillText(
        option.text,
        -this.game.camera.x + 128 + i * 128,
        -this.game.camera.y + 164
      );
    }
  }

  updateGameOverMenu(ctx) {
    if (this.gameOverMenu.isVisible) {
      document.getElementById('canvas--main').style.filter = 'blur(2px)';

      if (!this.game.musicDeath.playing() && this.game.isPlayingMusic) {
        this.game.musicDay.stop();
        this.game.musicNight.stop();
        this.game.musicCombat.stop();
        this.game.musicDemonDay.stop();
        this.game.musicDemonNight.stop();
        this.game.musicDemonIntro.stop();
        this.game.musicDeath.play();
      }

      //Menu toggle
      if (this.canChangeOption && this.game.input.lastMovementKey === RIGHT) {
        this.menuTimer = 0;
        this.toggle.play();
        if (
          this.gameOverMenu.optionIndex <
          this.gameOverMenu.options.length - 1
        ) {
          this.gameOverMenu.optionIndex++;
          this.gameOverMenu.selectedOption =
            this.gameOverMenu.options[this.gameOverMenu.optionIndex];
        }
      }

      if (this.canChangeOption && this.game.input.lastMovementKey === LEFT) {
        this.menuTimer = 0;
        this.toggle.play();
        if (this.gameOverMenu.optionIndex > 0) {
          this.gameOverMenu.optionIndex--;
          this.gameOverMenu.selectedOption =
            this.gameOverMenu.options[this.gameOverMenu.optionIndex];
        }
      }

      //Selecting
      if (this.canChangeOption) {
        if (
          this.gameOverMenu.selectedOption.text === 'Main Menu' &&
          (this.game.input.lastActionKey === 'a' ||
            this.game.input.lastActionKey === 'enter')
        ) {
          this.game.isPaused = true;
          this.menuTimer = 0;
          // this.game.stats.timesDied++;
          this.select.play();
          this.gameOverMenu.optionIndex = 0;
          this.gameOverMenu.isVisible = false;
          this.mainMenu.isVisible = true;
        } else if (
          this.gameOverMenu.selectedOption.text === 'Try Again' &&
          (this.game.input.lastActionKey === 'a' ||
            this.game.input.lastActionKey === 'enter')
        ) {
          if (localStorage.getItem('gameSave') === null) {
            this.game.musicDeath.stop();
            this.select.play();
            this.menuTimer = 0;
            this.game.stats.timesDied++;
            this.gameOverMenu.isVisible = false;
            this.mainMenu.isVisible = false;
            this.game.startNewGame();
            this.letter.isVisible = true;
            this.game.gameStarted = true;
          } else {
            this.game.loadGame();
            this.game.musicDeath.stop();
            this.select.play();
            this.menuTimer = 0;
            this.game.stats.timesDied++;
            this.gameOverMenu.isVisible = false;
            this.mainMenu.isVisible = false;
            this.game.isSaved = true;
          }
        }

        this.gameOverMenu.selectedOption =
          this.gameOverMenu.options[this.gameOverMenu.optionIndex];
      }
    } else {
      this.game.musicDeath.stop();
      if (!this.pauseMenu.isVisible && !this.dialogMenu.isVisible) {
        document.getElementById('canvas--main').style.filter = this.game.isNight
          ? 'blur(0px) brightness(100%) contrast(145%) grayscale(0%) invert(10%) opacity(100%) saturate(145%) sepia(10%) hue-rotate(-5deg)'
          : 'blur(0px) brightness(100%) contrast(120%) grayscale(0%) invert(0%) opacity(100%) saturate(125%) sepia(0%) hue-rotate(-5deg)';
      }
      this.gameOverMenu.optionIndex = 0;
    }
  }

  //HUD
  drawHud(ctx) {
    ctx.font = '6px EarlyGameBoy';
    ctx.textAlign = 'center';
    ctx.save();

    //Clusters
    if (this.game.hero.isGreeted) {
      ctx.drawImage(this.hud.master, -this.game.camera.x, -this.game.camera.y);

      ctx.drawImage(
        this.game.isNight ? this.hud.night : this.hud.day,
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT,
        -this.game.camera.x,
        -this.game.camera.y,
        GAME_WIDTH,
        GAME_HEIGHT
      );
    }

    //Health bar
    if (this.game.hero.isGreeted) {
      if (!this.game.godMode) {
        this.game.hero.health > 10
          ? (ctx.fillStyle = 'rgba(81,190,38, 1)')
          : (ctx.fillStyle = 'rgba(190,38,51,1)');
      } else {
        ctx.fillStyle = 'rgba(0,0,255, 1)';
      }

      if (this.game.hero.health > 0) {
        ctx.fillRect(
          -this.game.camera.x + 66,
          -this.game.camera.y + 17,
          Math.floor(this.game.hero.health * 0.92),
          13
        );
      }

      //Journal / Demon HB
      if (this.game.demon.currentStage < 0 || this.game.heroWins) {
        ctx.drawImage(
          this.journal.hints.isUnread || this.journal.secrets.isUnread
            ? this.hud.journalOpened
            : this.hud.journalClosed,
          -this.game.camera.x,
          -this.game.camera.y
        );
      } else {
        this.game.demon.health > 1000
          ? (ctx.fillStyle = 'rgba(81,190,38, 1)')
          : (ctx.fillStyle = 'rgba(190,38,51,1)');

        if (this.game.demon.health > 0) {
          ctx.drawImage(
            this.hud.demonMaster,
            -this.game.camera.x,
            -this.game.camera.y
          );
          ctx.drawImage(
            this.hud.demonIcon,
            -this.game.camera.x,
            -this.game.camera.y
          );

          ctx.fillRect(
            -this.game.camera.x + 242,
            -this.game.camera.y + 17,
            Math.floor((this.game.demon.health / 100) * 0.92),
            13
          );

          ctx.drawImage(
            this.hud.demonHealthFrame,
            -this.game.camera.x,
            -this.game.camera.y
          );
        }
      }
    }

    ctx.restore();

    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,1)';

    if (this.game.hero.isGreeted) {
      ctx.drawImage(
        this.hud.healthFrame,
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT,
        -this.game.camera.x,
        -this.game.camera.y,
        GAME_WIDTH,
        GAME_HEIGHT
      );

      //ROSES
      ctx.fillText(
        this.game.hero.numRoses,
        -this.game.camera.x + 92,
        -this.game.camera.y + 42
      );

      //CLOCK
      ctx.textAlign = 'center';
      if (!this.game.world.arena.isActive) {
        ctx.fillText(
          this.game.clock < 10
            ? `0${Math.trunc(this.game.clock)}`
            : `${Math.trunc(this.game.clock)}`,
          -this.game.camera.x + 30,
          -this.game.camera.y + 42
        );
        ctx.fillText(':', -this.game.camera.x + 41, -this.game.camera.y + 42);
        ctx.fillText('00', -this.game.camera.x + 50, -this.game.camera.y + 42);
      } else {
        ctx.fillText('??', -this.game.camera.x + 31, -this.game.camera.y + 42);
        ctx.fillText(':', -this.game.camera.x + 41, -this.game.camera.y + 42);
        ctx.fillText('??', -this.game.camera.x + 50, -this.game.camera.y + 42);
      }
    }
    ctx.restore();

    if (this.game.hero.isGreeted) {
      //WEAPON
      ctx.drawImage(
        document.getElementById(
          `hud-weapon-${this.game.hero.currentWeapon.name}`
        ),
        -this.game.camera.x,
        -this.game.camera.y
      );

      //ITEMS
      //Candles
      if (this.game.candles.canBeFound || this.game.candles.isFound) {
        ctx.drawImage(
          document.getElementById('hud-item-candle-available'),
          -this.game.camera.x,
          -this.game.camera.y
        );
      }

      if (this.game.candles.isFound) {
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,1)';
        ctx.font = '5px EarlyGameBoy';

        ctx.fillText(
          this.game.candles.counter,
          -this.game.camera.x + 27,
          -this.game.camera.y + GAME_HEIGHT - 20
        );

        ctx.font = '6px EarlyGameBoy';
        ctx.fillText(
          1,
          -this.game.camera.x + 27,
          -this.game.camera.y + GAME_HEIGHT - 41
        );
        ctx.restore();

        if (this.game.candles.counter > 0) {
          ctx.drawImage(
            document.getElementById(
              `hud-item-candle-available-${
                this.game.candles.isFound && this.game.candles.counter > 0
              }`
            ),
            -this.game.camera.x,
            -this.game.camera.y
          );
        }
      }

      //Bottle
      if (this.game.bottle.canBeFound || this.game.bottle.isFound) {
        ctx.drawImage(
          document.getElementById('hud-item-bottle-available'),
          -this.game.camera.x,
          -this.game.camera.y
        );
      }

      if (this.game.bottle.isFound) {
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,1)';

        ctx.font = '6px EarlyGameBoy';
        ctx.fillText(
          2,
          -this.game.camera.x + 49,
          -this.game.camera.y + GAME_HEIGHT - 41
        );
        ctx.restore();

        ctx.drawImage(
          document.getElementById(
            `hud-item-bottle-available-${this.game.bottle.isFilled}`
          ),
          -this.game.camera.x,
          -this.game.camera.y
        );
      }

      //Scarecrow
      if (this.game.scarecrow.canBeFound || this.game.scarecrow.isFound) {
        ctx.drawImage(
          document.getElementById('hud-item-scarecrow-available'),
          -this.game.camera.x,
          -this.game.camera.y
        );
      }

      if (this.game.scarecrow.isFound) {
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,1)';

        ctx.font = '6px EarlyGameBoy';
        ctx.fillText(
          3,
          -this.game.camera.x + 71,
          -this.game.camera.y + GAME_HEIGHT - 41
        );
        ctx.restore();
      }

      if (!this.game.scarecrow.isActivated && this.game.scarecrow.isFound) {
        ctx.drawImage(
          document.getElementById(
            `hud-item-scarecrow-available-${this.game.scarecrow.isFound}`
          ),
          -this.game.camera.x,
          -this.game.camera.y
        );
      }
      //hourglass
      if (this.game.hourglass.canBeFound || this.game.hourglass.isFound) {
        ctx.drawImage(
          document.getElementById('hud-item-hourglass-available'),
          -this.game.camera.x,
          -this.game.camera.y
        );
      }

      if (this.game.hourglass.isFound) {
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,1)';

        ctx.font = '6px EarlyGameBoy';
        ctx.fillText(
          4,
          -this.game.camera.x + 93,
          -this.game.camera.y + GAME_HEIGHT - 41
        );
        ctx.restore();
      }

      if (this.game.hourglass.isFound) {
        ctx.drawImage(
          document.getElementById(
            `hud-item-hourglass-available-${
              this.game.hourglass.roseCounter >= 50 &&
              this.game.hourglass.isFound
            }`
          ),
          -this.game.camera.x,
          -this.game.camera.y
        );
      }

      //Key
      if (this.game.hero.hasKey) {
        ctx.drawImage(
          this.game.level < 4
            ? document.getElementById('hud-item-key-silver')
            : document.getElementById('hud-item-key-gold'),
          -this.game.camera.x,
          -this.game.camera.y
        );
      }
    }
  }

  //NPCs
  drawNpcDialogBox(ctx) {
    ctx.drawImage(this.hud.dialogBox, -this.game.camera.x, -this.game.camera.y);

    ctx.textAlign = 'center'; // Options: "left", "right", "center", "start", "end"

    ctx.font = '6px EarlyGameBoy';
    ctx.fillText(
      this.game.hero.npc.slide ===
        this.game.hero.npc.slides[this.game.hero.npc.interactionCounter]
          .length -
          1
        ? 'A    QUIT'
        : 'A    NEXT',
      -this.game.camera.x + GAME_WIDTH - 28,
      -this.game.camera.y + GAME_HEIGHT * 0.75 - 8
    );

    ctx.fillText(
      this.game.hero.npc.name,
      -this.game.camera.x + 50,
      -this.game.camera.y + GAME_HEIGHT * 0.75 - 8
    );
  }

  renderNpcText(ctx, text, x, y, maxWidth, lineHeight) {
    ctx.font = '7px EarlyGameBoy';
    ctx.textAlign = 'left';
    let words = text.split(' ');
    let line = '';

    for (let i = 0; i < words.length; i++) {
      let testLine = line + words[i] + ' ';
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;

      if (testWidth > maxWidth && i > 0) {
        ctx.fillText(line, x, y);
        line = words[i] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  //Action Text
  drawActionText(ctx) {
    //ACTION TEXT

    ctx.font = '6px EarlyGameBoy';

    ctx.textAlign = 'center';

    ctx.fillStyle = 'rgba(17, 24, 31, 1)';
    ctx.fillText(
      this.actionText,
      this.game.hero.position.x + HALF_TILE_SIZE + 1,
      this.game.hero.position.y - TILE_SIZE + 1
    );

    ctx.fillStyle = 'rgba(255,255,255,1)';
    ctx.fillText(
      this.actionText,
      this.game.hero.position.x + HALF_TILE_SIZE,
      this.game.hero.position.y - TILE_SIZE
    );
  }

  updateActionText() {
    if (
      this.game.graves.some(
        (grave, index) =>
          !grave.isLocked &&
          this.game.hero.position.x === grave.position.x &&
          this.game.hero.position.y === grave.position.y + TILE_SIZE
      ) &&
      !this.game.hero.currentItem &&
      !this.game.isNight &&
      this.game.hero.numRoses > 0 &&
      !this.game.hero.firstRosePut &&
      this.game.hero.arrived
    ) {
      this.actionText = 'Place rose';
    } else if (
      this.game.world.sheds.some(
        shed =>
          this.game.hero.position.x === shed.x &&
          this.game.hero.position.y === shed.y + TILE_SIZE &&
          !shed.isExplored
      ) &&
      !this.game.hero.currentItem &&
      !this.game.heroWins &&
      !this.game.isNight
    ) {
      this.actionText = 'Explore';
    } else if (
      this.game.world.gates.some(
        gate =>
          (((this.game.hero.position.x === gate.x &&
            this.game.hero.position.y === gate.y - TILE_SIZE) ||
            (this.game.hero.position.x === gate.x &&
              this.game.hero.position.y === gate.y + TILE_SIZE)) &&
            gate.isLocked &&
            gate.width === 16) ||
          ((((this.game.hero.position.x === gate.x ||
            this.game.hero.position.x === gate.x + TILE_SIZE) &&
            this.game.hero.position.y === gate.y - TILE_SIZE) ||
            ((this.game.hero.position.x === gate.x ||
              this.game.hero.position.x === gate.x + TILE_SIZE) &&
              this.game.hero.position.y === gate.y + TILE_SIZE)) &&
            gate.isLocked &&
            gate.width === 32 &&
            gate.forSector === "Oliver's Gully")
      ) &&
      !this.game.hero.currentItem &&
      this.game.hero.hasKey &&
      !this.game.isNight
    ) {
      this.actionText = 'Unlock';
    } else if (
      this.game.world.gates.some(
        gate =>
          (((this.game.hero.position.x === gate.x ||
            this.game.hero.position.x === gate.x + TILE_SIZE) &&
            this.game.hero.position.y === gate.y - TILE_SIZE) ||
            ((this.game.hero.position.x === gate.x ||
              this.game.hero.position.x === gate.x + TILE_SIZE) &&
              this.game.hero.position.y === gate.y + TILE_SIZE)) &&
          gate.isLocked &&
          gate.width === 32 &&
          gate.forSector === 'Murder Field'
      ) &&
      !this.game.hero.currentItem &&
      this.game.hero.hasKey &&
      this.game.level === 4 &&
      !this.game.isNight
    ) {
      this.actionText = 'Unlock';
    } else if (
      this.game.npcs.some(
        npc =>
          this.game.checkCircleCollision(
            this.game.hero.collisionScope,
            npc.interactionScope
          )[0]
      ) &&
      !this.game.isNight &&
      !this.isMoving &&
      !this.isInteractingWithNpc &&
      // this.game.hero.actionUpdate &&
      this.game.hero.isGreeted &&
      !this.game.hero.interactionOut.playing()
    ) {
      this.actionText = 'Talk';
    } else if (
      this.game.world.fontains.some(
        fontain =>
          this.game.checkCircleCollision(this.game.hero.collisionScope, {
            x: fontain.x + HALF_TILE_SIZE,
            y: fontain.y + TILE_SIZE + HALF_TILE_SIZE,
            radius: fontain.radius,
          })[0]
      ) &&
      !this.game.hero.isAttacking &&
      !this.game.hero.isTakingDamage &&
      !this.game.isNight
    ) {
      if (!this.game.hero.currentItem && this.game.hero.health < 100) {
        this.actionText = 'Drink';
      } else if (
        this.game.hero.currentItem?.name === 'Bottle' &&
        !this.game.bottle.isFilled
      ) {
        this.actionText = 'Refill';
      } else {
        this.actionText = '';
      }
    } else if (
      !this.game.heroWins &&
      this.game.hero.isGreeted &&
      this.game.hero.position.x === this.game.world.saveSpot.x &&
      this.game.hero.position.y === this.game.world.saveSpot.y &&
      !this.game.isNight &&
      this.game.hero.direction === 'UP'
    ) {
      this.actionText = 'Save game';
    } else if (
      this.game.items.some(
        item =>
          this.game.checkCircleCollision(this.game.hero.collisionScope, {
            x: item.position.scopeX,
            y: item.position.scopeY,
            radius: item.position.radius,
          })[0] &&
          item.canBeFound &&
          item !== this.game.weapons
      ) &&
      !this.game.hero.currentItem &&
      !this.game.heroWins
    ) {
      this.actionText = 'Explore';
    } else {
      setTimeout(() => {
        this.actionText = '';
      }, 250);
    }
  }

  //Info Text
  drawInfoText(ctx) {
    if (this.infoTextVisible) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

      ctx.fillRect(
        -this.game.camera.x,
        -this.game.camera.y + GAME_HEIGHT * 0.25 - 14,
        GAME_WIDTH,
        20
      );

      ctx.font = '10px EarlyGameBoy';
      ctx.fillStyle = 'rgba(17, 24, 31, 1)';
      ctx.fillText(
        this.infoText,
        -this.game.camera.x + GAME_WIDTH / 2 + 1,
        -this.game.camera.y + GAME_HEIGHT * 0.25 + 1
      );

      ctx.fillStyle = 'rgba(255,255,255,1)';
      ctx.fillText(
        this.infoText,
        -this.game.camera.x + GAME_WIDTH / 2,
        -this.game.camera.y + GAME_HEIGHT * 0.25
      );
    }
  }

  updateInfoText(deltaTime) {
    //Update timer
    if (this.infoTextTimer < this.infoTextTimeout) {
      this.infoTextTimer += deltaTime;
      this.infoTextVisible = true;
    } else {
      this.infoTextVisible = false;
      // this.infoText = '';
    }

    //Intro Tutorial
    if (!this.game.isPaused && !this.game.hero.isGreeted) {
      if (
        !this.game.hero.movedUp ||
        !this.game.hero.movedDown ||
        !this.game.hero.movedLeft ||
        !this.game.hero.movedRight
      ) {
        setTimeout(() => {
          this.infoText = 'Press Arrow Keys To Move!';
          this.infoTextTimer = 0;
        }, 500);
      } else if (
        this.game.hero.movedUp &&
        this.game.hero.movedDown &&
        this.game.hero.movedLeft &&
        this.game.hero.movedRight &&
        !this.game.hero.sneaked
      ) {
        setTimeout(() => {
          this.infoText = 'Press Z To Crouch!';
          this.infoTextTimer = 0;
        }, 500);
      } else if (
        this.game.hero.movedUp &&
        this.game.hero.movedDown &&
        this.game.hero.movedLeft &&
        this.game.hero.movedRight &&
        this.game.hero.sneaked &&
        !this.game.hero.rolled
      ) {
        setTimeout(() => {
          this.infoText = 'Press X To Roll!';
          this.infoTextTimer = 0;
        }, 500);
      } else if (
        this.game.hero.movedUp &&
        this.game.hero.movedDown &&
        this.game.hero.movedLeft &&
        this.game.hero.movedRight &&
        this.game.hero.rolled &&
        this.game.hero.sneaked &&
        !this.game.npcs.some(
          npc =>
            this.game.checkCircleCollision(
              this.game.hero.collisionScope,
              npc.interactionScope
            )[0]
        )
      ) {
        setTimeout(() => {
          this.infoText = 'Find Father Gabriel!';
          this.infoTextTimer = 0;
        }, 500);
      } else if (
        this.game.npcs.some(
          npc =>
            this.game.checkCircleCollision(
              this.game.hero.collisionScope,
              npc.interactionScope
            )[0]
        )
      ) {
        setTimeout(() => {
          this.infoText = 'Press A To Talk!';
          this.infoTextTimer = 0;
        }, 500);
      }
    }
    //Gates - sectors names
    for (let i = 0; i < this.game.world.gates.length; i++) {
      const gate = this.game.world.gates[i];

      if (
        this.game.hero.position.x === gate.x &&
        this.game.hero.position.y > gate.y - TILE_SIZE &&
        this.game.hero.position.y < gate.y + TILE_SIZE &&
        gate.width === 16
      ) {
        this.game.ui.infoTextTimer = 0;
        if (!this.info.playing()) {
          this.info.play();
        }
        if (gate.forSector === 'Memorial Meadow') {
          if (this.game.hero.direction === 'UP') {
            this.game.ui.infoText = 'Memorial Meadow';
          }

          if (this.game.hero.direction === 'DOWN') {
            this.game.ui.infoText = "People's Garden";
          }
        }
        if (gate.forSector === 'Marquess Alley') {
          if (this.game.hero.direction === 'UP') {
            this.game.ui.infoText = "People's Garden";
          }

          if (this.game.hero.direction === 'DOWN') {
            this.game.ui.infoText = 'Marquess Alley';
          }
        }
      }

      if (
        (this.game.hero.position.x === gate.x ||
          this.game.hero.position.x === gate.x + TILE_SIZE) &&
        this.game.hero.position.y > gate.y - TILE_SIZE &&
        this.game.hero.position.y < gate.y + TILE_SIZE &&
        gate.width === 32
      ) {
        this.game.ui.infoTextTimer = 0;
        if (!this.info.playing()) {
          this.info.play();
        }

        if (gate.forSector === "Oliver's Gully") {
          if (this.game.hero.direction === 'UP') {
            this.game.ui.infoText = "Oliver's Gully";
          }

          if (this.game.hero.direction === 'DOWN') {
            this.game.ui.infoText = "People's Garden";
          }
        }
        if (gate.forSector === 'Murder Field') {
          if (this.game.hero.direction === 'UP') {
            this.game.ui.infoText = "People's Garden";
          }

          if (this.game.hero.direction === 'DOWN') {
            this.game.ui.infoText = 'Murder Field';
          }
        }
      }
    }
  }

  //Color Correction Console
  applyColorCorrectionFilter() {
    this.colorCorrectionConsole.selectedCanvas.filter = `blur(${this.colorCorrectionConsole.options.blur}px) brightness(${this.colorCorrectionConsole.options.brightness}%) contrast(${this.colorCorrectionConsole.options.contrast}%) grayscale(${this.colorCorrectionConsole.options.grayscale}%) invert(${this.colorCorrectionConsole.options.invert}%) opacity(${this.colorCorrectionConsole.options.opacity}%) saturate(${this.colorCorrectionConsole.options.saturate}%) sepia(${this.colorCorrectionConsole.options.sepia}%) hue-rotate(${this.colorCorrectionConsole.options.hueRotate}deg `;
  }

  updateColorCorrectionConsole(ctx, ctxTop) {
    if (this.colorCorrectionConsole.isVisible) {
      this.colorCorrectionConsole.selectedCanvas = ctx;

      //Menu toggle
      if (
        this.colorCorrectionConsoleCanChangeOption &&
        this.game.input.lastMovementKey === DOWN
      ) {
        this.colorCorrectionConsoleTimer = 0;
        this.toggle.play();
        if (
          this.colorCorrectionConsole.optionIndex <
          Object.keys(this.colorCorrectionConsole.options).length - 1
        ) {
          this.colorCorrectionConsole.optionIndex++;
          this.colorCorrectionConsole.selectedOption = Object.keys(
            this.colorCorrectionConsole.options
          )[this.colorCorrectionConsole.optionIndex];
        }
      }

      if (
        this.colorCorrectionConsoleCanChangeOption &&
        this.game.input.lastMovementKey === UP
      ) {
        this.colorCorrectionConsoleTimer = 0;
        this.toggle.play();
        if (this.colorCorrectionConsole.optionIndex > 0) {
          this.colorCorrectionConsole.optionIndex--;

          this.colorCorrectionConsole.selectedOption = Object.keys(
            this.colorCorrectionConsole.options
          )[this.colorCorrectionConsole.optionIndex];
        }
      }

      for (
        let i = 0;
        i < Object.keys(this.colorCorrectionConsole.options).length;
        i++
      ) {
        const key = Object.keys(this.colorCorrectionConsole.options)[i];

        if (
          this.colorCorrectionConsoleCanChangeOption &&
          key === this.colorCorrectionConsole.selectedOption
        ) {
          if (this.game.input.lastMovementKey === RIGHT) {
            this.colorCorrectionConsole.options[key]++;

            this.applyColorCorrectionFilter();
            this.colorCorrectionConsoleTimer = 0;
            this.select.play();
          } else if (this.game.input.lastMovementKey === LEFT) {
            this.colorCorrectionConsole.options[key]--;

            this.applyColorCorrectionFilter();
            this.colorCorrectionConsoleTimer = 0;
            this.select.play();
          }
        }
      }
    } else {
      this.colorCorrectionConsole.selectedOption = 0;
    }
  }

  drawColorCorrectionConsole(ctx) {
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';

    ctx.font = '10px Arial';
    ctx.fillText(
      `Color Correction Console - ${this.colorCorrectionConsole.selectedCanvasText}`,
      -this.game.camera.x + 8,
      -this.game.camera.y + 60
    );

    for (
      let i = 0;
      i < Object.entries(this.colorCorrectionConsole.options).length;
      i++
    ) {
      const [key, value] = Object.entries(this.colorCorrectionConsole.options)[
        i
      ];

      if (key === this.colorCorrectionConsole.selectedOption) {
        ctx.fillStyle = 'rgb(231, 255, 12)'; //ok?
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      }
      ctx.font = '10px Arial';
      ctx.fillText(
        key,
        -this.game.camera.x + 8,
        -this.game.camera.y + 72 + i * 12
      );
      ctx.fillText(
        value,
        -this.game.camera.x + 96,
        -this.game.camera.y + 72 + i * 12
      );
    }
  }
}
