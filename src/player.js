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
