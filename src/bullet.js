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
