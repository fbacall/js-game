function Entity(image, x, y, bTop, bRight, bBottom, bLeft, solid) {
    Box.call(this,Math.round(x), Math.round(y), image.width, image.height); // Superconstructor!

    this.image = image;

    this.boundaryTop = bTop || this.image.height/2;
    this.boundaryRight = bRight || this.image.width/2;
    this.boundaryBottom = bBottom || this.image.height/2;
    this.boundaryLeft = bLeft || this.image.width/2;

    this.solid = solid || false;
    this.collidable = true;

    this.next = null;
    this.prev = null;
}

extend(Box, Entity);

Entity.prototype.draw = function (context) {
    context.drawImage(this.image, this.leftEdge(), this.topEdge());
};

Entity.prototype.rightBoundary = function () {
    return this.x + this.boundaryRight;
};

Entity.prototype.leftBoundary = function () {
    return this.x - this.boundaryLeft;
};

Entity.prototype.topBoundary = function () {
    return this.y - this.boundaryTop;
};

Entity.prototype.bottomBoundary = function () {
    return this.y + this.boundaryBottom;
};

Entity.prototype.collisionRight = function (other, distance) {
    return this.x < other.x && this.rightBoundary() + (distance || 0) > other.leftBoundary() &&
        this.bottomBoundary() > other.topBoundary() && this.topBoundary() < other.bottomBoundary();
};

Entity.prototype.collisionLeft = function (other, distance) {
    return this.x > other.x && this.leftBoundary() + (distance || 0) < other.rightBoundary() &&
        this.bottomBoundary() > other.topBoundary() && this.topBoundary() < other.bottomBoundary();
};

Entity.prototype.collisionTop = function (other, distance) {
    return this.y > other.y && this.topBoundary() + (distance || 0) < other.bottomBoundary() &&
        this.rightBoundary() > other.leftBoundary() && this.leftBoundary() < other.rightBoundary();
};

Entity.prototype.collisionBottom = function (other, distance) {
    return this.y < other.y && this.bottomBoundary() + (distance || 0) > other.topBoundary() &&
        this.rightBoundary() > other.leftBoundary() && this.leftBoundary() < other.rightBoundary();
};

Entity.prototype.collision = function (other) {
    return this.rightBoundary() > other.leftBoundary() && this.leftBoundary() < other.rightBoundary() &&
        this.bottomBoundary() > other.topBoundary() && this.topBoundary() < other.bottomBoundary();
};

Entity.prototype.isVisible = function (camera) {
    return camera.overlap(this);
};

Entity.prototype.handleCollision = function (object, direction) {};
