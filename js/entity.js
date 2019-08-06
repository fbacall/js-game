class Entity extends Box {
    constructor (image, x, y, bTop, bRight, bBottom, bLeft, solid) {
        super(Math.round(x), Math.round(y), image.width * scale, image.height * scale);

        this.image = image;

        this.boundaryTop = (bTop || this.image.height / 2) * scale;
        this.boundaryRight = (bRight || this.image.width / 2) * scale;
        this.boundaryBottom = (bBottom || this.image.height / 2) * scale;
        this.boundaryLeft = (bLeft || this.image.width / 2) * scale;

        this.solid = solid || false;
        this.collidable = true;

        this.next = null;
        this.prev = null;
    }

    draw (context) {
        context.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.leftEdge(), this.topEdge(),
            this.image.width * scale,
            this.image.height * scale);
    }

    rightBoundary () {
        return this.x + this.boundaryRight;
    }

    leftBoundary () {
        return this.x - this.boundaryLeft;
    }

    topBoundary () {
        return this.y - this.boundaryTop;
    }

    bottomBoundary () {
        return this.y + this.boundaryBottom;
    }

    collisionRight (other, distance) {
        return this.x < other.x && this.rightBoundary() + (distance || 0) > other.leftBoundary() &&
            this.bottomBoundary() > other.topBoundary() && this.topBoundary() < other.bottomBoundary();
    }

    collisionLeft (other, distance) {
        return this.x > other.x && this.leftBoundary() + (distance || 0) < other.rightBoundary() &&
            this.bottomBoundary() > other.topBoundary() && this.topBoundary() < other.bottomBoundary();
    }

    collisionTop (other, distance) {
        return this.y > other.y && this.topBoundary() + (distance || 0) < other.bottomBoundary() &&
            this.rightBoundary() > other.leftBoundary() && this.leftBoundary() < other.rightBoundary();
    }

    collisionBottom (other, distance) {
        return this.y < other.y && this.bottomBoundary() + (distance || 0) > other.topBoundary() &&
            this.rightBoundary() > other.leftBoundary() && this.leftBoundary() < other.rightBoundary();
    }

    collision (other) {
        return this.rightBoundary() > other.leftBoundary() && this.leftBoundary() < other.rightBoundary() &&
            this.bottomBoundary() > other.topBoundary() && this.topBoundary() < other.bottomBoundary();
    }

    isVisible (camera) {
        return camera.overlap(this);
    }

    handleCollision (object, direction) {}
}
