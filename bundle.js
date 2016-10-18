(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./asteroids.js":2,"./game.js":4,"./player.js":5}],2:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000/8;
const Vector = require('./vector');

/**
 * @module exports the Asteroids class
 */
module.exports = exports = Asteroids;

var asteroids = [];
var asteroidbump = new Audio("assets/asteroidbump.wav");

/**
 * @constructor Asteroids
 * Creates a new asteroids object
 * @param {Postition} position object specifying an x and y
 */
function Asteroids(num, ctx) {
    if(asteroids.length > 0) {
      asteroids = [];  
    }
    for(var i=0; i<num; i++) {
        var sign = {x: 1, y: 1};
        if(Math.random() > 0.5) sign.x = -1;
        if(Math.random() > 0.5) sign.y = -1;
        var size = Math.floor(20*Math.random())+8;
        asteroids.push({
            worldWidth: ctx.width,
            worldHeight: ctx.height,
            position: {x: ctx.width*Math.random(), y: ctx.height*Math.random()},
            velocity: {x: sign.x*Math.random()*0.5+0.2, y: sign.y*Math.random()*0.5+0.2},
            size: size
        });
        checkPositions(ctx);
    }
    this.score = 0;
}

/**
 * @function updates the asteroids object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Asteroids.prototype.update = function(time) {
    var self = this;
    asteroids.forEach(function(asteroid) {
        // Check for collisions
        asteroids.forEach(function(asteroid2) {
            if(asteroid.position.x + asteroid.size + asteroid2.size > asteroid2.position.x &&
               asteroid.position.x < asteroid2.position.x + asteroid.size + asteroid2.size &&
               asteroid.position.y + asteroid.size + asteroid2.size > asteroid2.position.y &&
               asteroid.position.y < asteroid2.position.y + asteroid.size + asteroid2.size && 
               asteroid != asteroid2) {
                    var distance = Math.sqrt(((asteroid.position.x - asteroid2.position.x) * (asteroid.position.x - asteroid2.position.x)) + ((asteroid.position.y - asteroid2.position.y) * (asteroid.position.y - asteroid2.position.y)));
                    if(distance < asteroid.size + asteroid2.size) {
                        asteroidbump.play();
                        // This is a big mess of calculations. Some may be uneccesary, but my collisions looks good, so I don't want to mess with it
                        var collisionNormal = {x: asteroid.position.x - asteroid2.position.x, y: asteroid.position.y - asteroid2.position.y};
                        var mag = Math.sqrt(collisionNormal.x * collisionNormal.x + collisionNormal.y * collisionNormal.y);
                        var overlap = asteroid.size + asteroid2.size - mag;
                        collisionNormal = {x: collisionNormal.x/mag, y: collisionNormal.y/mag};
                        asteroid.position.x += collisionNormal.x * overlap / 2;
                        asteroid.position.y += collisionNormal.y * overlap / 2;
                        asteroid2.position.x -= collisionNormal.x * overlap / 2;
                        asteroid2.position.y -= collisionNormal.y * overlap / 2;
                        var newVelX1 = (asteroid.velocity.x * (asteroid.size - asteroid2.size) + (2 * asteroid2.size * asteroid2.velocity.x)) / (asteroid.size + asteroid2.size);
                        var newVelY1 = (asteroid.velocity.y * (asteroid.size - asteroid2.size) + (2 * asteroid2.size * asteroid2.velocity.y)) / (asteroid.size + asteroid2.size);
                        var newVelX2 = (asteroid2.velocity.x * (asteroid2.size - asteroid.size) + (2 * asteroid.size * asteroid.velocity.x)) / (asteroid2.size + asteroid.size);
                        var newVelY2 = (asteroid2.velocity.y * (asteroid2.size - asteroid.size) + (2 * asteroid.size * asteroid.velocity.y)) / (asteroid2.size + asteroid.size);
                        asteroid.velocity.x = newVelX1;
                        asteroid.velocity.y = newVelY1;
                        asteroid2.velocity.x = newVelX2;
                        asteroid2.velocity.y = newVelY2;
                        asteroid.position.x += asteroid.velocity.x;
                        asteroid.position.y += asteroid.velocity.y;
                        asteroid2.position.x += asteroid2.velocity.x;
                        asteroid2.position.y += asteroid2.velocity.y;
                    }
                }
        });
        // Apply velocity
        asteroid.position.x += asteroid.velocity.x;
        asteroid.position.y += asteroid.velocity.y;
        // Wrap around the screen
        if(asteroid.position.x < 0) asteroid.position.x += asteroid.worldWidth;
        if(asteroid.position.x > asteroid.worldWidth) asteroid.position.x -= asteroid.worldWidth;
        if(asteroid.position.y < 0) asteroid.position.y += asteroid.worldHeight;
        if(asteroid.position.y > asteroid.worldHeight) asteroid.position.y -= asteroid.worldHeight;
    });  
}

/**
 * @function renders the asteroids into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Asteroids.prototype.render = function(time, ctx) {
  
  asteroids.forEach(function(asteroid) {
    ctx.save();
    // Draw asteroids
    ctx.translate(asteroid.position.x, asteroid.position.y);
    ctx.beginPath();
    ctx.arc(0,0,asteroid.size,0,2*Math.PI);
    ctx.closePath();
    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.restore();
  });
}

Asteroids.prototype.getAsteroids = function() {
    return asteroids;
}

// Makes sure no asteroids will generate inside of each other
// DOESN'T WORK AND I DON'T KNOW WHY!!!
function checkPositions(ctx) {
    asteroids.forEach(function(asteroid) {
        asteroids.forEach(function(asteroid2) {
                if(asteroid.num != asteroid2.num &&
                asteroid.position.x + asteroid.size + asteroid2.size > asteroid2.position.x &&
                asteroid.position.x < asteroid2.position.x + asteroid.size + asteroid2.size &&
                asteroid.position.y + asteroid.size + asteroid2.size > asteroid2.position.y &&
                asteroid.position.y < asteroid2.position.y + asteroid.size + asteroid2.size) {
                    asteroid.position = {x: ctx.width*Math.random(), y: ctx.height*Math.random()};
                    checkPositions(ctx);
                }
                return 1;
        });
    });
}

},{"./vector":6}],3:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000/8;

/**
 * @module exports the Bullet class
 */
module.exports = exports = Bullet;

var bulletHit = new Audio("assets/explodeasteroid.wav")
/**
 * @constructor Bullet
 * Creates a new bullet object
 * @param {Postition} position object specifying an x and y
 */
function Bullet(position, canvas, angle) {
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.angle = angle;
  this.position = {
    x: position.x,
    y: position.y
  }
  this.velocity = {
    x: -10*Math.sin(angle),
    y: -10*Math.cos(angle)
  }
}



/**
 * @function updates the bullet object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Bullet.prototype.update = function(time, asteroids) {
  var numCollision = 0;
  // Apply velocity
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;

  var self = this;
  //Check for collisions with asteroids
  asteroids.forEach(function(asteroid) {
    if(self.position.x + 1 + asteroid.size > asteroid.position.x &&
       self.position.x < asteroid.position.x + 1 + asteroid.size &&
       self.position.y + 5 + asteroid.size > asteroid.position.y &&
       self.position.y < asteroid.position.y + 5 + asteroid.size) {
         bulletHit.play();
         self.position.x = -100;
         self.velocity.x = 0;
         if(!(asteroid.size / 2 < 8)) {
            var ast1 = {
              worldWidth: asteroid.worldWidth,
              worldHeight: asteroid.worldHeight,
              position: {x: asteroid.position.x - 1, y: asteroid.position.y - 1},
              velocity: {x: asteroid.velocity.x + 1, y: asteroid.velocity.y + 1},
              size: asteroid.size / 2};
            var ast2 = {
              worldWidth: asteroid.worldWidth,
              worldHeight: asteroid.worldHeight,
              position: {x: asteroid.position.x, y: asteroid.position.y},
              velocity: {x: -asteroid.velocity.x, y: -asteroid.velocity.y},
              size: asteroid.size / 2};
            asteroids.push(ast1);
            asteroids.push(ast2);
         }
        var index = asteroids.indexOf(asteroid);
        asteroids.splice(index, 1);
        numCollision++;
       }
  });
  return numCollision;
}

/**
 * @function renders the bullet into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Bullet.prototype.render = function(time, ctx) {
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  ctx.rotate(-this.angle);
  ctx.fillStyle = "red";
  ctx.fillRect(0,-10,2,10);
  ctx.restore();
}

},{}],4:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}],5:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000/8;
const Bullet = require('./bullet.js');

/**
 * @module exports the Player class
 */
module.exports = exports = Player;

var laserShoot = new Audio('assets/laser.wav');
var die = new Audio('assets/explodeship.wav');

/**
 * @constructor Player
 * Creates a new player object
 * @param {Postition} position object specifying an x and y
 */
function Player(position, canvas, score, lives) {
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.state = "idle";
  this.position = {
    x: position.x,
    y: position.y
  };
  this.velocity = {
    x: 0,
    y: 0
  }
  this.angle = 0;
  this.radius  = 64;
  this.thrusting = false;
  this.steerLeft = false;
  this.steerRight = false;
  this.shooting = false;
  this.frame = 0;
  this.bullets = [];
  this.lives = lives;
  this.score = score;
  this.died = false;

  var self = this;
  window.onkeydown = function(event) {
    switch(event.key) {
      case 'ArrowUp': // up
      case 'w':
        self.thrusting = true;
        break;
      case 'ArrowLeft': // left
      case 'a':
        self.steerLeft = true;
        break;
      case 'ArrowRight': // right
      case 'd':
        self.steerRight = true;
        break;
      case 'e': // Couldn't make spacebar work
        self.shooting = true;
        break;
    }
  }

  window.onkeyup = function(event) {
    switch(event.key) {
      case 'ArrowUp': // up
      case 'w':
        self.thrusting = false;
        break;
      case 'ArrowLeft': // left
      case 'a':
        self.steerLeft = false;
        break;
      case 'ArrowRight': // right
      case 'd':
        self.steerRight = false;
        break;
      case 'e': //Couldn't make spacebar work
        self.shooting = false;
    }
  }
}



/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.update = function(time, ctx, asteroids) {
  // Apply angular velocity
  if(this.steerLeft) {
    this.angle += time * 0.005;
  }
  if(this.steerRight) {
    this.angle -= 0.1;
  }
  // Apply acceleration
  if(this.thrusting) {
    var acceleration = {
      x: Math.sin(this.angle)/4,
      y: Math.cos(this.angle)/4
    }
    this.velocity.x -= acceleration.x;
    this.velocity.y -= acceleration.y;
  }
  //Shoot bullets
  if(this.shooting && this.frame == 0) {
    this.bullets.push(new Bullet(this.position, ctx, this.angle));
    if(this.bullets.length > 32) this.bullets.shift();
    laserShoot.play();
  }
  // Apply velocity
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  // Wrap around the screen
  if(this.position.x < 0) this.position.x += this.worldWidth;
  if(this.position.x > this.worldWidth) this.position.x -= this.worldWidth;
  if(this.position.y < 0) this.position.y += this.worldHeight;
  if(this.position.y > this.worldHeight) this.position.y -= this.worldHeight;

  var self = this;
  // Update bullets
  this.bullets.forEach(function(bullet) {
    self.score += 100*bullet.update(time, asteroids);
  });
  if(this.frame == 3) this.frame = 0;
  else this.frame++;

  var self = this;
  // Check for collisions with asteroids
  asteroids.forEach(function(asteroid) {
    if(self.position.x + 10 + asteroid.size > asteroid.position.x &&
       self.position.x < asteroid.position.x + 10 + asteroid.size &&
       self.position.y + 10 + asteroid.size > asteroid.position.y &&
       self.position.y < asteroid.position.y + 10 + asteroid.size) {
         die.play();
         self.lives--;
         self.died = true;
       }
  });
  return true;
}

/**
 * @function renders the player into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Player.prototype.render = function(time, ctx) {
  ctx.save();

  // Draw player's ship
  ctx.translate(this.position.x, this.position.y);
  ctx.rotate(-this.angle);
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-10, 10);
  ctx.lineTo(0, 0);
  ctx.lineTo(10, 10);
  ctx.closePath();
  ctx.strokeStyle = 'white';
  ctx.stroke();

  // Draw engine thrust
  if(this.thrusting) {
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(5, 10);
    ctx.arc(0, 10, 5, 0, Math.PI, true);
    ctx.closePath();
    ctx.strokeStyle = 'orange';
    ctx.stroke();
  }

  ctx.restore();

  //Draw bullets
  this.bullets.forEach(function(bullet) {
    bullet.render(time, ctx);
  });
}

},{"./bullet.js":3}],6:[function(require,module,exports){
module.export = exports = {
	rotate: rotate,
	dotProduct: dotProduct,
	magnitude: magnitude,
	normalize: normalize
}

function rotate(a, angle) {
	return {
		x: a.x * Math.cos(angle) - a.y * Math.sin(angle),
		y: a.x * Math.sin(angle) - a.y * Math.cos(angle)
	}
}

function dotProduct(a, b) {
	return a.x * b.x + a.y * b.y;
}

function magnitude(a) {
	return Math.sqrt(a.x * a.x + a.y * a.y);
}

function normalize(a) {
	var magnitude = magnitude(a);
	return {x: a.x/magnitude, y: a.y/magnitude}
}
},{}]},{},[1]);
