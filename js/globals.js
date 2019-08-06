let frames = 0;
let boundaryX, boundaryY, treeCount, appleCount, maxSpeed, acceleration, friction;
const MAP = { solid: true };

const imageUrls = {
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

const images = {};

// Load all images
let loadedImageCount = 0;
let imagesReady = false;
let documentReady = false;
let imagesToLoad = Object.keys(imageUrls).length;
for (let i = 0; i < imagesToLoad; i++) {
    let key = Object.keys(imageUrls)[i];
    const imageObject = new Image();
    imageObject.onload = function () {
        console.log("Loading image: " + (loadedImageCount+1) + " / " + imagesToLoad);
        if (++loadedImageCount === imagesToLoad) {
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
let canvas, context, player, camera, score, world, grassPattern, settings = {};
