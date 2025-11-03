'use strict';
import { HALF_TILE_SIZE, TILE_SIZE, GAME_WIDTH, GAME_HEIGHT } from '../main.js';

export class GameObject {
  constructor({ game, sprite, position, scale }) {
    this.game = game;
    this.sprite = sprite ?? {
      image: '',
      x: 0,
      y: 0,
      width: TILE_SIZE,
      height: TILE_SIZE,
    };
    this.position = position ?? {
      x: 0,
      y: 0,
      width: TILE_SIZE,
      height: TILE_SIZE,
      scopeX: 0,
      scopeY: 0,
    };

    //Sprite scaling
    this.scale = scale ?? 1;
    this.width = this.sprite.width * this.scale;
    this.height = this.sprite.height * this.scale;

    //Movement properties
    this.destinationPosition = { x: this.position.x, y: this.position.y };
    this.distanceToTravel = { x: 0, y: 0 };

    //Path finding
    this.nearSpotPoints = [];
    this.resetPathFindingData();
    // this.neighbors = []; //Used in Standard A* Path finding
  }

  // updateScopes() {
  //   this.chasingScope.x =
  //     this.interactionScope.x =
  //     this.attackScope.x =
  //     this.collisionScope.x =
  //     this.position.scopeX =
  //       this.position.x + HALF_TILE_SIZE;
  //   this.chasingScope.y =
  //     this.interactionScope.y =
  //     this.attackScope.y =
  //     this.collisionScope.y =
  //     this.position.scopeY =
  //       this.position.y + HALF_TILE_SIZE;
  // }

  moveTowards(destination, speed) {
    this.distanceToTravel.x = destination.x - this.position.x;
    this.distanceToTravel.y = destination.y - this.position.y;

    // let distance = Math.sqrt
    //   this.distanceToTravel.x ** 2 + this.distanceToTravel.y ** 2
    // ); //Pitagorina teorema

    let distance = Math.hypot(this.distanceToTravel.x, this.distanceToTravel.y);

    //Postoje dva scenarija:
    if (distance <= speed) {
      //1) AKo je distanca koju trebamo preci manja od speed-a, snapujemo igraca u grid
      this.position.x = destination.x;
      this.position.y = destination.y;
    } else {
      // 2) ukoliko se igrac mora jos kretati, onda:
      //1. odredjujemo pravac (levo, desno, gore, dole) - dobijamo normalizovani vektor
      const stepX = this.distanceToTravel.x / distance; //dace broj iymedju -1 i 1
      const stepY = this.distanceToTravel.y / distance;
      //2. skejlujemo taj vektor brzinom
      this.position.x += stepX * speed;
      this.position.y += stepY * speed;

      //3. rekalkulisemo distancu koju trebamo preci nakon prvog pomeranja
      this.distanceToTravel.x = destination.x - this.position.x;
      this.distanceToTravel.y = destination.y - this.position.y;
      distance = Math.hypot(this.distanceToTravel.x, this.distanceToTravel.y);
    }
    return distance; //4. vracamo distancu - te prakticno u sledecem frame-u sve ovo ponavljamo
  }

