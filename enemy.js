function Enemy(enemySprite, x, y) {
    MobileEntity.call(this, enemySprite, x, y, 14,8,14,8, 0.6, 0.6 + (Math.random() * 2));

    this.path = [];
    this.lastPathCalc = Math.random() * 50; // Randomize so every enemy doesn't do pathfinding on the same frame
}

extend(MobileEntity, Enemy);

Enemy.prototype.solid = false;

Enemy.prototype.update = function () {
    // Recalc path every 50 frames
    if(this.lastPathCalc++ > 50) {
        this.path = Pathfinding.aStar([this.x, this.y],[player.x, player.y]);
        this.lastPathCalc = 0;
    }

    // Move towards either the next node in the path, or if the path is empty, directly towards the player.
    var target;
    if(this.path[0]) {
        target = [this.path[0][X], this.path[0][Y]];
        if(abs(this.path[0][X] - this.x) < 24 && abs(this.path[0][Y] - this.y) < 24)
            this.path.shift();
    } else {
        target = [player.x, player.y];
    }

    if (target[X] > this.x)
        this.acceleration[X] = this.maxAcceleration;
    else
        this.acceleration[X] = -this.maxAcceleration;

    if (target[Y] > this.y)
        this.acceleration[Y] = this.maxAcceleration;
    else
        this.acceleration[Y] = -this.maxAcceleration;

    MobileEntity.prototype.update.call(this);
};

Enemy.prototype.updateAnimation = MobileEntity.prototype.pathfindingAnimation;

Enemy.prototype.handleCollision = function (other) {
    if (other instanceof Player) {
        alert("You got got");
        init();
    }
};
