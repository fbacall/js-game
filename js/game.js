window.onload = function() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    document.getElementById('applySettings').addEventListener('click', init);
    document.getElementById('settingsToggle').addEventListener('click', function () {
        document.getElementById('settings').classList.toggle('visible');
    });

    // Debugging
    document.getElementById('debugToggle').addEventListener('click', function () {
        document.getElementById('debugToggle').classList.toggle('enabled');
        debug.enabled = !debug.enabled;
        if (debug.enabled)
        // Measure FPS
            debug.fpsCounter = setInterval(function() {
                debug.fps = frames / 0.5;
                frames = 0;
            }, 500);
        else
            clearInterval(debug.fpsCounter);
        return false;
    });

    // Player controls
    window.addEventListener('keydown', function(event) {
        if (event.key === 'w') {//W up
            event.preventDefault();
            player.acceleration = [player.acceleration[X], -1];
        }
        else if (event.key === 's') {//S down
            event.preventDefault();
            player.acceleration = [player.acceleration[X], 1];
        }
        else if (event.key === 'a') {//A left
            event.preventDefault();
            player.acceleration = [-1, player.acceleration[Y]];
        }
        else if (event.key === 'd') {//D right
            event.preventDefault();
            player.acceleration = [1, player.acceleration[Y]];
        }
    });

    window.addEventListener('keyup', function(event) {
        if (event.key === 'w') {//W up
            event.preventDefault();
            if (player.acceleration[Y] < 0)
                player.acceleration[Y] = 0;
        }
        else if (event.key === 's') {//S down
            event.preventDefault();
            if (player.acceleration[Y] > 0)
                player.acceleration[Y] = 0;
        }
        else if (event.key === 'a') {//A left
            event.preventDefault();
            if (player.acceleration[X] < 0)
                player.acceleration[X] = 0;
        }
        else if (event.key === 'd') {//D right
            event.preventDefault();
            if (player.acceleration[X] > 0)
                player.acceleration[X] = 0;
        }
    });

    let clickMoving = false;
    canvas.addEventListener('mousemove', function (event) {
        if (clickMoving) {
            event.preventDefault();
            const x = (event.pageX - canvas.offsetLeft) - (canvas.width * zoom / 2);
            const y = (event.pageY - canvas.offsetTop) - (canvas.height * zoom / 2);
            player.acceleration = normalise([x,y],15);
        }
    });
    canvas.addEventListener('mousedown', function (event) {
        event.preventDefault();
        const x = (event.pageX - canvas.offsetLeft) - (canvas.width * zoom / 2);
        const y = (event.pageY - canvas.offsetTop) - (canvas.height * zoom / 2);

        player.acceleration = normalise([x,y],15);
        clickMoving = true;

        //const x = (event.pageX - canvas.offsetLeft) + camera.leftEdge();
        //const y = (event.pageY - canvas.offsetTop) + camera.topEdge();
        //console.log(Math.floor(x / navGridResolution));
        //PATHTEST = aStar(navGrid[Math.floor(player.x / navGridResolution)][Math.floor(player.y / navGridResolution)],
        //    navGrid[Math.floor(x / navGridResolution)][Math.floor(y / navGridResolution)]);
    });
    window.addEventListener('mouseup', function () {
        if (clickMoving) {
            player.acceleration = [0,0];
            clickMoving = false;
        }
    });

    documentReady = true;
    startGame();
};