  draw(ctx) {
    if (this.game.debug) {
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgb(255, 255, 255)';

      ctx.fillText(
        'x: ' + this.sprite.x + ' y:' + this.sprite.y,
        this.position.x + 8,
        this.position.y - 8
      );
    }

    // Senka
    if (this.hasShadow) {
      ctx.beginPath();
      ctx.ellipse(
        this.position.x + HALF_TILE_SIZE,
        this.position.y + TILE_SIZE - 2,
        8,
        4,
        0,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = 'rgba(27,38,50,0.2)';
      ctx.fill();
    }

    ctx.drawImage(
      this.sprite.image,
      this.sprite.x * this.sprite.width,
      this.sprite.y * this.sprite.height,
      this.sprite.width,
      this.sprite.height,
      this.position.x + HALF_TILE_SIZE - this.width / 2,
      this.isReady
        ? this.position.y + TILE_SIZE - this.height * 0.85
        : this.position.y + TILE_SIZE - this.height, // this.position.y + TILE_SIZE - this.height * 0.85,
      this.width,
      this.height
    );
  }

  splitTextToSlides(ctx, textArr, maxLines, maxWidth) {
    for (let i = 0; i < textArr.length; i++) {
      const text = textArr[i];
      this.slides[i] = [];
      let breakPoint = maxLines * maxWidth;
      let slide = '';
      let words = text.split(' ');

      for (let j = 0; j < words.length; j++) {
        let testSlide = slide + words[j] + ' ';
        let testWidth = ctx.measureText(testSlide).width;

        if (testWidth > breakPoint && j > 0) {
          this.slides[i].push(slide + '...');
          slide = '...' + words[j] + ' ';
        } else {
          slide = testSlide;
        }
      }
      this.slides[i].push(slide);
    }
    return true;
  }

  checkIsOnScreen() {
    if (
      this.game.checkRectCollision(
        {
          x: this.position.x,
          y: this.position.y,
          width: TILE_SIZE,
          height: TILE_SIZE,
        },
        {
          x: -this.game.camera.x,
          y: -this.game.camera.y,
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
        }
      )
    ) {
      return true;
    } else {
      return false;
    }
  }

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

  //PATH FINDING - SPOT POINTS
  resetPathFindingData(pathFindingQueueArr) {
    this.path = [];
    this.openList = [];
    this.closedList = [];

    this.pathStart = 0;
    this.pathEnd = 0;
    this.current = 0;
    this.temp = 0;
    this.crowToFollow = 0;

    this.pathIndex = 0;

    this.findingPathStarted = false;
    this.pathEndReached = false;
    this.pathFound = false;
    this.pathReversed = false;
    this.isListeningCrow = false;

    if (pathFindingQueueArr?.includes(this)) {
      pathFindingQueueArr?.splice(pathFindingQueueArr?.indexOf(this), 1);
    }
  }

  update(deltaTime, ctx, ctxLight) {}

  calculateHCost(current, end) {
    const distX = end.position.x - current.position.x;
    const distY = end.position.y - current.position.y;
    return Math.hypot(distX, distY);
  }

  calculateDistance(start, current) {
    //G Cost
    const distX = current.position.x - start.position.x;
    const distY = current.position.y - start.position.y;
    return Math.hypot(distX, distY);
  }

  findClosestSpotPoint(spotPointsArr) {
    //1. find neighbors
    //2. filter only those with LOS
    //3. find closest

    //1
    for (let i = 0; i < spotPointsArr.length; i++) {
      const spotPoint = spotPointsArr[i];
      if (
        this.game.checkCircleRectCollision(spotPoint.scope, this.position)[0] &&
        !this.nearSpotPoints.includes(spotPoint)
      ) {
        spotPoint.distanceToGameObject = this.calculateDistance(
          this,
          spotPoint
        );
        this.nearSpotPoints.push(spotPoint);
      }
    }

    //2
    for (let i = 0; i < this.nearSpotPoints.length; i++) {
      const nearSpotPoint = this.nearSpotPoints[i];
      if (
        this.game.world.collisionTiles.some(nearObstacle =>
          this.game.checkRectLineCollision(
            nearObstacle,
            { x: this.position.scopeX, y: this.position.scopeY },
            { x: nearSpotPoint.scope.x, y: nearSpotPoint.scope.y }
          )
        )
      ) {
        this.nearSpotPoints.splice(i, 1);
      }
    }

    //3
    return this.nearSpotPoints.sort(
      (a, b) => a.distanceToGameObject - b.distanceToGameObject
    )[0];
  }

  findPath(area, start, end, ctx) {
    if (!start || !end) {
      return [];
    }

    if (!this.findingPathStarted) {
      let firstSpotPoint = area.find(
        spotPoint =>
          spotPoint.position.x === start.position.x &&
          spotPoint.position.y === start.position.y
      );

      this.openList.push(firstSpotPoint);
      this.current = this.openList[0];

      this.findingPathStarted = true;
    }

    //Loop
    if (!this.pathEndReached && this.findingPathStarted) {
      this.current = this.openList.shift();
      this.closedList.push(this.current);

      if (!this.current) {
        return [];
      }

      if (
        this.current.position.x === end.position.x &&
        this.current.position.y === end.position.y
      ) {
        this.pathEndReached = true;
        this.temp = this.current;
        this.path.push(this.temp);
      }

      if (!this.pathEndReached) {
        for (let i = 0; i < this.current.neighbors.length; i++) {
          const neighbor = this.current.neighbors[i];
          neighbor.gCost = 0;
          neighbor.hCost = 0;
          neighbor.fCost = 0;

          let isInClosed = this.closedList.some(
            tile =>
              tile.position.x === neighbor.position.x &&
              tile.position.y === neighbor.position.y
          );

          let isInOpen = this.openList.some(
            tile =>
              tile.position.x === neighbor.position.x &&
              tile.position.y === neighbor.position.y
          );

          if (!isInClosed) {
            let possibleGCost =
              neighbor.gCost + this.calculateDistance(this.current, neighbor);

            if (!isInOpen) {
              this.openList.push(neighbor);
            }

            neighbor.gCost = possibleGCost;
            neighbor.hCost = this.calculateHCost(neighbor, end);
            neighbor.fCost = neighbor.gCost + neighbor.hCost;
            neighbor.parent = this.current;
          }
        }
      }

      this.openList = this.openList.sort((a, b) => a.fCost - b.fCost);
    }

    if (this.pathEndReached) {
      if (!this.path.includes(start)) {
        if (this.temp.parent && !this.path.includes(this.temp.parent)) {
          this.path.push(this.temp.parent);
          this.temp = this.temp.parent;
        }
      } else {
        if (!this.pathReversed) {
          this.path.reverse();
          this.pathReversed = true;
          this.pathFound = true;
        }
      }

      // Visualisation
      // for (let i = 0; i < this.openList.length; i++) {
      //   let tile = this.openList[i];
      //   ctx.fillStyle = 'blue';
      //   this.path?.forEach(spotPoint => {
      //     ctx.beginPath();
      //     ctx.moveTo(spotPoint.scope.x, spotPoint.scope.y);
      //     ctx.lineTo(spotPoint.parent?.scope.x, spotPoint.parent?.scope.y);
      //     ctx.stroke();
      //   });
      //   ctx.fillRect(tile.position.x, tile.position.y, TILE_SIZE, TILE_SIZE);
      // }
      // for (let i = 0; i < this.closedList.length; i++) {
      //   let tile = this.closedList[i];
      //   ctx.fillStyle = 'green';
      //   ctx.fillRect(tile.position.x, tile.position.y, TILE_SIZE, TILE_SIZE);
      // }

      // ctx.fillStyle = 'black';
      // ctx.fillRect(
      //   this.current.position.x,
      //   this.current.position.y,
      //   TILE_SIZE,
      //   TILE_SIZE
      // );

      // ctx.fillStyle = 'red';
      // ctx.fillRect(start.position.x, start.position.y, TILE_SIZE, TILE_SIZE);
      // ctx.fillRect(end.position.x, end.position.y, TILE_SIZE, TILE_SIZE);
    }
  }
}

//PATH FINDING - STANDARD

// /*
// calculateHCost(current, end) {
//   const distX = end.x - current.x;
//   const distY = end.y - current.y;
//   return Math.hypot(distX, distY);
// }

// generateGrid(grid) {
//   grid.forEach(tile => {
//     (tile.gCost = 0),
//       (tile.hCost = 0),
//       (tile.fCost = tile.gCost + tile.hCost);
//     tile.parent = null;
//     tile.neighbors = [];
//     tile.isExplored = false;
//     tile.isClosed = false;
//   });
//   return grid;
// }

// addNeighbors(grid, current) {
//   const neighbors = [];

//   //RIGHT
//   if (
//     grid.some(
//       tile => tile.x === current.x + TILE_SIZE && tile.y === current.y
//     )
//   ) {
//     neighbors.push({
//       x: current.x + TILE_SIZE,
//       y: current.y,
//       gCost: 0,
//       hCost: 0,
//       fCost: 0,
//       isExplored: false,
//       isClosed: false,
//     });
//   }
//   // LEFT;
//   if (
//     grid.some(
//       tile => tile.x === current.x - TILE_SIZE && tile.y === current.y
//     )
//   ) {
//     neighbors.push({
//       x: current.x - TILE_SIZE,
//       y: current.y,
//       gCost: 0,
//       hCost: 0,
//       fCost: 0,
//       isExplored: false,
//       isClosed: false,
//     });
//   }
//   //UP

//   if (
//     grid.some(
//       tile => tile.x === current.x && tile.y === current.y - TILE_SIZE
//     )
//   ) {
//     neighbors.push({
//       x: current.x,
//       y: current.y - TILE_SIZE,
//       gCost: 0,
//       hCost: 0,
//       fCost: 0,
//       isExplored: false,
//       isClosed: false,
//     });
//   }
//   //DOWN
//   if (
//     grid.some(
//       tile => tile.x === current.x && tile.y === current.y + TILE_SIZE
//     )
//   ) {
//     neighbors.push({
//       x: current.x,
//       y: current.y + TILE_SIZE,
//       gCost: 0,
//       hCost: 0,
//       fCost: 0,
//       isExplored: false,
//       isClosed: false,
//     });
//   }

//   return neighbors;
// }

//findPath(start, end)
//grid: [{x, y, width, height, isObstacle}...]
// const grid = this.generateGrid(); //grid = this.area
// findPath(grid, start, end, ctx) {
//   if (!this.findingPathStarted) {
//     this.openList.push(start);
//     this.current = this.openList[0];
//     this.current.isExplored = true;
//     this.findingPathStarted = true;
//   }

//   // this.openList = this.openList?.sort((a, b) => a.fCost - b.fCost);
//   // this.current = this.openList[0];
//   // if (this.openList[0].fCost === this.openList[1]?.fCost) {
//   //   // this.current = this.openList[0];
//   //   // console.log('same f');
//   // }
//   //Loop
//   if (!this.pathEndReached && this.findingPathStarted) {
//     this.current.isExplored = true;

//     this.current = this.openList.shift();
//     this.closedList.push(this.current);

//     console.log(this.closedList);

//     // je current ijedno i start jer je on nedini u open listi, ksnije ce current postati onaj tile koji ima najmanji fCost
//     // console.log(current, openList);
//     // End case -- result has been found, return the traced path
//     if (this.current.x === end.x && this.current.y === end.y) {
//       this.pathEndReached = true;
//       console.log('Found it');
//       return;
//     }
//     //   // let temp = current;
//     //   // path.push(temp);
//     //   // while (temp.parent) {
//     //   //   path.push(temp.parent);
//     //   //   temp = temp.parent;
//     //   // }
//     //   // // return the traced path
//     //   // return path.reverse();
//     // }

//     // let currentIndex = this.openList.indexOf(this.current); //!!!!!!!!!!!!!!
//     // // console.log(currentIndex);

//     //Viisualisation
//     for (let i = 0; i < this.openList.length; i++) {
//       let tile = this.openList[i];
//       ctx.fillStyle = 'blue';
//       ctx.fillRect(tile.x, tile.y, TILE_SIZE, TILE_SIZE);
//     }
//     for (let i = 0; i < this.closedList.length; i++) {
//       let tile = this.closedList[i];
//       ctx.fillStyle = 'green';
//       ctx.fillRect(tile.x, tile.y, TILE_SIZE, TILE_SIZE);
//     }

//     ctx.fillStyle = 'black';
//     ctx.fillRect(this.current.x, this.current.y, TILE_SIZE, TILE_SIZE);

//     ctx.fillStyle = 'red';
//     ctx.fillRect(end.x, end.y, TILE_SIZE, TILE_SIZE);
//     ctx.fillRect(start.x, start.y, TILE_SIZE, TILE_SIZE);

//     this.neighbors = this.addNeighbors(grid, this.current);

//     this.neighbors.forEach(neighbor => {
//       ctx.storkeStyle = 'yellow';
//       ctx.strokeRect(neighbor.x, neighbor.y, TILE_SIZE, TILE_SIZE);

//       // if (
//       //   this.closedList.some(
//       //     tile => tile.x === neighbor.x && tile.y === neighbor.y
//       //   )
//       // ) {
//       //   console.log('N is in closed');
//       // }

//       let isInClosed = this.closedList.some(
//         tile => tile.x === neighbor.x && tile.y === neighbor.y
//       );

//       let isInOpen = this.openList.some(
//         tile => tile.x === neighbor.x && tile.y === neighbor.y
//       );

//       if (!isInClosed) {
//         let possibleGCost = this.current.gCost + TILE_SIZE;

//         if (!isInOpen) {
//           this.openList.push(neighbor);
//         } else {
//           if (neighbor.gCost < possibleGCost) {
//             //ne radi nista
//             return;
//           }
//         }

//         neighbor.gCost = possibleGCost;
//         neighbor.hCost = this.calculateHCost(neighbor, end);
//         neighbor.fCost = neighbor.gCost + neighbor.hCost;
//         neighbor.parent = this.current;
//       }
//     });

//     this.openList = this.openList.sort((a, b) => a.fCost - b.fCost);
//   }

//   //Viisualisation
//   for (let i = 0; i < this.openList.length; i++) {
//     let tile = this.openList[i];
//     ctx.fillStyle = 'blue';
//     ctx.fillRect(tile.x, tile.y, TILE_SIZE, TILE_SIZE);
//   }
//   for (let i = 0; i < this.closedList.length; i++) {
//     let tile = this.closedList[i];
//     ctx.fillStyle = 'green';
//     ctx.fillRect(tile.x, tile.y, TILE_SIZE, TILE_SIZE);
//   }

//   ctx.fillStyle = 'black';
//   ctx.fillRect(this.current.x, this.current.y, TILE_SIZE, TILE_SIZE);

//   ctx.fillStyle = 'red';
//   ctx.fillRect(end.x, end.y, TILE_SIZE, TILE_SIZE);
//   ctx.fillRect(start.x, start.y, TILE_SIZE, TILE_SIZE);
// }
