"use strict;"

/* Classes */
const Game = require('./game.js');
const Player = require('./player.js');
const Asteroids = require('./asteroids.js');

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var level = 1;
var asteroids = new Asteroids(level*5+5, canvas);
var player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas, 0, 3);
var youlost = new Image();
youlost.src = "./assets/youlost.png";

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());


/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
  player.update(elapsedTime, canvas, asteroids.getAsteroids());
  asteroids.update(elapsedTime);
  if(asteroids.getAsteroids() == 0) {
    level++;
    asteroids = new Asteroids(5*level+5, canvas);
    player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas, player.score, player.lives);
  }
  if(player.lives <= 0) {
    game.pause(true);
  }
  if(player.died) {
    asteroids = new Asteroids(5*level+5, canvas);
    player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas, player.score, player.lives);
  }
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.render(elapsedTime, ctx);
  asteroids.render(elapsedTime, ctx);
  ctx.fillStyle = "blue";
  ctx.font = "20px Georgia";
  ctx.fillText("Score: " + player.score + "          Level: " + level + "          Lives: " + player.lives, 10, canvas.height - 10);
  if(player.lives <= 0) { 
    ctx.drawImage(youlost,0,0);
  }
}
