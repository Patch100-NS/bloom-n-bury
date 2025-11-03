'Use strict';

import { World } from './scripts/world.js';
import { Hero } from './scripts/hero.js'; // ./ - 1 level down
import { Input } from './scripts/input.js';
import { Camera } from './scripts/camera.js';
import { Grave } from './scripts/grave.js';
import { Alpha, Beta, Gamma, Delta } from './scripts/zombie.js';
import { Crow } from './scripts/crow.js';
import { Npc } from './scripts/npc.js';
import { stringify, parse } from 'flatted';
import { Demon } from './scripts/demon.js';
import { Ui } from './scripts/ui.js';
import { Howl } from 'howler';
import musicDayURL from './Audio/Music/Day_Loop.mp3';
import musicDeathURL from './Audio/Music/Death.mp3';
import musicCombatURL from './Audio/Music/Night_Fight.mp3';
import musicDemonDayURL from './Audio/Music/Demon_Fight.mp3';
import musicDemonIntroURL from './Audio/Music/Demon_Intro.mp3';
import musicDemonZombiestURL from './Audio/Music/Demon_Zombie_In.mp3';
import musicDemonNightURL from './Audio/Music/Demon_Zombie_Loop.mp3';
import letterMusicURL from './Audio/Music/Letter.mp3';
import mainMenuMusicURL from './Audio/Music/Main Menu.mp3';
import musicCrowURL from './Audio/Music/Night_Crow loop.mp3';
import musicNightURL from './Audio/Music/Night_Roam.mp3';
import musicHeroWinsURL from './Audio/Music/Victory.mp3';

export const TILE_SIZE = 16;
export const HALF_TILE_SIZE = TILE_SIZE / 2;
export const GAME_ROWS = 18;
export const GAME_COLS = 24; // Resolution: 384x288
export const GAME_WIDTH = GAME_COLS * TILE_SIZE;
export const GAME_HEIGHT = GAME_ROWS * TILE_SIZE;
export const WORLD_ROWS = 128;
export const WORLD_COLS = 128;
export const WORLD_WIDTH = WORLD_COLS * TILE_SIZE;
export const WORLD_HEIGHT = WORLD_ROWS * TILE_SIZE;

