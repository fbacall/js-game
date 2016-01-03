function Particle(sprite, x, y, ttl, maxAcceleration, maxSpeed) {
    Entity.call(this, sprite, x, y);

    this.sprite = sprite;
    this.maxAcceleration = maxAcceleration;
    this.maxSpeed = maxSpeed;

    this.velocity = [0,0];
    this.acceleration = [0,0];

    this.ttl = ttl;

    // Animations
    this.animation = this.sprite.initialAnim; // Initial animation to play
    this.frameskip = 0;
    this.pause = false;
    this.frame = 0;
    this.skipCount = 0; // Number of frames skipped so far
}

extend(Entity, Particle);

Particle.prototype.draw = function (context) {
    this.sprite.draw(context, this.animation, this.frame, this.leftEdge(), this.topEdge());

    // If the animation should be playing...
    if (!this.pause) {
        // And we've skipped enough frames
        if (++this.skipCount >= this.frameskip) {
            this.skipCount = 0;
            // Increment the frame number
            if (++this.frame >= this.sprite.animations[this.animation].length)
                this.frame = 0;
        }
    }
};

Particle.prototype.accelerate = function () {};
Particle.prototype.move = function () {};
Particle.prototype.updateAnimation = function () {};

Particle.prototype.update = function () {
    this.accelerate();
    this.move();
    this.updateAnimation();
    if(--this.ttl <= 0) {
        world.entities.remove(this);
    }
};
