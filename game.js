//1. npm init
//2. npm install electron -save--dev
//3. editujemo package.json
//4. popunimo game.js script koji nam je ulaz u ugricu:

'use strict';

const electron = require('electron');
//dva sub-modula
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path'); //dodatni modul
const url = require('url'); //dodatni modul

let win; //window

function createWindow() {
  win = new BrowserWindow();
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true,
    })
  );

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

//Nedostaje code za Mac za close window

//5. Instrukcije za pakovanje pomocu electron forgea:

// https://www.electronjs.org/docs/latest/tutorial/tutorial-packaging

//* ukoliko bude error ponovi:

// npm install --save-dev @electron-forge/cli
// npx electron-forge import