window.addEventListener('load', function () {
  const canvas = this.document.getElementById('canvas--main');
  const canvasTop = this.document.getElementById('canvas--top');
  const ctx = canvas.getContext('2d');
  const ctxTop = canvasTop.getContext('2d');

  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;

  //1 Stavljamo inicijalnu vecu rezoluciju nekoliko puta
  canvasTop.width = GAME_WIDTH * 4;
  canvasTop.height = GAME_HEIGHT * 4;
  //2. Kako bismo  mogli sve skejlati isti broj puta - CSS Canvas odredjuje finalnu rezoluciju
  ctxTop.scale(4, 4);

  ctx.font = ctxTop.font = '14px EarlyGameBoy';
  ctx.textRendering = ctxTop.textRendering = 'geometricPrecision';
  ctx.imageSmoothingEnabled = ctxTop.imageSmoothingEnabled = false;

  class Game {
    constructor() {
      //Classes
      this.input = new Input(this);
      this.hero = new Hero({
        sprite: {
          image: document.getElementById('hero-day-shovel-false'),
          x: 0,
          y: 2,
          width: 32,
          height: 32,
        },
        position: {
          x: 67 * TILE_SIZE,
          y: 9 * TILE_SIZE,
          width: TILE_SIZE,
          height: TILE_SIZE,
          scopeX: 67 * TILE_SIZE + HALF_TILE_SIZE,
          scopeY: 9 * TILE_SIZE + HALF_TILE_SIZE,
        },
        game: this,
        scale: 1,
      });
      this.camera = new Camera(this); //must be after player
      this.world = new World(this); //Must be after Camera
      this.ui = new Ui(this);
      this.demon = new Demon({
        sprite: {
          image: document.getElementById('demon-sprite-false'),
          x: 0,
          y: 6,
          width: 48,
          height: 48,
        },
        position: {
          x: 107 * TILE_SIZE,
          y: 89 * TILE_SIZE,
          width: TILE_SIZE,
          height: TILE_SIZE,
          scopeX: 107 * TILE_SIZE + HALF_TILE_SIZE,
          scopeY: 89 * TILE_SIZE + HALF_TILE_SIZE,
        },
        game: this,
        scale: 1,
      });

      //First run
      this.isGameVisible = true;
      this.isPlayingMusic = true;
      this.isPlayingSFX = true;
      this.init();
      this.isInitialized = false; //Loading...
    }

    init() {
      this.hero.spotPointsTiles = this.world.spotPointsTiles;

      this.gameObjects = []; //hero, zombies, npc...
      this.deletedGameObjects = [];

      //Zombies
      this.zombies = [];
      this.zombieCollisionScopes = [];

      this.zombiesInCombat = [];
      this.zombiesInCombatCollisionScopes = [];
      this.zombiesInInteractionScopes = [];
      this.zobiesRoses = [];
      this.rosesNotCollected = [];
      this.pathFindingQueue = [];

      this.numZombiesMax = 500;
      this.numZombiesAlphaMax = 0.4 * this.numZombiesMax;
      this.numZombiesBetaMax = 0.3 * this.numZombiesMax;
      this.numZombiesGammaMax = 0.2 * this.numZombiesMax;
      this.numZombiesDeltaMax = 0.1 * this.numZombiesMax;
      this.zombiesCounter = 0; //debug only

      //Crows
      this.numCrows = 3;
      this.crows = [];

      //Graves
      this.graves = [];
      this.addGraves();

      //Items
      this.scarecrow = {
        game: this.hero.game,
        name: 'Scarecrow',
        rank: 3,
        position: [
          {
            scopeX: 47 * TILE_SIZE + HALF_TILE_SIZE,
            scopeY: 6 * TILE_SIZE + HALF_TILE_SIZE,
            radius: TILE_SIZE * 2,
            x: 47 * TILE_SIZE,
            y: 6 * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
          },
          {
            scopeX: 61 * TILE_SIZE + HALF_TILE_SIZE,
            scopeY: 16 * TILE_SIZE + HALF_TILE_SIZE,
            radius: TILE_SIZE,
            x: 61 * TILE_SIZE,
            y: 16 * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
          },
          {
            scopeX: 6 * TILE_SIZE + HALF_TILE_SIZE,
            scopeY: 33 * TILE_SIZE + HALF_TILE_SIZE,
            radius: TILE_SIZE * 2,
            x: 6 * TILE_SIZE,
            y: 33 * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
          },
          {
            scopeX: 10 * TILE_SIZE + HALF_TILE_SIZE,
            scopeY: 57 * TILE_SIZE + HALF_TILE_SIZE,
            radius: TILE_SIZE * 1.4,
            x: 10 * TILE_SIZE,
            y: 57 * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
          },
          {
            scopeX: 6 * TILE_SIZE + HALF_TILE_SIZE,
            scopeY: 46 * TILE_SIZE + HALF_TILE_SIZE,
            radius: TILE_SIZE,
            x: 6 * TILE_SIZE,
            y: 46 * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
          },
        ][Math.trunc(Math.random() * 5)],

        sprite: {
          image: document.getElementById('item-sprite-scarecrow'),
          x: 0,
          y: 0,
          width: 32,
          height: 32,
        },

        canBeFound: false, //if interacted with NPC
        canBePlaced: false,
        canBePicked: false,
        isFound: false,
        isActivated: false,
        interactionScopeRadius: 0,
        collisionScopeRadius: HALF_TILE_SIZE / 2,

        update(deltaTime, ctx, ctxTop) {
          //Updates scope
          this.position.scopeX = this.position.x + HALF_TILE_SIZE;
          this.position.scopeY = this.position.y + HALF_TILE_SIZE;

          //Updates transparency/collision
          if (this.isActivated) {
            this.position.radius = TILE_SIZE; //to prevent removing scarecrow right away

            if (
              [this.game.hero, this.game.demon, ...this.game.zombies].some(
                object =>
                  this.game.checkCircleCollision(object?.collisionScope, {
                    x: this.position.scopeX,
                    y: this.position.scopeY,
                    radius: this.collisionScopeRadius,
                  })[0]
              )
            ) {
              this.sprite.y = 1;
            } else {
              this.sprite.y = 0;
            }
          }
        },

        draw(ctx) {
          if (this.isActivated) {
            ctx.drawImage(
              this.sprite.image,
              this.sprite.x * this.sprite.width,
              this.sprite.y * this.sprite.height,
              this.sprite.width,
              this.sprite.height,
              this.position.x - HALF_TILE_SIZE,
              this.position.y - TILE_SIZE,
              this.sprite.width,
              this.sprite.height
            );
          }
        },
      };
      this.bottle = {
        name: 'Bottle',
        rank: 2,
        position: {
          scopeX: 118 * TILE_SIZE + HALF_TILE_SIZE,
          scopeY: 8 * TILE_SIZE + HALF_TILE_SIZE,
          radius: HALF_TILE_SIZE / 2,
          x: 118 * TILE_SIZE,
          y: 8 * TILE_SIZE,
        },
        canBeFound: false, //if interacted with
        isFound: false,
        isFilled: false,
        canBeUsed: false,
        waterLeft: this.level * 10,
        healthBoost: this.level * 20,
        isActivated: false,
      };
      this.hourglass = {
        name: 'Hourglass',
        rank: 4,
        position: [
          {
            scopeX: 13 * TILE_SIZE + HALF_TILE_SIZE,
            scopeY: 67 * TILE_SIZE + HALF_TILE_SIZE,
            radius: 10,
            x: 13 * TILE_SIZE,
            y: 67 * TILE_SIZE,
          },
          {
            scopeX: 30 * TILE_SIZE + HALF_TILE_SIZE,
            scopeY: 67 * TILE_SIZE + HALF_TILE_SIZE,
            radius: 10,
            x: 30 * TILE_SIZE,
            y: 67 * TILE_SIZE,
          },
          {
            scopeX: 17 * TILE_SIZE + HALF_TILE_SIZE,
            scopeY: 71 * TILE_SIZE + HALF_TILE_SIZE,
            radius: 10,
            x: 17 * TILE_SIZE,
            y: 71 * TILE_SIZE,
          },
          {
            scopeX: 26 * TILE_SIZE + HALF_TILE_SIZE,
            scopeY: 71 * TILE_SIZE + HALF_TILE_SIZE,
            radius: 10,
            x: 26 * TILE_SIZE,
            y: 71 * TILE_SIZE,
          },
          {
            scopeX: 53 * TILE_SIZE + HALF_TILE_SIZE,
            scopeY: 95 * TILE_SIZE + HALF_TILE_SIZE,
            radius: 10,
            x: 53 * TILE_SIZE,
            y: 95 * TILE_SIZE,
          },
        ][Math.trunc(Math.random() * 5)],
        canBeFound: false, //if interacted with
        isFound: false,
        canBeUsed: false,
        roseCounter: 50,
      };
      this.candles = {
        name: 'Candles',
        rank: 1,
        position: {
          scopeX: 64 * TILE_SIZE + HALF_TILE_SIZE,
          scopeY: 9 * TILE_SIZE + HALF_TILE_SIZE,
          radius: HALF_TILE_SIZE,
          x: 64 * TILE_SIZE,
          y: 9 * TILE_SIZE,
        },
        canBeFound: false, //if interacted with
        isFound: false,
        canBePlaced: false,
        counter: 60,
        day: 0,
      };
      this.weapons = {
        name: 'Weapons',
        rank: 5,
        position: {
          scopeX: 0,
          scopeY: 0,
          radius: 0,
          x: 0,
          y: 0,
        },
        canBeFound: true, //if second sector
        isFound: false, //update Mortimer
      };
      this.items = [];
      this.items.push(
        this.scarecrow,
        this.bottle,
        this.hourglass,
        this.candles,
        this.weapons
      );

      //NPCs
      this.npcsData = [
        {
          name: 'Father Gabriel',
          position: { x: 49 * TILE_SIZE, y: 44 * TILE_SIZE },
          item: this.candles,
          text: [
            `Geezer, you came! I was beginning to fear that letter found its way to the wrong grave. This place, it's not as it was. The dead rise at night, and the living whisper of curses, omens, things they do not dare name. I rely on you to put an end to this misery once and for all. Take these, and lay them upon the graves in the sunlight, and those beneath shall sleep undisturbed throughout the night. You'll need this as well. For digging, yes, and I know it's not much of a blade but it will have to do for now. The Lord may grant mercy, but the dead will not. Lastly, remember that you can always return to the church during the day and take a breather before you continue your fight against evil.Goodspeed my son!`,
            `Bless you, my child. I see you've already begun your sacred duty. I had prepared a batch of 60 candles for you, to light your way at night. Yet for the good of God in me I cannot remember where exactly. The last time I had them was this morning while I was fixing the northern gate.`,
            `I see you have found the candles! Place them during the day when standing atop of gravestones and they will shine through the night. Careful with the use of them since they are few and graves are many and dark, the ones in Oliver's Gully especially.`,
            `Geezer... you're alive?! Praise be! Then it's true, the evil has been dealt with? The dead no longer stir? My word... you've done it. This graveyard, my backyard of sorrow, may finally know peace again. I suppose you're off now, more graves to tend, more roses to place, more quiet wars to win. Wherever you go next, may the path rise to meet your feet, and may the earth stay closed behind you. Go well, my son, and know that I, and countless souls now at rest, bear gratitude for the courage you've shown and the peace you've brought upon the soil today.
`,
          ],
          hints: [
            {
              text: [
                `-Roses: Father Gabriel gave you 20 Roses, during the day,`,
                `you can place them on graves, to prevent the Zombies`,
                `from raising during night. Return to the church during`,
                `the day to save your progress.`,
              ],
              isUnread: true,
            },
          ],
          secrets: [
            {
              text: [
                `-Father Gabriel lost some candles at the gate to the`,
                `Graveyard entrance.`,
              ],
              isUnread: true,
            },
          ],
          interactionCounter: -1,
          slide: -1,
        },
        {
          name: 'Pierre',
          position: { x: 8 * TILE_SIZE, y: 61 * TILE_SIZE },
          item: 0,
          text: [
            `Geezer! There you are! Now tell me this, what in the blazes is goin' on with people in this town? Here I am, finest florist this side of the cemetery, and what do folks want? Roses. Always roses! 'Oh Pierre, I need a rose for this, I need a rose for that!' Pah! You'd think carnations were poison! But I'll tell you somethin', Geezer, those that don't like carnations don't even deserve to live! Hmph! A rose is a rose, bah, nothing to write home about, but carnations, now there's a refined taste in smell, colour and spirit! Mark my words, one day, they'll all see what they've been missin'. Until then? I'll just be here, watchin' everyone fawn over their precious roses, mutterin' to myself and shakin' my head. Now, now, don't worry 'bout me too much, I ain't scared of the things that slink through these parts. Long as I keep my head down 'round them crows, I make it out just fine, scratch-free. Those buggers got sharp eyes, but they ain't much for lookin' low. You ever find yourself near 'em, best follow my lead, keep low, stay quiet, and let 'em squawk at someone else.`,
            `Unbelievable! Un-bloody-believable! Here you are, parading around with roses like some lovesick poet while my carnations sit here, unloved, unappreciated and bloody ignored! Oh, but nooo, everyone wants roses. Roses, roses, roses! But do they stop to consider the humble carnation? The dignified carnation? No! And you! I thought you had taste, Geezer! Thought you had class! But look at you, draped in those wretched petals like a graveyard fool! Bah! I swear, those who spurn carnations don't even deserve to live! But fine. Go on. Keep your precious roses. But when the day comes that you see the error of your ways, don't come crawling to me!`,
          ],
          hints: [
            {
              text: [
                `-Sneak: Crows act as alarms, if they see you, they'll`,
                `attract enemies. Try sneaking in their presence to avoid`,
                `detection`,
              ],
              isUnread: true,
            },
          ],
          interactionCounter: -1,
          slide: -1,
        },
        {
          name: 'John',
          position: { x: 42 * TILE_SIZE, y: 85 * TILE_SIZE },
          item: this.hourglass,
          text: [
            `Hey there, youngster! Ha! Heard the locals been givin' ya a hard time! Hahaha! Shame you can't just turn the day in your favor, eh? Ha! Wouldn't that be somethin'? Y'know... my older brother, may he rot in his grave, the old cheat, used to pull that trick all the tiiiiime with his fancy hourglass doo-hickey. He's buried in one of our family chapels not far from here. He won't mind, and neither do I for that matter, if you... say... borrow it. Not like he's got any use for it now, eh? Ha! Haaa!`,
            `HA! I bet my brother's rollin' in his grave knowin' his precious hourglass is in your hands! Serves the bastard right! Now, if you're ever in a bind, slap down on the hourglass turning night into day. Just be careful how you use it, it takes like forever to get it to work again!`,
          ],
          secrets: [
            {
              text: [
                `-A time manipulating hourglass is buried within John's`,
                `family chapel, if there ever was a time to go digging`,
                `through the dirt, this would be it.`,
              ],
              isUnread: true,
            },
          ],
          interactionCounter: -1,
          slide: -1,
        },
        {
          name: 'Jolene',
          position: { x: 76 * TILE_SIZE, y: 38 * TILE_SIZE },
          item: this.bottle,
          text: [
            `Hail the moonless skies and infinite silence in stars' between - Before me an old fox of silver coat and goodness gleam - With darkest thoughts gather in ire and hateful bile - You wish to strike me down in hasteful act so vile - Fumble not that you can bring harm upon me mortal - For I can relinquish no breath as I hold none in total - Truth be told I wish to spare you knave - For even you can serve a master of graves - I grow tired of the filth that stalk my domain. The brainless lackeys and their master's reign - To do away with them I shall lend you a verse - Listen carefully and decipher what I converse - Seek for an item of vigor and spirit - In a place of healing merit - Where water of life so endlessly flows - You will find aid in vanquishing your foes - Now begone before the roles reverse - And I bury you with another verse.`,
            `Well, well, the silver fox returns in kind - And perhaps he's not a fool so blind - For much like the bumbling drunkards of night - You now bare the flask of vigor's might - So that now you may heal your wounds - When night descends and darkness swoons - Remember to replenish your flask of might - At the fountains beneath the sunlight - Begone now you hindrance - Good luck or good riddance.
            `,
          ],
          secrets: [
            {
              text: [
                `-How did that verse from Jolene go again?`,
                `   "Seek for an item of vigor and spirit`,
                `     In a place of healing merit`,
                `     Where water of life so endlessly flows`,
                `     You will find aid in vanquishing your foes."`,
              ],
              isUnread: true,
            },
          ],
          interactionCounter: -1,
          slide: -1,
        },
        {
          name: 'Mortimer',
          position: { x: 22 * TILE_SIZE, y: 58 * TILE_SIZE },
          item: this.weapons,
          text: [
            `Evenin'. Name's Mortimer, been the local carpenter for erm... long time now... Anyway, if you find any of my spare tools around the grounds, help yourself to 'em. You might find a hammer, a crowbar, hell, maybe something heftier than that old shovel of yours. Don't expect polish, but some of the tools swing truer than they look. Check the sheds, anything you find is yours to keep until the job's done.`,
            `Ah, so you found one of my toys. Good on ya. It felt odd having it gone, like missing a favorite chisel. Still, it's yours now, treat it like a proper tool and it'll treat you right. If you get tired of it, well, I might put up a notice asking for it back. Or not. Your call.`,
          ],
          secrets: [
            {
              text: [
                `-New and stronger weapons can be found by exploring`,
                `Sheds across the Graveyard.`,
              ],
              isUnread: true,
            },
          ],
          interactionCounter: -1,
          slide: -1,
        },

        {
          name: 'Stanley',
          position: { x: 53 * TILE_SIZE, y: 90 * TILE_SIZE },
          item: 0,
          text: [
            `Ah, a local! You there, yes, you, good sir! Might I trouble you for but a moment? This graveyard, dreary as it may seem, once housed a monastery, its monks devoted to the study of divine mysteries. One such brother, Aurelius, sought the legendary Aqua Vitalis, waters said to hold miraculous healing properties, flowing beneath sacred ground. Fascinating, isn't it? Perhaps mere folklore, or perhaps, something more tangible. Not much for conversation, are you? Hmph. No matter, I shouldn't expect a commoner to benefit so easily from the knowledge of written text anyway.`,
            `Can't you see I'm busy working here, buzz off now and dig a latrine or whatever you do around here!`,
          ],
          hints: [
            {
              text: [
                `-Healing: Drink from the Fountains during the day to`,
                `restore health. This cannot be done at night.`,
              ],
              isUnread: true,
            },
          ],
          interactionCounter: -1,
          slide: -1,
        },
        {
          name: 'Thomas',
          position: { x: 58 * TILE_SIZE, y: 22 * TILE_SIZE },
          item: this.scarecrow,
          text: [
            `Geezer! Ain't it 'bout time you retired already? You got them freaks clawing at you night after night, and yet here you are, still kickin'. Gotta admit, you're faster than you look! But speed ain't gonna save you from them damned crows, now is it? Lucky for you, I know someone who can - old Shamus! That's right! Yeah, yeah, the scarecrow. He's got a way of makin' those feathered pests disappear. But he's a tough puppy to catch you know! Last I saw, he was loungin' somewhere here, in Oliver's Gully, hangin' in the bushes like the lazy sack of straw he is! Hah! If you's can catch 'im, it'll mean a whole different story for you my friend.`,
            `No way you actually found Shamus?! Ha! Thought that old sack of straw was lost to the weeds forever! Haloooo Shaaaamus! Doesn't talk much does he!? Hahahaha! Now as you can see our old Shamus is a gentleman of refined, exquisite taste, among which, crows are certainly not included. So, you wanna keep 'em away from you, just prop mr. Shamus here and worry none, crows won't bother you with 'im around.`,
          ],
          secrets: [
            {
              text: [
                `-Shamus the ummm... scarecrow... hangs out in the bushes`,
                `of Oliver's Gully. Can't wait to see this...`,
              ],
              isUnread: true,
            },
          ],
          interactionCounter: -1,
          slide: -1,
        },
        {
          name: 'Dr Adder',
          position: { x: 93 * TILE_SIZE, y: 77 * TILE_SIZE },
          item: 0,
          text: [
            `You've laid more souls to rest than a century of plagues Geezer, I admire your work here indeed. But before you go congratulating yourself, let's talk logistics. You're standing at the precipice of something big, and I'd hate to see all your effort go to waste over poor preparation. So, a word of caution from one professional to another - make the rounds. Check your gear, pay a visit to your friends old and new, especially those you have not greeted yet. Check your journal and make sure your affairs are in order. You wouldn't dig a grave without a shovel, would you? Same principle applies here. What's ahead is, well, let's just say it'll be educational at the very least. Good luck, Geezer. It'd be a real shame to see all your time go to waste.`,
          ],
          hints: [
            {
              text: [
                // `......................................................`,
                `-Boss: Make sure to collect all weapons, and items, before`,
                `proceeding. Don't enter the Murder Fields unprepared.`,
              ],
              isUnread: true,
            },
          ],
          interactionCounter: -1,
          slide: -1,
        },
      ];

      this.addNpcs([this.npcsData[0]]); //Father Gabriel only

      //Visual state
      this.alpha = 0;
      this.animatingTransition = false;
      this.spriteUpdate = false;
      this.spriteTimer = 0;
      this.spriteInterval = 100; //ms

      //Testing
      this.debug = false;
      this.godMode = false;
      this.speedAccelerator = 0;
      this.timeAccelerator = 0;

      //Game state
      this.isPaused = true;
      this.gameOver = false;
      this.heroWins = false;
      this.gameStarted = false; //Start Pressed
      this.isSaved = false;
      this.loadedData = [];
      this.currentSector = "People's Garden";
      this.sectorTracker = ["People's Garden"];
      this.level = 1;
      this.clock = 8;
      this.isNight = false;
      this.isRaining = false;

      //Audio

      this.desired = null;
      this.lastMusicState = null;

      //Music

      this.mainMenuMusic = new Howl({
        src: [mainMenuMusicURL],
        volume: 0.6,
        loop: true,
      });

      this.letterMusic = new Howl({
        src: [letterMusicURL],
        volume: 0.6,
        loop: true,
      });

      this.musicDay = new Howl({
        src: [musicDayURL],
        volume: 0.25,
        loop: true,
      });

      this.musicNight = new Howl({
        src: [musicNightURL],
        volume: 0.25,
        loop: true,
      });

      this.musicCombat = new Howl({
        src: [musicCombatURL],
        volume: 0.25,
        loop: false,
      });

      this.musicDemonDay = new Howl({
        src: [musicDemonDayURL],
        volume: 0.15,
        loop: true,
      });

      this.musicDemonNight = new Howl({
        src: [musicDemonNightURL],
        volume: 0.5,
        loop: true,
      });

      this.musicDemonZombies = new Howl({
        src: [musicDemonZombiestURL],
        volume: 0.5,
        loop: false,
      });

      this.musicDemonIntro = new Howl({
        src: [musicDemonIntroURL],
        volume: 0.15,
        loop: false,
      });

      this.musicDeath = new Howl({
        //check if music is off
        src: [musicDeathURL],
        volume: 0.3,
        loop: false,
      });

      this.musicHeroWins = new Howl({
        src: [musicHeroWinsURL],
        volume: 0.5,
        loop: false,
      });

      this.musicCrow = new Howl({
        src: [musicCrowURL],
        volume: 0.3,
        loop: true,
      });

      //Stats
      this.stats = {
        realTimeElapsed: 0,
        gameTimeElapsed: 0,
        numSaves: 0,
        numLoads: 0,
        npcInteractions: 0,
        shedsExplored: 0,
        itemsFound: 0,
        candlesPlaced: 0,
        scarecrowPlaced: 0,
        bottleUsed: 0,
        hourglassUsed: 0,
        gatesOpened: 0,
        healthRefilled: 0,
        rolls: 0,
        sneaks: 0,
        attacks: 0,
        crowsActivated: 0,
        lightningsDeflected: 0,
        zombiesKilled: 0,
        rosesCollected: 0,
        rosesMissed: 0,
        timesDied: 0,
        demonsKilled: 0,
      };

      //Color Correction Filter
      canvas.style.filter =
        'blur(0px) brightness(100%) contrast(120%) grayscale(0%) invert(0%) opacity(100%) saturate(125%) sepia(0%) hue-rotate(-5deg)';
    }

    startNewGame() {
      localStorage.clear();
      this.init();
      this.hero.init();
      this.camera.init();
      this.world.init();
      this.demon.init();
      this.ui.init(); //reset journal
    }

    //Helpers
    formatTime(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      // Dodaj vodeće nule ako je broj manji od 10
      const pad = num => String(num).padStart(2, '0');

      return `${pad(hours)}h:${pad(minutes)}m:${pad(seconds)}s`;
    }

    //Fisher-Yates Algorithm
    shuffleArray(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.trunc(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]; //destructuring
      }
      return arr;
    }

    moveToGrid(a) {
      const offset = a % TILE_SIZE;
      return Math.trunc(a - offset);
    }

    checkCircleRectCollision(circle, rect) {
      let closeX = circle.x;
      let closeY = circle.y;
      if (circle.x >= rect.x + rect.width) {
        closeX = rect.x + rect.width;
      } else if (circle.x <= rect.x) {
        closeX = rect.x;
      }
      if (circle.y >= rect.y + rect.height) {
        closeY = rect.y + rect.height;
      } else if (circle.y <= rect.y) {
        closeY = rect.y;
      }

      let distX = circle.x - closeX;
      let distY = circle.y - closeY;
      let dist = Math.sqrt(distX * distX + distY * distY);

      return [dist <= circle.radius, { x: closeX, y: closeY }];
    }

    checkCircleCollision(circle1, circle2) {
      const distX = circle1.x - circle2.x;
      const distY = circle1.y - circle2.y;
      const sumOfRadii = circle1.radius + circle2.radius;
      const distance = Math.hypot(distX, distY);

      return [distance <= sumOfRadii, distance, sumOfRadii, distX, distY];
    }

    checkPointCircleColision(circle, point) {
      const distX = circle.x - point.x;
      const distY = circle.y - point.y;
      const distance = Math.hypot(distX, distY);

      if (distance > circle.radius) {
        return false;
      } else {
        return true;
      }
    }

    checkLineLineCollision(line1Start, line1End, line2Start, line2End) {
      const uA =
        ((line2End.x - line2Start.x) * (line1Start.y - line2Start.y) -
          (line2End.y - line2Start.y) * (line1Start.x - line2Start.x)) /
        ((line2End.y - line2Start.y) * (line1End.x - line1Start.x) -
          (line2End.x - line2Start.x) * (line1End.y - line1Start.y));

      const uB =
        ((line1End.x - line1Start.x) * (line1Start.y - line2Start.y) -
          (line1End.y - line1Start.y) * (line1Start.x - line2Start.x)) /
        ((line2End.y - line2Start.y) * (line1End.x - line1Start.x) -
          (line2End.x - line2Start.x) * (line1End.y - line1Start.y));

      if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
        return true;
      } else {
        return false;
      }
    }

    checkRectLineCollision(rect, lineStart, lineEnd) {
      const leftSideColision = this.checkLineLineCollision(
        { x: rect.x, y: rect.y },
        { x: rect.x, y: rect.y + rect.height },
        { x: lineStart.x, y: lineStart.y },
        { x: lineEnd.x, y: lineEnd.y }
      );
      const rightSideColision = this.checkLineLineCollision(
        { x: rect.x + rect.width, y: rect.y },
        { x: rect.x + rect.width, y: rect.y + rect.height },
        { x: lineStart.x, y: lineStart.y },
        { x: lineEnd.x, y: lineEnd.y }
      );
      const topSideColision = this.checkLineLineCollision(
        { x: rect.x, y: rect.y },
        { x: rect.x + rect.width, y: rect.y },
        { x: lineStart.x, y: lineStart.y },
        { x: lineEnd.x, y: lineEnd.y }
      );
      const bottomSideColision = this.checkLineLineCollision(
        { x: rect.x, y: rect.y + rect.height },
        { x: rect.x + rect.width, y: rect.y + rect.height },
        { x: lineStart.x, y: lineStart.y },
        { x: lineEnd.x, y: lineEnd.y }
      );

      if (
        leftSideColision ||
        rightSideColision ||
        topSideColision ||
        bottomSideColision
      ) {
        return true;
      } else {
        return false;
      }
    }

    checkPointLineColision(point, lineStart, lineEnd) {
      const distX1 = point.x - lineStart.x;
      const distY1 = point.y - lineStart.y;
      const distance1 = Math.hypot(distX1, distY1);

      const distX2 = point.x - lineEnd.x;
      const distY2 = point.y - lineEnd.y;
      const distance2 = Math.hypot(distX2, distY2);

      const distX = lineStart.x - lineEnd.x;
      const distY = lineStart.y - lineEnd.y;
      const length = Math.hypot(distX, distY);

      if (length == distance1 + distance2) {
        return true;
      } else {
        return false;
      }
    }

    checkRectCollision(rect1, rect2) {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      );
    }

    findTopLeft(point1, point2) {
      let x = Math.min(point1.x, point2.x);
      let y = Math.min(point1.y, point2.y);

      return { x, y };
    }

    checkCircleLineCollision(circle, lineStart, lineEnd) {
      const rectStart = this.findTopLeft(lineStart, lineEnd);

      //1. gledamo da li su obe tacke eunutar kruga
      if (
        this.checkPointCircleColision(circle, lineStart) ||
        this.checkPointCircleColision(circle, lineEnd)
      ) {
        return true;
      }

      //2. treba nam duzina linije
      const distX = lineStart.x - lineEnd.x;
      const distY = lineStart.y - lineEnd.y;
      const length = Math.hypot(distX, distY);

      const rect = {
        x: rectStart.x,
        y: rectStart.y,
        width: Math.abs(distX),
        height: Math.abs(distY),
      };

      const dot =
        ((circle.x - lineStart.x) * (lineEnd.x - lineStart.x) +
          (circle.y - lineStart.y) * (lineEnd.y - lineStart.y)) /
        Math.pow(length, 2);

      //4. najbliza tacka na liniji krugu
      const closestX = lineStart.x + dot * (lineEnd.x - lineStart.x);
      const closestY = lineStart.y + dot * (lineEnd.y - lineStart.y);

      //5. distanca centra kruga i najblize linije
      const distanceX = closestX - circle.x;
      const distanceY = closestY - circle.y;
      const distance = Math.hypot(distanceX, distanceY);

      //6. poredimo tu duzinu sa radiusom

      // if (!this.checkPointLineColision(closestX, closestY, lineStart, lineEnd)) {
      //   return;
      // }

      //Alternativa:

      if (this.checkCircleRectCollision(circle, rect)[0]) {
        if (distance <= circle.radius) {
          return true;
        } else {
          return false;
        }
      }
    }

    checkRectLeft(a, b) {
      //a fixed
      return (
        a.position.x === b.position.x + b.width &&
        a.position.y >= b.position.y &&
        a.position.y <= b.position.y + b.height
      );
    }

    checkRectRight(a, b) {
      //a fixed
      return (
        a.position.x + a.width === b.position.x &&
        a.position.y >= b.position.y &&
        a.position.y <= b.position.y + b.height
      );
    }

    checkRectUp(a, b) {
      //a fixed
      return (
        a.position.y === b.position.y + b.height &&
        a.position.x >= b.position.x &&
        a.position.x <= b.position.x + b.width
      );
    }

    checkRectDown(a, b) {
      //a fixed
      return (
        a.position.y + a.height === b.position.y &&
        a.position.x >= b.position.x &&
        a.position.x <= b.position.x + b.width
      );
    }

    toggleDebug() {
      this.debug = !this.debug;
    }

    toggleDayNight() {
      this.isNight = !this.isNight;
      this.world.transition.play();
      this.stats.gameTimeElapsed += 0.5;
      if (this.isNight) {
        this.cleanUpGameObjects();
        this.addZombies();
        this.addCrows();
        if (!this.world.staticLightMapGenerated) {
          this.world.generateStaticLightMap();
        }
        canvas.style.filter =
          'blur(0px) brightness(100%) contrast(145%) grayscale(0%) invert(10%) opacity(100%) saturate(145%) sepia(10%) hue-rotate(-5deg)';

        // this.removeNpcs();
      } else {
        this.removeZombies();
        this.removeCrows();
        this.addNpcs(this.npcsData);
        this.world.staticLightMapGenerated = false;
        this.hero.firstRosePut = false;
        canvas.style.filter =
          'blur(0px) brightness(100%) contrast(120%) grayscale(0%) invert(0%) opacity(100%) saturate(125%) sepia(0%) hue-rotate(-5deg)';
      }
    }

    //Game objects
    addGraves() {
      for (let i = 0; i < this.world.gravesLayer.length; i++) {
        const grave = this.world.gravesLayer[i];
        if (grave === 1) {
          this.graves.push(
            new Grave({
              position: {
                x: (i * TILE_SIZE) % WORLD_WIDTH,
                y: Math.floor(i / WORLD_COLS) * TILE_SIZE,
                width: 16,
                height: 16,
                scopeX: HALF_TILE_SIZE,
                scopeY: HALF_TILE_SIZE,
              },

              game: this,
            })
          );
        }
      }
    }

    addNpcs(npcsDataArr) {
      this.removeNpcs();
      for (let i = 0; i < npcsDataArr.length; i++) {
        this.npcs.push(
          new Npc({
            sprite: {
              image: document.getElementById(
                `npc-sprite-${npcsDataArr[i].name.toLocaleLowerCase()}`
              ),
              x: 0,
              y: 2,
              width: 32,
              height: 32,
            },
            game: this,
            scale: 1,
            position: {
              x: npcsDataArr[i].position.x,
              y: npcsDataArr[i].position.y,
              width: TILE_SIZE,
              height: TILE_SIZE,
              scopeX: npcsDataArr[i].position.x + HALF_TILE_SIZE,
              scopeY: npcsDataArr[i].position.y + HALF_TILE_SIZE,
            },
          })
        );
        this.npcs[i].text = npcsDataArr[i].text;
        this.npcs[i].name = npcsDataArr[i].name;
        this.npcs[i].item = npcsDataArr[i].item;
        this.npcs[i].interactionCounter = npcsDataArr[i].interactionCounter;
        this.npcs[i].slide = npcsDataArr[i].slide;
        this.npcs[i].hints = npcsDataArr[i].hints;
        this.npcs[i].secrets = npcsDataArr[i].secrets;
      }

      ctx.font = ctxTop.font = '20px Comicoro'; //zbog duzine
      for (let i = 0; i < this.npcs.length; i++) {
        const npc = this.npcs[i];
        npc.splitTextToSlides(ctx, npc.text, 8, 206);
      }
    }

    removeNpcs() {
      this.npcs = [];
    }

    addZombies() {
      //Calculate based on game level

      if (this.level === 1) {
        this.numZombies = 30; //deljivo sa 10
        this.numZombiesAlpha = 0.5 * this.numZombies;
        this.numZombiesBeta = 0.4 * this.numZombies;
        this.numZombiesGamma = 0.1 * this.numZombies;
        this.numZombiesDelta = 0 * this.numZombies;
      }
      if (this.level === 2) {
        this.numZombies = 30; //deljivo sa 10
        this.numZombiesAlpha = 0.4 * this.numZombies;
        this.numZombiesBeta = 0.3 * this.numZombies;
        this.numZombiesGamma = 0.2 * this.numZombies;
        this.numZombiesDelta = 0.1 * this.numZombies;
      }

      if (this.level === 3) {
        this.numZombies = 40; //deljivo sa 10
        this.numZombiesAlpha = 0.25 * this.numZombies;
        this.numZombiesBeta = 0.25 * this.numZombies;
        this.numZombiesGamma = 0.25 * this.numZombies;
        this.numZombiesDelta = 0.25 * this.numZombies;
      }

      if (this.level === 4) {
        this.numZombies = 40; //deljivo sa 10
        this.numZombiesAlpha = 0.1 * this.numZombies;
        this.numZombiesBeta = 0.2 * this.numZombies;
        this.numZombiesGamma = 0.3 * this.numZombies;
        this.numZombiesDelta = 0.4 * this.numZombies;
      }

      let zombiesTotal;

      this.numZombiesAlpha =
        this.numZombiesAlpha +
        this.rosesNotCollected.filter(zombie => zombie.type === 'alpha').length; //Type specific

      this.numZombiesBeta =
        this.numZombiesBeta +
        this.rosesNotCollected.filter(zombie => zombie.type === 'beta').length; //Type specific

      this.numZombiesGamma =
        this.numZombiesGamma +
        this.rosesNotCollected.filter(zombie => zombie.type === 'gamma').length; //Type specific

      this.numZombiesDelta =
        this.numZombiesDelta +
        this.rosesNotCollected.filter(zombie => zombie.type === 'delta').length; //Type specific

      zombiesTotal =
        this.numZombiesAlpha +
        this.numZombiesBeta +
        this.numZombiesGamma +
        this.numZombiesDelta;

      //Ako ukupan broj zombija prekoraci maksimalan broj zombija, ubaci maksimalan broj svakog tipa
      if (zombiesTotal > this.numZombiesMax) {
        this.numZombiesAlpha = this.numZombiesAlphaMax;
        this.numZombiesBeta = this.numZombiesBetaMax;
        this.numZombiesGamma = this.numZombiesGammaMax;
        this.numZombiesDelta = this.numZombiesDeltaMax;
      }

      //Ako je u igri vise zombija nego slobodnih grobova, ukupan broj zombija je jednak broju preostalih slobodnih grobova i svi su Delta tip
      if (
        zombiesTotal >
        this.graves.filter(
          grave =>
            !grave.isLocked &&
            !grave.isOccupied &&
            grave.sector.name === this.currentSector
        ).length //slobodni grobovi
      ) {
        zombiesTotal = this.graves.filter(
          grave =>
            !grave.isLocked &&
            !grave.isOccupied &&
            grave.sector.name === this.currentSector
        ).length;

        this.numZombiesAlpha = 0;
        this.numZombiesBeta = 0;
        this.numZombiesGamma = 0;
        if (this.level === 1) {
          this.numZombiesAlpha = 0;
          this.numZombiesBeta = 0;
          this.numZombiesGamma = zombiesTotal;
          this.numZombiesDelta = 0;
        }
        if (this.level >= 2) {
          this.numZombiesAlpha = 0;
          this.numZombiesBeta = 0;
          this.numZombiesGamma = 0;
          this.numZombiesDelta = zombiesTotal;
        }
      }

      /////////////////////////////////////
      this.deployZombies(this.numZombiesAlpha, Alpha, 'alpha');
      this.deployZombies(this.numZombiesBeta, Beta, 'beta');
      this.deployZombies(this.numZombiesGamma, Gamma, 'gamma');
      this.deployZombies(this.numZombiesDelta, Delta, 'delta');
      this.rosesNotCollected = [];
      ////////////////////////////////////

      for (let i = 0; i < this.zombies.length; i++) {
        const zombie = this.zombies[i];
        this.zombieCollisionScopes.push(zombie.collisionScope);
        zombie.index = i;
      }

      for (let i = 0; i < this.zombies.length; i++) {
        const gravesAvailable = this.graves.filter(
          grave =>
            !grave.isLocked &&
            !grave.isOccupied &&
            grave.sector.name === this.currentSector
        );
        const randomGrave =
          gravesAvailable[Math.trunc(Math.random() * gravesAvailable.length)];
        const randomGraveIndex = gravesAvailable.indexOf(randomGrave);

        this.zombies[i].position.x = randomGrave?.position.x;
        this.zombies[i].position.y = randomGrave?.position.y;

        if (randomGrave) {
          randomGrave.isOccupied = true;
        }

        this.zombies[i].originalPositionX = this.zombies[i].position.x;
        this.zombies[i].originalPositionY = this.zombies[i].position.y;

        this.zombies[i].destinationPosition.x = this.zombies[i].position.x;
        this.zombies[i].destinationPosition.y = this.zombies[i].position.y;

        this.zombies[i].lastKnownHeroPosition.x = this.zombies[i].position.x;
        this.zombies[i].lastKnownHeroPosition.y = this.zombies[i].position.y;

        //  TOP RIGHT CORRECTION
        if (
          (this.zombies[i].position.x >= 77 * TILE_SIZE &&
            this.zombies[i].position.x <= 121 * TILE_SIZE &&
            this.zombies[i].position.y >= 7 * TILE_SIZE &&
            this.zombies[i].position.y <= 39 * TILE_SIZE) ||
          (this.zombies[i].position.x >= 95 * TILE_SIZE &&
            this.zombies[i].position.x <= 121 * TILE_SIZE &&
            this.zombies[i].position.y >= 43 * TILE_SIZE &&
            this.zombies[i].position.y <= 59 * TILE_SIZE)
        ) {
          this.zombies[i].position.y += TILE_SIZE;
        }
        gravesAvailable.splice(randomGraveIndex, 1);
      }
    }

    deployZombies(num, Type, spriteType) {
      for (let i = 0; i < num; i++) {
        this.zombies.push(
          new Type({
            sprite: {
              image: document.getElementById(
                `zombie-sprite-${spriteType}-false`
              ),
              x: 0,
              y: 2,
              width: 32,
              height: 32,
            },
            game: this,
            scale: 1,
            position: {
              x: 0,
              y: 0,
              width: TILE_SIZE,
              height: TILE_SIZE,
              scopeX: HALF_TILE_SIZE,
              scopeY: HALF_TILE_SIZE,
            },
          })
        );
      }
    }

    removeZombies() {
      //Adding to deleted zombies for inactive ones
      for (let i = 0; i < this.zombies.length; i++) {
        const zombie = this.zombies[i];

        if (!zombie.isActivated) {
          this.deletedGameObjects.push(zombie);
        }
      }

      //Marked for delition za sve zombije osim ruza
      this.zombies = this.zombies.filter(zombie => zombie.isActivated);

      //Pravimo sve gorobve slobodnim
      for (let i = 0; i < this.graves.length; i++) {
        const grave = this.graves[i];
        grave.isOccupied = false;
      }
    }

    //For Zombies, Crows and NPCs
    cleanUpGameObjects() {
      for (let i = 0; i < this.deletedGameObjects.length; i++) {
        const gameObject = this.deletedGameObjects[i];

        // Ako ima Howler zvuk, unload

        if (gameObject.soundEffects) {
          for (let j = 0; j < gameObject.soundEffects.length; j++) {
            const sfx = gameObject.soundEffects[j];
            sfx.stop();
            sfx.unload();
          }
        }

        // Očisti sve property-je unutar objekta
        for (const key in gameObject) {
          gameObject[key] = null;
        }
      }

      // Očisti sam niz (zadržava istu referencu)
      this.deletedGameObjects = [];
    }

    addCrows() {
      for (let i = 0; i < this.numCrows; i++) {
        this.crows.push(
          new Crow({
            sprite: {
              image: document.getElementById(`crow-sprite`),
              x: 0,
              y: 1,
              width: 32,
              height: 32,
            },
            game: this,
            scale: 1,
            position: {
              x: 0,
              y: 0,
              width: TILE_SIZE,
              height: TILE_SIZE,
              scopeX: HALF_TILE_SIZE,
              scopeY: HALF_TILE_SIZE,
            },
          })
        );
      }

      for (let i = 0; i < this.crows.length; i++) {
        const gravesAvailable = this.graves.filter(
          grave =>
            !grave.hasCrow &&
            !grave.checkIsOnScreen() &&
            !grave.isLocked &&
            grave.sector.name === this.currentSector &&
            !this.checkCircleRectCollision(
              {
                x: this.scarecrow.position.scopeX,
                y: this.scarecrow.position.scopeY,
                radius: this.scarecrow.interactionScopeRadius,
              },
              grave.position
            )[0]
        );
        const randomGrave =
          gravesAvailable[Math.trunc(Math.random() * gravesAvailable.length)];
        const randomGraveIndex = gravesAvailable.indexOf(randomGrave);

        this.crows[i].position.x = randomGrave?.position.x;
        this.crows[i].position.y = randomGrave?.position.y - TILE_SIZE;

        if (randomGrave) {
          randomGrave.hasCrow = true;
        }

        //  TOP RIGHT CORRECTION
        if (randomGrave?.sector.name === 'Memorial Meadow') {
          this.crows[i].position.y += TILE_SIZE;
        }
        gravesAvailable.splice(randomGraveIndex, 1);
      }
    }

    removeCrows() {
      for (let i = 0; i < this.crows.length; i++) {
        const crow = this.crows[i];

        this.deletedGameObjects.push(crow);
      }
      this.crows = [];
    }

    //Graphics
    fadeOut() {
      if (this.alpha < 1) {
        if (this.spriteUpdate) {
          this.alpha += 0.05;
        }
      } else {
        this.alpha = 1;
      }
    }

    fadeIn() {
      if (this.alpha > 0) {
        if (this.spriteUpdate) {
          this.alpha -= 0.05;
        }
      } else {
        this.alpha = 0;
      }
    }

    //Game state
    saveGame() {
      localStorage.clear();
      this.stats.numSaves++;
      //save Graves
      let gravesData = [];
      for (let i = 0; i < this.graves.length; i++) {
        gravesData[i] = [
          this.graves[i].isLocked,
          this.graves[i].hasCandle,
          this.graves[i].candleDays,
        ];
      }

      //save Gates
      let gatesData = [];
      for (let i = 0; i < this.world.gates.length; i++) {
        gatesData[i] = [this.world.gates[i].isLocked];
      }

      //save Sheds
      let shedsData = [];
      for (let i = 0; i < this.world.sheds.length; i++) {
        shedsData[i] = [this.world.sheds[i].isExplored];
      }

      //save NPCs
      let npcsData = [];
      for (let i = 0; i < this.npcs.length; i++) {
        npcsData[i] = [
          this.npcs[i].interactionCounter,
          this.npcs[i].hints,
          this.npcs[i].secrets,
        ];
      }

      //save Items
      let itemsData = [];
      for (let i = 0; i < this.items.length; i++) {
        itemsData[i] = [
          this.items[i].canBeFound,
          this.items[i].isFound,
          this.items[i].canBeUsed,
          this.items[i].isFilled,
          this.items[i].waterLeft,
          this.items[i].healthBoost,
          this.items[i].roseCounter,
          this.items[i].counter,
          this.items[i].day,
          this.items[i].isActivated,
          this.items[i].canBePlaced,
          this.items[i].canBePicked,
        ];
      }

      // //save Journal
      // let journalData = [];
      // for (let i = 0; i < this.ui.journal.length; i++) {
      //   journalData[i] = [
      //     this.ui.journal[i].hints,
      //     this.ui.journal[i].secrets,
      //     this.ui.journal[i].isVisible,
      //     this.ui.journal[i].selectedOption,
      //     this.ui.journal[i].lastOption,
      //   ];
      // }

      let gameSave = {
        gameData: {
          sectorTracker: this.sectorTracker,
          level: this.level,
          clock: 8,
          gameOver: false,
          heroWins: this.heroWins,
          stats: this.stats,
        },

        arenaData: {
          isActivated: this.world.arena.isActivated,
          isActive: this.world.arena.isActive,
          sprite: {
            x: 0,
            y: 0,
            width: GAME_WIDTH,
            height: GAME_HEIGHT,
          },
        },

        heroData: {
          hasKey: this.hero.hasKey,
          direction: 'DOWN',
          numRoses: this.hero.numRoses,
          health: this.hero.health,
          weapons: this.hero.weapons,
          currentWeapon: this.hero.currentWeapon,
          items: this.hero.items,
          currentItem: 0,
          heroPositionX: 55 * TILE_SIZE,
          heroPositionY: 45 * TILE_SIZE,
          isGreeted: this.hero.isGreeted,
          movedDown: this.hero.movedDown,
          movedUp: this.hero.movedUp,
          movedLeft: this.hero.movedLeft,
          movedRight: this.hero.movedRight,
          rolled: this.hero.rolled,
          sneaked: this.hero.sneaked,
        },

        demonData: {
          isActivated: this.demon.isActivated,
          isVisible: this.demon.isVisible,
          risen: this.demon.risen,
          health: this.demon.health,
          renderFlyingMotionBlur: this.demon.renderFlyingMotionBlur,
          shakeFactor: this.demon.shakeFactor,
          fadingIn: this.demon.fadingIn,
          fadingOut: this.demon.fadingOut,
          isDying: this.demon.isDying,
          currentStage: this.demon.currentStage,
          interactionCounter: this.demon.interactionCounter,
          slide: this.demon.slide,
          sprite: {
            image: document.getElementById('demon-sprite-false'),
            x: 0,
            y: 6,
            width: 48,
            height: 48,
          },

          lightning: 0,
          lightningTimer: 0,
          nextLightning: true,
          flyOverTimer: 0,
          flyOver: false,
          flyOverEnded: true,
          zombieTimer: 0,
          nextZombie: true,
          zombiesQueue: [],
          zombiesAdded: false,
        },

        journalData: {
          hints: this.ui.journal.hints,
          secrets: this.ui.journal.secrets,
          isVisible: this.ui.journal.isVisible,
          selectedOption: this.ui.journal.selectedOption,
          lastOption: this.ui.journal.lastOption,
        },

        //Multiple objects
        gravesData: gravesData,
        gatesData: gatesData,
        shedsData: shedsData,
        npcsData: npcsData,
        itemsData: itemsData,

        //World
        lightSources: this.world.lightSources,
        collisionLayer: this.world.collisionLayer,
      };

      localStorage.setItem('gameSave', stringify(gameSave));
      this.isSaved = true;
    }

    loadGame() {
      this.ui.infoText = 'Game loaded!';

      this.ui.info.play();

      this.ui.infoTextTimer = 0;
      this.camera.onHero = true;

      this.loadedData = parse(localStorage.getItem('gameSave'));

      Object.entries(this.loadedData.gameData).forEach(([key, value]) => {
        this[key] = value;
      });

      Object.entries(this.loadedData.arenaData).forEach(([key, value]) => {
        this.world.arena[key] = value;
      });

      Object.entries(this.loadedData.heroData).forEach(([key, value]) => {
        this.hero[key] = value;
      });
      this.hero.position.x = this.loadedData.heroData.heroPositionX;
      this.hero.position.y = this.loadedData.heroData.heroPositionY;
      this.hero.destinationPosition = {
        x: this.hero.position.x,
        y: this.hero.position.y,
      };
      this.hero.distanceToTravel = { x: 0, y: 0 };

      Object.entries(this.loadedData.demonData).forEach(([key, value]) => {
        this.demon[key] = value;
      });
      this.demon.position.x = 107 * TILE_SIZE;
      this.demon.position.y = 89 * TILE_SIZE;

      Object.entries(this.loadedData.journalData).forEach(([key, value]) => {
        this.ui.journal[key] = value;
      });

      for (let i = 0; i < this.loadedData.gravesData.length; i++) {
        this.graves[i].isLocked = this.loadedData.gravesData[i][0];
        this.graves[i].hasCandle = this.loadedData.gravesData[i][1];
        this.graves[i].candleDays = this.loadedData.gravesData[i][2];
      }

      for (let i = 0; i < this.loadedData.gatesData.length; i++) {
        this.world.gates[i].isLocked = this.loadedData.gatesData[i][0];
      }

      for (let i = 0; i < this.loadedData.shedsData.length; i++) {
        this.world.sheds[i].isExplored = this.loadedData.shedsData[i][0];
      }

      // for (let i = 0; i < this.loadedData.journalData.length; i++) {
      //   this.ui.journal[i].hints = this.loadedData.journalData[i][0];
      //   this.ui.journal[i].secrets = this.loadedData.journalData[i][1];
      //   this.ui.journal[i].isVisible = this.loadedData.journalData[i][2];
      //   this.ui.journal[i].selectedOption = this.loadedData.journalData[i][3];
      //   this.ui.journal[i].lastOption = this.loadedData.journalData[i][4];
      // }

      //NPCs
      // Adding NPCs
      if (!this.heroWins) {
        this.addNpcs(this.npcsData);
      }
      //Modifying
      for (let i = 0; i < this.loadedData.npcsData.length; i++) {
        this.npcsData[i].interactionCounter = this.loadedData.npcsData[i][0];
        this.npcsData[i].hints = this.loadedData.npcsData[i][1];
        this.npcsData[i].secrets = this.loadedData.npcsData[i][2];
      }
      //Re-adding
      if (!this.heroWins) {
        this.addNpcs(this.npcsData);
        // this.addNpcs(this.npcsData);
      }

      for (let i = 0; i < this.loadedData.itemsData.length; i++) {
        this.items[i].canBeFound = this.loadedData.itemsData[i][0];
        this.items[i].isFound = this.loadedData.itemsData[i][1];
        this.items[i].canBeUsed = this.loadedData.itemsData[i][2];
        this.items[i].isFilled = this.loadedData.itemsData[i][3];
        this.items[i].waterLeft = this.loadedData.itemsData[i][4];
        this.items[i].healthBoost = this.loadedData.itemsData[i][5];
        this.items[i].roseCounter = this.loadedData.itemsData[i][6];
        this.items[i].counter = this.loadedData.itemsData[i][7];
        this.items[i].day = this.loadedData.itemsData[i][8];
        this.items[i].isActivated = false; //this.loadedData.itemsData[i][9];
        this.items[i].canBePlaced = this.loadedData.itemsData[i][10];
        this.items[i].canBePicked = this.loadedData.itemsData[i][11];
      }

      this.world.lightSources = this.loadedData.lightSources;
      this.world.collisionLayer = this.loadedData.collisionLayer;

      //Hero wins - guard clause - loading final save:
      if (this.heroWins) {
        this.world.arena.sprite.x = -1; //invisible
        this.world.arena.isActive = false;
        this.camera.onHero = true;

        //Delete all NPCs exept Gabriel, and move him to Murder Field gate
        for (let i = 0; i < this.npcs.length; i++) {
          const npc = this.npcs[i];

          if (npc.name !== 'Father Gabriel') {
            this.npcs.splice(i, 1);
          } else {
            npc.position.x = 93 * TILE_SIZE;
            npc.position.y = 75 * TILE_SIZE;
            npc.interactionCounter = 3;
          }
        }
      }

      this.stats.numLoads++;
      this.isSaved = false;
    }

    getMusicState() {
      if (this.isPaused) {
        if (this.ui.letter.isVisible) return 'letter';
        if (this.ui.mainMenu.isVisible) return 'mainMenu';
        return 'none';
      }

      if (!this.isPlayingMusic) return 'none';
      if (this.ui.gameOverMenu.isVisible) return 'none';

      if (this.heroWins && !this.world.arena.isActive) return 'heroWins';

      if (this.demon.isActivated && !this.heroWins) {
        if (this.demon.currentStage < 0) return 'demonIntro';

        if (
          this.demon.health >
          this.demon.stages[this.demon.currentStage].minHealth
        )
          return 'demonDay';

        return 'demonNight';
      }

      // demon inactive
      if (!this.isNight) return 'day';

      // night sub states
      if (
        !this.zombies.some(z => z.isChasing && !z.isRose) &&
        !this.crows.some(c => c.isCawing) &&
        !this.musicCrow.playing() &&
        !this.musicCombat.playing()
      ) {
        return 'night';
      } else if (this.crows.some(c => c.isCawing)) {
        return 'crow';
      } else if (
        this.zombies.some(z => z.isChasing && !z.isRose) &&
        !this.musicCrow.playing() &&
        !this.musicCombat.playing()
      ) {
        return 'combatIn';
      } else {
        return 'combatLoop'; //updateMusic needs another switch case
      }
    }

    updateMusic(state) {
      // Stop all
      this.musicDay.stop();
      this.musicNight.stop();
      this.musicCombat.stop();
      this.musicDemonDay.stop();
      this.musicDemonNight.stop();
      this.musicDemonIntro.stop();
      this.musicDeath.stop();
      this.musicCrow.stop();
      this.letterMusic.stop();
      this.mainMenuMusic.stop();
      this.musicHeroWins.stop();

      switch (state) {
        case 'day':
          this.musicDay.play();
          break;
        case 'night':
          this.musicNight.play();
          break;
        case 'combatIn':
        case 'combatLoop':
          this.musicCombat.play();
          break;
        case 'crow':
          this.musicCrow.play();
          break;
        case 'demonIntro':
          this.musicDemonIntro.play();
          break;
        case 'demonDay':
          this.musicDemonDay.play();
          break;
        case 'demonNight':
          this.musicDemonNight.play();
          break;
        case 'heroWins':
          this.musicHeroWins.play();
          break;
        case 'letter':
          this.letterMusic.play();
          break;
        case 'mainMenu':
          this.mainMenuMusic.play();
          break;
        case 'none':
        default:
          break;
      }
    }

    //Main render function
    render(ctx, ctxTop, deltaTime) {
      //Update Music
      if (this.isInitialized) {
        this.desired = this.getMusicState();

        if (this.desired !== this.lastMusicState) {
          this.updateMusic(this.desired);
          this.lastMusicState = this.desired;
        }
      }
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          Howler.ctx.resume();
        }
      });

      //Timers
      if (this.spriteTimer < this.spriteInterval) {
        this.spriteTimer += deltaTime;
        this.spriteUpdate = false;
      } else {
        this.spriteTimer = 0;
        this.spriteUpdate = true;
      }

      if (this.ui.menuTimer < this.ui.menuInterval) {
        this.ui.canChangeOption = false;
        this.ui.menuTimer += deltaTime;
      } else {
        this.ui.canChangeOption = true;
      }

      //Color Correction Console
      if (
        this.ui.colorCorrectionConsoleTimer <
        this.ui.colorCorrectionConsoleInterval
      ) {
        this.ui.colorCorrectionConsoleCanChangeOption = false;
        this.ui.colorCorrectionConsoleTimer += deltaTime;
      } else {
        this.ui.colorCorrectionConsoleCanChangeOption = true;
      }

      if (!this.isPaused) {
        this.stats.realTimeElapsed += deltaTime;
      }

      //Game state
      //Sectors
      this.currentSector = this.sectorTracker[this.sectorTracker.length - 1];

      //Clock
      if (!this.isPaused) {
        if (Math.trunc(this.clock) < 24) {
          if (
            this.hero.isGreeted &&
            !this.hero.isInteractingWithNpc &&
            !(
              this.currentSector === 'Murder Field' &&
              this.demon.currentStage < 0
            ) &&
            !this.heroWins
          ) {
            this.clock += this.isNight
              ? deltaTime / (12000 + 4 * this.timeAccelerator)
              : deltaTime / (3000 + this.timeAccelerator);
          }

          if (this.clock > 24) {
            this.clock = 0;
          }
        } else {
          this.clock = 0;
        }
      }
      if (
        !this.isNight &&
        Math.trunc(this.clock) >= 0 &&
        Math.trunc(this.clock) < 6
      ) {
        this.toggleDayNight();
      } else if (this.isNight && Math.trunc(this.clock) >= 6) {
        this.toggleDayNight();
        //Candle days
        for (let i = 0; i < this.graves.length; i++) {
          const grave = this.graves[i];
          if (grave.hasCandle) {
            grave.candleDays++;
          }
        }
        for (let i = 0; i < this.world.lightSources.length; i++) {
          const lightSource = this.world.lightSources[i];
          if (lightSource.isCandle && lightSource.radius >= 3) {
            lightSource.radius -= 3;
          }
        }
      }

      //Clock - demon activated
      if (this.demon.currentStage > -1) {
        if (!this.isNight && this.clock > 20) {
          this.clock = 20;
        } else if (this.isNight && this.clock > 5 && this.clock < 5.77) {
          this.clock = 5;
        }
      }

      //Alpha/Transition
      if (this.alpha > 0 && this.alpha < 1) {
        this.animatingTransition = true;
      } else {
        this.animatingTransition = false;
      }

      if (Math.trunc(this.clock) >= 0 && this.clock < 5.77) {
        this.fadeOut();
      }

      if (this.clock >= 5.77) {
        this.fadeIn();
      }

      ////////////////Update zombies//////////////////////
      this.zombies = this.zombies.filter(zombie => !zombie.markedForDelition);

      this.zombiesInCombat = this.zombies.filter(zombie =>
        zombie.checkIfOnChasingPosition()
      );

      this.zombiesInInteractionScopes = this.zombieCollisionScopes.filter(
        zombieCollisionScope =>
          this.checkCircleCollision(
            zombieCollisionScope,
            this.hero.interactionScope
          )[0] && !zombieCollisionScope.isRose //ako scope kaze da je ruza ne dodajemo ga u zombije u interakciji
      );

      this.zombieCollisionScopes.length = this.zombies.length;
      for (let i = 0; i < this.zombieCollisionScopes.length; i++) {
        this.zombieCollisionScopes[i] = this.zombies[i].collisionScope;

        if (this.zombies[i].isRose) {
          this.zombies[i].collisionScope.isRose = true; //u scopeu Zombija oznacavamo da li je ruza ili ne
        }
      }

      this.pathFindingQueue = this.pathFindingQueue.filter(
        gameObject => !gameObject.pathFound && gameObject.isAlive
      );

      ////////////////Update crows//////////////////////
      this.crows = this.crows.filter(crow => !crow.markedForDelition);
      ////////////////Update NPCs//////////////////////
      this.npcs = this.npcs.filter(npc => !npc.markedForDelition);

      // if (this.npcsDataTemp.length > 0) {
      //   for (let i = 0; i < this.npcsDataTemp.length; i++) {
      //     const npc = this.npcsDataTemp[i];
      //     npc.markedForDelition = false;
      //   }
      // }
      ///////////////Update items///////////////////////
      this.bottle.healthBoost = this.level * 10;

      //Camera
      this.camera.move(deltaTime, ctx);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctxTop.clearRect(0, 0, canvasTop.width, canvasTop.height);

      //////////////////////////////////////MAIN CANVAS///////////////////////////
      ctx.save();
      ctx.translate(this.camera.x, this.camera.y);

      //World
      //Audio
      this.world.updateSFX();
      this.world.updateAudioVolume();

      //Background
      this.world.drawLayer(
        ctx,
        this.isNight || this.isRaining
          ? this.world.backgroundLayerNight
          : this.world.backgroundLayerDay
      );

      this.world.drawGatesBackground(ctx);
      this.world.drawArena(ctx);
      this.world.animateArena();

      //Foreground - transition
      if (this.animatingTransition) {
        this.world.drawLayer(
          ctx,
          this.isNight || this.isRaining
            ? this.world.foregroundLayerNight
            : this.world.foregroundLayerDay
        );
        this.world.drawGatesForeground(ctx);

        if (!this.isNight) {
          this.world.animateFontains(ctx);
        }
      }

      //Graves - roses and candles
      for (let i = 0; i < this.graves.length; i++) {
        const grave = this.graves[i];
        grave.drawFlowerpotRose(ctx);
        grave.drawCandle(ctx);
      }
      //Game Objects
      this.gameObjects = [
        ...this.zombies,
        ...this.npcs,
        this.scarecrow,
        this.demon,
        this.hero,
        ...this.demon.lightnings,
      ].sort((a, b) => {
        return a.position.y - b.position.y;
      });

      for (let i = 0; i < this.gameObjects.length; i++) {
        const gameObject = this.gameObjects[i];
        gameObject?.draw(ctx);
        if (!this.isPaused) {
          gameObject?.update(deltaTime, ctx, ctxTop);
        }
      }
      //Crows - additional to Game objects
      if (this.isNight && !this.isPaused) {
        for (let i = 0; i < this.crows.length; i++) {
          const crow = this.crows[i];
          if (crow.isVisible && !this.animatingTransition) {
            crow.update(ctx, ctxTop, deltaTime);
            crow.draw(ctx);
          }
        }
      }

      //Foreground - no transition
      if (!this.animatingTransition) {
        this.world.drawLayer(
          ctx,
          this.isNight || this.isRaining
            ? this.world.foregroundLayerNight
            : this.world.foregroundLayerDay
        );

        this.world.drawGatesForeground(ctx);
        if (!this.isNight) {
          this.world.animateFontains(ctx);
        }
      }

      //DEBUG/TEST
      if (this.debug) {
        this.world.drawCollisionScopes(ctx);
        this.world.drawCollisionTiles(ctx);

        this.hero.drawScope(ctx);

        this.zombies.forEach(zombie => {
          if (this.debug) {
            zombie.drawScopes(ctx);
          }
        });
      }
      if (this.ui.colorCorrectionConsole.isVisible) {
        //Pop up
        this.ui.drawColorCorrectionConsole(ctxTop);
      }
      this.ui.updateColorCorrectionConsole(ctx, ctxTop);
      ctx.restore();
      //////////////////////////////////////TOP CANVAS///////////////////////////

      ctxTop.save();
      ctxTop.translate(this.camera.x, this.camera.y);

      //Light sources
      if (this.isNight && !this.debug && this.world.staticLightMapGenerated) {
        this.world.drawLightSources(ctxTop);
      }

      ctxTop.globalCompositeOperation = 'source-over';

      //Crows - additional to Game objects
      if (this.isNight && !this.isPaused) {
        for (let i = 0; i < this.crows.length; i++) {
          const crow = this.crows[i];
          if (!crow.isVisible && !this.animatingTransition) {
            crow.update(ctx, ctxTop, deltaTime);
            crow.draw(ctxTop);
          }
        }
      }

      /////////////////////////////////
      //UI - Update & Render
      if (!this.hero.isInteractingWithNpc) {
        this.ui.updateActionText();
        this.ui.updateInfoText(deltaTime);
        if (!this.isPaused && !this.gameOver /*&& this.hero.isGreeted*/) {
          this.ui.drawHud(ctxTop);
          this.ui.drawActionText(ctxTop);
          this.ui.drawInfoText(ctxTop);
        }
      } else {
        ctxTop.fillStyle = 'rgba(255,255,255,1)';
        this.ui.drawNpcDialogBox(ctxTop);
        this.ui.renderNpcText(
          ctxTop,
          this.hero.npc?.slides[this.hero.npc.interactionCounter][
            this.hero.npc.slide
          ],
          -this.camera.x + 6,
          -this.camera.y + GAME_HEIGHT * 0.75 + 12,
          GAME_WIDTH - 12,
          13
        );
      }

      this.ui.updateAudioVolume();
      this.ui.updateMainMenu();
      this.ui.updatePauseMenu(ctx);
      this.ui.updateDialogMenu(ctx);
      this.ui.updateGameOverMenu(ctx);
      this.ui.updateSettingsMain();
      this.ui.updateSettingsPause(ctx);
      this.ui.updateCredits();
      this.ui.updateStats();
      this.ui.updateLetter();
      this.ui.updateControls(ctx);
      this.ui.updateJournal(ctx);

      if (this.ui.introScreen.isVisible) {
        this.ui.drawIntroScreen(ctxTop);
      } else if (this.ui.mainMenu.isVisible) {
        this.ui.drawMainMenu(ctxTop);
      } else if (this.ui.pauseMenu.isVisible) {
        this.ui.drawPauseMenu(ctxTop);
      } else if (this.ui.credits.isVisible) {
        this.ui.drawCredits(ctxTop);
      } else if (this.ui.stats.isVisible) {
        this.ui.drawStats(ctxTop);
      } else if (this.ui.gameOverMenu.isVisible) {
        this.ui.drawGameOverMenu(ctxTop);
      } else if (this.ui.settingsMain.isVisible) {
        this.ui.drawSettingsMain(ctxTop);
      } else if (this.ui.settingsPause.isVisible) {
        this.ui.drawSettingsPause(ctxTop);
      } else if (this.ui.letter.isVisible) {
        this.ui.drawLetter(ctxTop);
      } else if (this.ui.controls.isVisible) {
        this.ui.drawControls(ctxTop);
      } else if (this.ui.journal.isVisible) {
        this.ui.drawJournal(ctxTop);
      }

      if (this.ui.dialogMenu.isVisible) {
        //Pop up
        this.ui.drawDialogMenu(ctxTop);
      }

      if (
        this.isPaused &&
        !this.ui.mainMenu.isVisible &&
        !this.ui.pauseMenu.isVisible &&
        !this.ui.dialogMenu.isVisible &&
        !this.ui.credits.isVisible &&
        !this.ui.stats.isVisible &&
        !this.ui.gameOverMenu.isVisible &&
        !this.ui.settingsMain.isVisible &&
        !this.ui.settingsPause.isVisible &&
        !this.ui.journal.isVisible &&
        !this.ui.controls.isVisible &&
        !this.ui.letter.isVisible &&
        this.isInitialized &&
        this.input.lastActionKey === 'a'
      ) {
        document.getElementById('game').requestFullscreen();

        // canvas.width = 5000;

        this.ui.menuTimer = 0;
        if (!this.ui.welcome.playing()) {
          this.ui.welcome.play();
        }
        this.ui.introScreen.isVisible = false;
        this.ui.mainMenu.isVisible = true;
        this.ui.mainMenu.isVisible = true;
      }
      ////////////////////////////////////////////////
      //Spot Points Initialization - Masked with War Ducks Logo - Game Loading
      if (!this.isInitialized && this.spriteUpdate) {
        this.world.initializeSpotPoints();
        this.isInitialized = true;
      }

      ctxTop.restore();
    }
  }

  const game = new Game();

  //Animation loop
  let lastTime = 0;
  function animate(timeStamp) {
    let deltaTime = timeStamp - lastTime;

    lastTime = timeStamp;

    requestAnimationFrame(animate);

    game.render(ctx, ctxTop, deltaTime);
  }

  requestAnimationFrame(animate);
});
