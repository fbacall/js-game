// Trees
function Tree(image, x, y, bTop, bRight, bBottom, bLeft) {
    Entity.call(this, image, x, y, bTop, bRight, bBottom, bLeft, true)
}
extend(Entity, Tree);

function GreenTree(x, y) {
    Tree.call(this, images.tree1, x, y,  1, 14, 78, 10)
}
extend(Tree, GreenTree);

function ThinTree(x, y) {
    Tree.call(this, images.tree2, x, y, 1, 9, 55, 5)
}
extend(Tree, ThinTree);

function PinkTree(x, y) {
    Tree.call(this, images.tree3, x, y, 10, 15, 50, 15)
}
extend(Tree, PinkTree);

// Plants
function Plant(image, x, y) {
    Entity.call(this, image, x, y)
    this.collidable = false;
}
extend(Entity, Plant);

function RedFlower(x, y) {
    Plant.call(this, images.flower2, x, y)
}
extend(Plant, RedFlower);

function WhiteFlower(x, y) {
    Plant.call(this, images.flower1, x, y)
}
extend(Plant, WhiteFlower);

// Particles
var blingSprite = new Sprite(
    images.bling, 16, 16,
    {
        bling:    [[0,0],[1,0],[2,0],[3,0]]
    },
    'bling'
);


function Bling(x, y) {
    Particle.call(this, blingSprite, x, y, 60);
    this.frameskip = 5;
}
extend(Particle, Bling);
