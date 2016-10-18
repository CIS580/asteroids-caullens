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
