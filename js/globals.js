var frames = 0;
var boundaryX, boundaryY, treeCount, appleCount, maxSpeed, acceleration, friction;
var MAP = { solid: true };

var imageUrls = {
    tree1: "img/tree.png",
    tree2: "img/tree2.png",
    tree3: "img/pink_tree.png",
    flower1: "img/flower1.png",
    flower2: "img/flower2.png",
    player: "img/player.png",
    enemy: "img/enemy.png",
    apple: "img/apple.png",
    grass: "img/grass.png",
    knife: "img/knife.png",
    bling: "img/bling.png"
};

var images = {};

// Load all images
var loadedImageCount = 0;
var imagesReady = false;
var documentReady = false;
var imagesToLoad = Object.keys(imageUrls).length;
for (var i = 0; i < imagesToLoad; i++) {
    var key = Object.keys(imageUrls)[i];
    var imageObject = new Image();
    imageObject.onload = function () {
        console.log("Loading image: " + (loadedImageCount+1) + " / " + imagesToLoad);
        if (++loadedImageCount == imagesToLoad) {
            imagesReady = true;
            startGame();
        }
    };
    imageObject.onerror = function () {
        console.log("Failed to load image: " + this.src);
    };

    imageObject.src = imageUrls[key];
    images[key] = imageObject;
}

// Game globals
var canvas, context, player, camera, score, knives, world, grassPattern, settings = {};