// Initialize the game
function init() {
    console.log("*** init called");

    world = new World();
    boundaryX = parseFloat(document.getElementById('cBoundaryX').value);
    boundaryY = parseFloat(document.getElementById('cBoundaryY').value);
    treeCount = parseInt(document.getElementById('cTreeCount').value);
    appleCount = parseInt(document.getElementById('cAppleCount').value);
    settings.playerMaxSpeed = parseFloat(document.getElementById('cMaxSpeed').value);
    settings.playerAcceleration = parseFloat(document.getElementById('cPlayerAcceleration').value);
    friction = parseFloat(document.getElementById('cFriction').value);
    enemyCount = parseInt(document.getElementById('cEnemyCount').value);
    scale = parseFloat(document.getElementById('cScale').value);
    zoom = parseFloat(document.getElementById('cZoom').value);

    canvas.style.width = "" + canvas.width * zoom + "px";
    canvas.style.height = "" + canvas.height * zoom + "px";

    score = 0;

    player = new Player((boundaryX / 2), (boundaryY / 2));

    // Place some flowers
    const flowerCount = Math.ceil(boundaryX * boundaryY / 50000);
    for (let i = 0; i < flowerCount; i++) {
        const plantType = Math.random() > 0.5 ? RedFlower : WhiteFlower;
        const x = 50 + Math.random() * (boundaryX - 100);
        const y = 50 + Math.random() * (boundaryY - 100);
        world.entities.add(new plantType(x, y));
    }

    for (let i = 0; i < enemyCount; i++)
        world.entities.add(new Enemy(20 + Math.random() * 1000, 20 + Math.random()*20));

    // Camera
    camera = new Box(player.x, player.y, canvas.width, canvas.height);

    let i, x, y, stop, tries;

    // Place player
    world.entities.add(player);

    // Place Apples
    const apple = images.apple;
    for (i = 0; i < appleCount; i++) {
        stop = false;
        tries = 200;
        while (!stop && tries-- > 0) {
            x = apple.width + Math.random() * (boundaryX - 2*apple.width);
            y = apple.height + Math.random() * (boundaryY - 2*apple.height);
            // Make sure they're not blocking the starting area
            if ((x < (boundaryX / 2 - 100) || x > (boundaryX / 2 + 100)) &&
                (y < (boundaryY / 2 - 100) || y > (boundaryY / 2 + 100))) {
                const a = new Entity(apple, x,y, 10,10,10,10, false);
                a.handleCollision = function (other) {
                    if (other === player) {
                        world.entities.remove(this);
                        world.entities.add(new Bling(player.x, player.topEdge()));
                        score++;
                        if (score >= appleCount) {
                            alert("You win!!!");
                            init();
                        }
                    }
                };
                world.entities.add(a);
                stop = true;
            }
        }
    }

    // Make some trees
    for (let i = 0; i < treeCount; i++) {
        stop = false;
        tries = 200;
        while (!stop && tries-- > 0) {
            const r = Math.random();
            let treeType;
            if (r > 0.3) {
                treeType = GreenTree;
            } else if (r > 0.2) {
                treeType = ThinTree;
            } else {
                treeType = PinkTree;
            }
            x = 100 + Math.random() * (boundaryX - 300);
            y = 100 + ((boundaryY - 300) / treeCount * (i + 1));
            // Make sure they're not blocking the starting area
            if ((x < (boundaryX / 2 - 100) || x > (boundaryX / 2 + 100)) &&
                (y < (boundaryY / 2 - 100) || y > (boundaryY / 2 + 100))) {
                world.entities.add(new treeType(x,y));
                stop = true;
            }
        }
    }

    Pathfinding.initialiseNavGrid(world);
} // End of init

// Main processing method
function update() {
    // Move mobiles
    world.entities.each(function (entity) {
        if (entity.update) {
            entity.update();
        }
    });

    // Re-sync camera to player
    camera.x = player.x;
    camera.y = player.y;
}

// Main drawing method
function draw() {
    // CLEAR canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    // Move viewport to player location
    context.translate(-camera.leftEdge(), -camera.topEdge());
    // Draw the map
    context.save();
    context.fillStyle=grassPattern;
    context.fillRect(0, 0, boundaryX, boundaryY);
    context.strokeStyle = '#000';
    context.strokeRect(0, 0, boundaryX, boundaryY);
    context.restore();

    // Draw entities
    let drawn = 0;

    world.entities.each(function (entity) {
        entity.draw(context);
        drawn++;
        if (debug.enabled)
            debug.drawObjectBorders(entity);
    });

    // Draw borders
    if (debug.enabled)
        debug.drawNavGrid();

    context.restore();
    // Draw score
    context.font="10px Arial";
    drawText("Score: " + score, 2, 10);
    if (debug.enabled) {
        debug.entityCount = world.entities.count;
        debug.drawnEntityCount = drawn;
        debug.drawDebugInfo();
    }

    frames++;
} // end draw

// Draw white text with a black border
function drawText(text, x, y) {
    context.fillStyle = '#000';
    context.fillText(text, x-1, y-1);
    context.fillText(text, x+1, y+1);
    context.fillText(text, x+1, y-1);
    context.fillText(text, x-1, y+1);
    context.fillStyle = '#fff';
    context.fillText(text, x, y);
}

function startGame() {
    console.log("*** startGame called");
    if (!imagesReady) {
        console.log("Images not ready...");
        return;
    } else if (!documentReady) {
        console.log("Document not ready...");
        return;
    }
    // This should go somewhere else maybe
    grassPattern=context.createPattern(images.grass, 'repeat');

    // Start for real
    init();

    const mainloop = function() {
        update();
        draw();
    };
    const animationFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        null ;

    if (animationFrame !== null) {
        const recurse = function() {
            mainloop();
            animationFrame(recurse, canvas);
        };

        // start the mainloop
        console.log("*** Beginning Main Loop...");
        animationFrame(recurse);
    }
    else {
        alert("Suboptimal browser");
        setInterval(mainloop,  1000.0 / 60.0);
    }
}
