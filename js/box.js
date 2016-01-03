function Box(x,y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

Box.prototype.rightEdge = function () {
    return this.x + this.width / 2;
};

Box.prototype.leftEdge = function () {
    return this.x - this.width / 2;
};

Box.prototype.topEdge = function () {
    return this.y - this.height / 2;
};

Box.prototype.bottomEdge = function () {
    return this.y + this.height / 2;
};

Box.prototype.overlap = function (other) {
    return this.rightEdge() > other.leftEdge() &&
        this.leftEdge() < other.rightEdge() &&
        this.bottomEdge() > other.topEdge() &&
        this.topEdge() < other.bottomEdge();
};

Box.prototype.contains = function (other) {
    return this.rightEdge() > other.rightEdge() &&
        this.leftEdge() < other.leftEdge() &&
        this.topEdge() < other.topEdge() &&
        this.bottomEdge() > other.bottomEdge();
};
