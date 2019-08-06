class Box {
    constructor (x,y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    rightEdge () {
        return this.x + this.width / 2;
    }

    leftEdge () {
        return this.x - this.width / 2;
    }

    topEdge () {
        return this.y - this.height / 2;
    }

    bottomEdge () {
        return this.y + this.height / 2;
    }

    overlap (other) {
        return this.rightEdge() > other.leftEdge() &&
            this.leftEdge() < other.rightEdge() &&
            this.bottomEdge() > other.topEdge() &&
            this.topEdge() < other.bottomEdge();
    }

    contains (other) {
        return this.rightEdge() > other.rightEdge() &&
            this.leftEdge() < other.leftEdge() &&
            this.topEdge() < other.topEdge() &&
            this.bottomEdge() > other.bottomEdge();
    }
}
