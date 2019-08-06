// Trees
class Tree extends Entity {
    constructor(image, x, y, bTop, bRight, bBottom, bLeft) {
        super(image, x, y, bTop, bRight, bBottom, bLeft, true);
    }
}

class GreenTree extends Tree {
    constructor (x, y) {
        super(images.tree1, x, y,  1, 14, 78, 10);
    }
}

class ThinTree extends Tree {
    constructor (x, y) {
        super(images.tree2, x, y, 1, 9, 55, 5);
    }
}

class PinkTree extends Tree {
    constructor (x, y) {
        super(images.tree3, x, y, 10, 15, 50, 15)
    }
}

// Plants
class Plant extends Entity {
    constructor (image, x, y) {
        super(image, x, y);
        this.collidable = false;
    }
}

class RedFlower extends Plant {
    constructor (x, y) {
        super(images.flower2, x, y);
    }
}

class WhiteFlower extends Plant {
    constructor (x, y) {
        super(images.flower1, x, y);
    }
}

// Particles
const blingSprite = new Sprite(
    images.bling, 16, 16,
    {
        bling:    [[0,0],[1,0],[2,0],[3,0]]
    },
    'bling'
);

class Bling extends Particle {
    constructor (x, y) {
        super(blingSprite, x, y, 60);
        this.frameskip = 5;
    }
}
