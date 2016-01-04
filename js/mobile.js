function MobileEntity(sprite, x, y, bTop, bRight, bBottom, bLeft, maxAcceleration, maxSpeed) {
    Entity.call(this, sprite, x, y, bTop, bRight, bBottom, bLeft);

    this.sprite = sprite;
    this.maxAcceleration = maxAcceleration;
    this.maxSpeed = maxSpeed;

    this.velocity = [0,0];
    this.acceleration = [0,0];
    this.colliding = [null, null];

    // Animations
    this.animation = this.sprite.initialAnim; // Initial animation to play
    this.frameskip = 0;
    this.pause = false;
    this.frame = 0;
    this.skipCount = 0; // Number of frames skipped so far
}

extend(Entity, MobileEntity);

MobileEntity.prototype.draw = function (context) {
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

MobileEntity.prototype.updateAnimation = function () {};

MobileEntity.prototype.update = function () {
    this.accelerate();
    if (this.speed() > 0)   // Only need to detect collision if moving!
        this.detectCollision();
    this.move();
    this.updateAnimation();
};

MobileEntity.prototype.accelerate = function () {
    // Accelerate
    this.velocity[X] += this.acceleration[X];
    this.velocity[Y] += this.acceleration[Y];

    // Limit speed
    if (this.speed() > this.maxSpeed)
        this.velocity = normalise(this.velocity, this.maxSpeed);

    // Friction
    var frictionVector = normalise(this.velocity, friction);
    if (abs(frictionVector[X]) < abs(this.velocity[X]))
        this.velocity[X] -= frictionVector[X];
    else
        this.velocity[X] = 0;
    if (abs(frictionVector[Y]) < abs(this.velocity[Y]))
        this.velocity[Y] -= frictionVector[Y];
    else
        this.velocity[Y] = 0;
};

MobileEntity.prototype.detectCollision = function () {
    // Variables to hold the objects currently colliding with
    this.colliding[X] = null;
    this.colliding[Y] = null;

    // Choose collision function
    if (this.velocity[X] > 0)
        this.collisionXdetector = this.collisionRight;
    else
        this.collisionXdetector = this.collisionLeft;

    if (this.velocity[Y] > 0)
        this.collisionYdetector = this.collisionBottom;
    else
        this.collisionYdetector = this.collisionTop;

    // Iterate over list of objects
    var me = this;
    world.entities.each(function (entity) {
        // Can't collide with ourself, so skip this
        if (entity === me)
            return true;

        // Stop altogether if we've detected collisions on both axes
        if (me.colliding[X] !== null && me.colliding[Y] !== null)
            return false;

        // Stop checking this axis once we detect collision
        if (me.colliding[X] == null) {
            if (me.collisionXdetector(entity, me.velocity[X])) {
                me.colliding[X] = entity;
                if (entity.colliding)
                    entity.colliding[X] = me;
            }
        }

        if (me.colliding[Y] == null) {
            if (me.collisionYdetector(entity, me.velocity[Y])) {
                me.colliding[Y] = entity;
                if (entity.colliding)
                    entity.colliding[Y] = me;
            }
        }
    });

    // Map collision
    if (this.colliding[X] == null) {
        if(this.rightBoundary() + this.velocity[X] > boundaryX ||
            this.leftBoundary() + this.velocity[X] < 0)
            this.colliding[X] = MAP;
    }

    if (this.colliding[Y] == null) {
        if(this.bottomBoundary() + this.velocity[Y] > boundaryY ||
            this.topBoundary() + this.velocity[Y] < 0)
            this.colliding[Y] = MAP;
    }

    // Collision callbacks
    if (this.colliding[X] !== null) {
        // Call collision handling functions on this and the thing collided with
        this.handleCollision(this.colliding[X], X);
        if (this.colliding[X].handleCollision)
            (this.colliding[X]).handleCollision(this, X);
    }
    if (this.colliding[Y] !== null) {
        this.handleCollision(this.colliding[Y], Y);
        if (this.colliding[Y].handleCollision)
            (this.colliding[Y]).handleCollision(this, Y);
    }
};

MobileEntity.prototype.move = function () {
    // Move
    this.x = Math.round(this.x + this.velocity[X]);
    this.y = Math.round(this.y + this.velocity[Y]);
};

MobileEntity.prototype.directionalAnimation = function () {
    // Update animations
    if (this.acceleration[X] > 0)
        this.animation = 'right';
    else if (this.acceleration[X] < 0)
        this.animation = 'left';
    if(abs(this.acceleration[Y]) > abs(this.acceleration[X])) {
        if (this.acceleration[Y] > 0)
            this.animation = 'bottom';
        else if (this.acceleration[Y] < 0)
            this.animation = 'top';
    }

    if (this.velocity[Y] == 0 && this.velocity[X] == 0) {
        this.pause = true;
        this.frame = 0;
    }
    else {
        this.pause = false;
        this.frameskip = Math.ceil(24 / this.speed());
    }
};

MobileEntity.prototype.pathfindingAnimation = function () {
    if (this.path[0]) {
        var xDiff = this.path[0][X] - this.x;
        var yDiff = this.path[0][Y] - this.y;

        if (xDiff > 0 && abs(xDiff) > abs(yDiff))
            this.animation = 'right';
        else if (xDiff <= 0 && abs(xDiff) > abs(yDiff))
            this.animation = 'left';
        else if (yDiff > 0)
            this.animation = 'bottom';
        else if (yDiff <= 0)
            this.animation = 'top';
    }
    if (this.velocity[Y] == 0 && this.velocity[X] == 0) {
        this.pause = true;
        this.frame = 0;
    }
    else {
        this.pause = false;
        this.frameskip = Math.ceil(24 / this.speed());
    }
};

MobileEntity.prototype.speed = function () {
    return magnitude(this.velocity);
};
