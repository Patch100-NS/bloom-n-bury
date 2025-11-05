'use strict';
export const UP = 'UP';
export const DOWN = 'DOWN';
export const LEFT = 'LEFT';
export const RIGHT = 'RIGHT';
export const SPACE = 'SPACE';

export class Input {
  constructor(game) {
    this.game = game;
    this.movementKeys = [];
    this.actionKeys = [];

    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp') {
        this.movementKeyPressed(UP);
      } else if (e.key === 'ArrowDown') {
        this.movementKeyPressed(DOWN);
      } else if (e.key === 'ArrowLeft') {
        this.movementKeyPressed(LEFT);
      } else if (e.key === 'ArrowRight') {
        this.movementKeyPressed(RIGHT);
      } else if (e.key === ' ') {
        this.actionKeyPressed(SPACE);
      } else if (e.key.toLocaleLowerCase() === 'c') {
        this.actionKeyPressed('c');
      } else if (e.key.toLocaleLowerCase() === 'x') {
        this.actionKeyPressed('x');
      } else if (
        e.key.toLocaleLowerCase() === 'z' ||
        e.key.toLocaleLowerCase() === 'y'
      ) {
        this.actionKeyPressed('z');
        // } else if (e.key.toLocaleLowerCase() === 'b') {
        //   this.game.toggleDebug();
      } else if (e.key.toLocaleLowerCase() === 'a') {
        this.actionKeyPressed('a');
      } else if (e.key.toLocaleLowerCase() === 'enter') {
        this.actionKeyPressed('enter');
      } else if (e.key.toLocaleLowerCase() === '1') {
        this.actionKeyPressed('1');
      } else if (e.key.toLocaleLowerCase() === '2') {
        this.actionKeyPressed('2');
      } else if (e.key.toLocaleLowerCase() === '3') {
        this.actionKeyPressed('3');
      } else if (e.key.toLocaleLowerCase() === '4') {
        this.actionKeyPressed('4');
        // } else if (e.key.toLocaleLowerCase() === 'r') {
        //   this.game.graves.forEach(grave => {
        //     if (grave.sector.name === this.game.currentSector) {
        //       grave.isLocked = true;
        //     }
        //   });
      } else if (
        e.key.toLocaleLowerCase() === 'p' ||
        e.key.toLocaleLowerCase() === 'escape'
      ) {
        e.preventDefault();
        if (
          !this.game.ui.dialogMenu.isVisible &&
          !this.game.ui.introScreen.isVisible &&
          !this.game.ui.mainMenu.isVisible &&
          !this.game.ui.gameOverMenu.isVisible &&
          !this.game.ui.settingsMain.isVisible &&
          !this.game.ui.settingsPause.isVisible &&
          !this.game.ui.stats.isVisible &&
          !this.game.ui.controls.isVisible &&
          !this.game.ui.letter.isVisible &&
          !this.game.ui.credits.isVisible &&
          !this.game.heroWins &&
          !this.game.hero.isInteractingWithNpc
        ) {
          if (!this.game.ui.journal.isVisible) {
            this.game.isPaused = !this.game.isPaused;
          }

          this.game.isPaused
            ? this.game.ui.select.play()
            : this.game.ui.back.play();
          this.game.ui.pauseMenu.optionIndex = 0;

          this.game.ui.pauseMenu.isVisible = !this.game.ui.pauseMenu.isVisible;

          this.game.ui.mainMenu.selectedOption =
            this.game.ui.mainMenu.availableOptions[0];
        }
        // } else if (e.key.toLocaleLowerCase() === 'h') {
        //   this.game.demon.health = 0;
        // } else if (e.key.toLocaleLowerCase() === 'n') {
        //   if (this.game.isNight) {
        //     this.game.clock = 6;
        //   } else {
        //     this.game.clock = 0;
        //   }
        // } else if (e.key.toLocaleLowerCase() === 'g') {
        //   this.game.godMode = !this.game.godMode;
        //   this.game.hero.activateGod();
        // } else if (e.key === '+') {
        //   this.game.timeAccelerator += 1000;
        // } else if (e.key === '-') {
        //   this.game.timeAccelerator -= 1000;
        // } else if (e.key === '*') {
        //   this.game.numZombiesAlpha += 4;
        //   this.game.numZombiesBeta += 3;
        //   this.game.numZombiesGamma += 2;
        //   this.game.numZombiesDelta += 1;
        //   this.game.zombiesCounter += 10;
        // } else if (e.key === '/') {
        //   this.game.numZombiesAlpha -= 4;
        //   this.game.numZombiesBeta -= 3;
        //   this.game.numZombiesGamma -= 2;
        //   this.game.numZombiesDelta -= 1;
        //   this.game.zombiesCounter -= 10;
        // } else if (e.key === '0') {
        //   this.game.clock++;
        // } else if (e.key.toLocaleLowerCase() === 'q') {
        //   this.game.ui.colorCorrectionConsole.isVisible =
        //     !this.game.ui.colorCorrectionConsole.isVisible;

        //   // this.game.isPaused = !this.game.isPaused;
        //   this.game.ui.colorCorrectionConsole.optionIndex = 0;
        //   this.game.ui.colorCorrectionConsole.selectedOption = Object.keys(
        //     this.game.ui.colorCorrectionConsole.options
        //   )[this.game.ui.colorCorrectionConsole.optionIndex];
      } else if (e.key.toLocaleLowerCase() === 'j') {
        if (
          !this.game.ui.dialogMenu.isVisible &&
          !this.game.ui.introScreen.isVisible &&
          !this.game.ui.mainMenu.isVisible &&
          !this.game.ui.pauseMenu.isVisible &&
          !this.game.ui.gameOverMenu.isVisible &&
          !this.game.ui.settingsMain.isVisible &&
          !this.game.ui.settingsPause.isVisible &&
          !this.game.ui.stats.isVisible &&
          !this.game.ui.controls.isVisible &&
          !this.game.ui.letter.isVisible &&
          !this.game.ui.credits.isVisible &&
          this.game.hero.isGreeted &&
          !this.game.hero.isInteractingWithNpc
        ) {
          this.game.isPaused = !this.game.isPaused;
          this.game.ui.journal.isVisible = !this.game.ui.journal.isVisible;

          this.game.isPaused
            ? this.game.ui.select.play()
            : this.game.ui.back.play();
        }
      }
    });

    window.addEventListener('keyup', e => {
      if (e.key === 'ArrowUp') {
        this.movementKeyReleased(UP);
      } else if (e.key === 'ArrowDown') {
        this.movementKeyReleased(DOWN);
      } else if (e.key === 'ArrowLeft') {
        this.movementKeyReleased(LEFT);
      } else if (e.key === 'ArrowRight') {
        this.movementKeyReleased(RIGHT);
      } else if (e.key.toLocaleLowerCase() === 'c') {
        this.actionKeyReleased('c');
      } else if (e.key.toLocaleLowerCase() === 'x') {
        this.actionKeyReleased('x');
      } else if (
        e.key.toLocaleLowerCase() === 'z' ||
        e.key.toLocaleLowerCase() === 'y'
      ) {
        this.actionKeyReleased('z');
      } else if (e.key.toLocaleLowerCase() === 'a') {
        this.actionKeyReleased('a');
      } else if (e.key.toLocaleLowerCase() === 'enter') {
        this.actionKeyReleased('enter');
      } else if (e.key === '1') {
        this.actionKeyReleased('1');
      } else if (e.key === '2') {
        this.actionKeyReleased('2');
      } else if (e.key === '3') {
        this.actionKeyReleased('3');
      } else if (e.key === '4') {
        this.actionKeyReleased('4');
      } else if (e.key.toLocaleLowerCase() === 'j') {
        this.actionKeyReleased('j');
      }
    });
  }

  movementKeyPressed(key) {
    if (this.movementKeys.indexOf(key) === -1) {
      this.movementKeys.unshift(key);
    }
  }

  movementKeyReleased(key) {
    const index = this.movementKeys.indexOf(key);
    if (index === -1) return; //Guard clause
    this.movementKeys.splice(index, 1);
  }

  actionKeyPressed(key) {
    if (this.actionKeys.indexOf(key) === -1) {
      this.actionKeys.unshift(key);
    } else {
      // this.actionKeys.shift(key);
    }
  }

  actionKeyReleased(key) {
    const index = this.actionKeys.indexOf(key);
    if (index === -1) return; //Guard clause

    this.actionKeys.splice(index, 1);
  }

  get lastMovementKey() {
    return this.movementKeys[0];
  }
  get lastActionKey() {
    return this.actionKeys[0];
  }
  //getteri binduju properti objekta funkciji - ta funkcija bice pozvana kada se pristupi propertiju input.lastKey i vratice poslednje pritisnuto dugme
}
