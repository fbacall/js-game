var frames = 0;
var debug = {enabled: false};
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
    knife: "img/knife.png"
};

var images = {};

// Game globals
var canvas, context, player, camera, score, knives, world, grassPattern, settings = {};

$(document).ready(function() {
    // Load all images
    var loadedImageCount = 0;

    for (var i = 0; i < Object.keys(imageUrls).length; i++) {
        var key = Object.keys(imageUrls)[i];
        var imageObject = new Image();
        imageObject.onload = function () {
            console.log("Loading image: " + (loadedImageCount+1));
            if (++loadedImageCount == Object.keys(imageUrls).length)
                startGame();
        };

        imageObject.onerror = function () {
          console.log("Failed to load image: " + this.src);
        };

        imageObject.src = imageUrls[key];
        images[key] = imageObject;
    }

    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");

    $('#applySettings').click(function () { init(); });
    $('#settingsToggle').click(function () {$('#settings').toggle();});

    // Debugging
    $('#debugToggle').click(function () {
        $('#debugToggle').toggleClass('enabled');
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
    $(window).keydown(function(event) {
        if (event.which == 87) {//W up
            event.preventDefault();
            player.acceleration = [player.acceleration[X], -1];
        }
        else if (event.which == 83) {//S down
            event.preventDefault();
            player.acceleration = [player.acceleration[X], 1];
        }
        else if (event.which == 65) {//A left
            event.preventDefault();
            player.acceleration = [-1, player.acceleration[Y]];
        }
        else if (event.which == 68) {//D right
            event.preventDefault();
            player.acceleration = [1, player.acceleration[Y]];
        }
    });

    $(window).keyup(function(event) {
        if (event.which == 87) {//w
            event.preventDefault();
            if(player.acceleration[Y] < 0)
                player.acceleration[Y] = 0;
        }
        else if (event.which == 83) {//s
            event.preventDefault();
            if(player.acceleration[Y] > 0)
                player.acceleration[Y] = 0;
        }
        else if (event.which == 65) {//a
            event.preventDefault();
            if(player.acceleration[X] < 0)
                player.acceleration[X] = 0;
        }
        else if (event.which == 68) {//d
            event.preventDefault();
            if(player.acceleration[X] > 0)
                player.acceleration[X] = 0;
        }
    });

    // Throw knife
    $(canvas).click(function (event) {
        event.preventDefault();
        var x = (event.pageX - canvas.offsetLeft) + camera.leftEdge() - player.x;
        var y = (event.pageY - canvas.offsetTop) + camera.topEdge() - player.y;
        var vector = normalise([x,y],15);
        if (knives > 0) {
            // Turn player to face
            if (abs(x) > abs(y)) {
                if (x > 0)
                    player.animation = 'right';
                else
                    player.animation = 'left';
            }
            else {
                if (y > 0)
                    player.animation = 'bottom';
                else
                    player.animation = 'top';
            }
            // Spawn knife
            console.log(player.x, player.y, x, y);
            makeKnife(player.x, player.y, vector);
            knives--;
        }


        //var x = (event.pageX - canvas.offsetLeft) + camera.leftEdge();
        //var y = (event.pageY - canvas.offsetTop) + camera.topEdge();
        //console.log(Math.floor(x / navGridResolution));
        //PATHTEST = aStar(navGrid[Math.floor(player.x / navGridResolution)][Math.floor(player.y / navGridResolution)],
        //    navGrid[Math.floor(x / navGridResolution)][Math.floor(y / navGridResolution)]);
    });
});//ready

    // Initialize the game
    function init() {
        console.log("*** init called");

        world = new World();
        boundaryX = parseFloat($('#cBoundaryX').val());
        boundaryY = parseFloat($('#cBoundaryY').val());
        treeCount = parseInt($('#cTreeCount').val());
        appleCount = parseInt($('#cAppleCount').val());
        settings.playerMaxSpeed = parseFloat($('#cMaxSpeed').val());
        settings.playerAcceleration = parseFloat($('#cPlayerAcceleration').val());
        friction = parseFloat($('#cFriction').val());
        enemyCount = parseInt($('#cEnemyCount').val());

        knives = 20;
        score = 0;

        player = new Player(images.player, (boundaryX / 2), (boundaryY / 2));

        // Place some flowers
        var flowerCount = Math.ceil(boundaryX * boundaryY / 50000);
        for(i = 0; i < flowerCount; i++) {
            obj = Math.random() > 0.5 ? images.flower1 : images.flower2;
            x = obj.width + Math.random() * (boundaryX - 2*obj.width);
            y = obj.height + Math.random() * (boundaryY - 2*obj.height);
            var flowerEntity = new Entity(obj, x, y);
            world.entities.add(flowerEntity);
        }

        var enemySprite = new Sprite(
            images.enemy, 32, 48,
            {
                top:    [[0,3],[1,3],[0,3],[3,3]],
                right:  [[0,2],[1,2],[0,2],[3,2]],
                bottom: [[0,0],[1,0],[0,0],[3,0]],
                left:   [[0,1],[1,1],[0,1],[3,1]]
            }, 'bottom'
        );

        for(var i = 0; i < enemyCount; i++)
            world.entities.add(new Enemy(enemySprite, 20 + Math.random() * 1000, 20 + Math.random()*20));

        // Camera
        camera = new Box(player.x, player.y, canvas.width, canvas.height);

        var i, x, y, stop, tries;


        // Place player
        world.entities.add(player);

        // Place Apples
        var apple = images.apple;
        for(i = 0; i < appleCount; i++) {
            stop = false;
            tries = 200;
            while(!stop && tries-- > 0) {
                x = apple.width + Math.random() * (boundaryX - 2*apple.width);
                y = apple.height + Math.random() * (boundaryY - 2*apple.height);
                // Make sure they're not blocking the starting area
                if((x < (boundaryX / 2 - 100) || x > (boundaryX / 2 + 100)) &&
                    (y < (boundaryY / 2 - 100) || y > (boundaryY / 2 + 100))) {
                    var a = new Entity(apple, x,y, 10,10,10,10, false);
                    a.handleCollision = function (other) {
                        if (other == player) {
                            world.entities.remove(this);
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
        for(i = 0; i < treeCount; i++) {
            stop = false;
            tries = 200;
            while(!stop && tries-- > 0) {
                var r = Math.random();
                var obj, b1,b2,b3,b4;
                if(r > 0.3) {
                    obj = images.tree1;
                    b1 = 1; b2 = 14; b3 = 78; b4 = 10;
                } else if(r > 0.2) {
                    obj = images.tree2;
                    b1 = 1; b2 = 9; b3 = 55; b4 = 5;
                } else {
                    obj = images.tree3;
                    b1 = 10; b2 = 15; b3 = 50; b4 = 15;
                }
                x = obj.width + Math.random() * (boundaryX - 2*obj.width);
                y = obj.height + ((boundaryY - 2*obj.height) / treeCount * (i + 1));
                // Make sure they're not blocking the starting area
                if((x < (boundaryX / 2 - 100) || x > (boundaryX / 2 + 100)) &&
                    (y < (boundaryY / 2 - 100) || y > (boundaryY / 2 + 100))) {
                    var treeEntity = new Entity(obj, x,y, b1,b2,b3,b4, true);
                    world.entities.add(treeEntity);
                    stop = true;
                }
            }
        }

        Pathfinding.initialiseNavGrid(world);
    } // End of init

    function makeKnife(x,y, velocity) {
        var k = new MobileEntity(new Sprite(images.knife, 16, 16,
                { spin: [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0]] }, 'spin'),
            x,y,8,8,8,8, 5, 20);
        k.frame = Math.ceil(Math.random() * 7);
        k.updateAnimation = function (){
            if (this.velocity[X] == 0 && this.velocity[Y] == 0)
                this.pause = true;
            else
                this.frameskip = Math.ceil(5 / this.speed());
        };
        k.handleCollision = function (other, direction) {
            if (other == player && this.speed() == 0) {
                knives++;
                world.entities.remove(this); // Remove me
            }
            else if (other.solid) {
                if (direction == X) {
                    this.velocity[X] = -this.velocity[X] / 1.5;
                    this.velocity[Y] = this.velocity[Y] / 1.5;
                }
                else {
                    this.velocity[X] = this.velocity[X] / 1.5;
                    this.velocity[Y] = -this.velocity[Y] / 1.5;
                }
            }
            if (other instanceof Enemy && this.speed() > 0) {
                // Knock enemy back
                other.velocity[X] += this.velocity[X];
                other.velocity[Y] += this.velocity[Y];
            }
        };
        k.velocity = velocity;
        world.entities.add(k);
    }

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

        // Draw enemy path
        //if (debug.enabled) {
        //    drawPath(enemy.path, 255);
        //}

        // Draw entities
        var drawn = 0;

        world.entities.each(function (entity) {
            entity.draw(context);
            drawn++;
            if (debug.enabled)
                drawObjectBorders(entity);
        });

        // Draw borders
        if (debug.enabled)
            drawNavGrid();

        context.restore();
        // Draw score
        context.font="20px Arial";
        drawText("Score: " + score, 10, 30);
        drawText("Knives: " + knives,10,50);
        if (debug.enabled) {
            debug.entityCount = world.entities.count;
            debug.drawnEntityCount = drawn;
            drawDebugInfo();
        }

        frames++;
    } // end draw

    function drawObjectBorders(object) {
        // Image box
        context.strokeStyle = 'black';
        context.strokeRect(object.leftEdge(), object.topEdge(), object.width, object.height);
        // Collision box. Edge will appear red if colliding
        if (object.colliding) {
            // Top
            context.beginPath();
            context.lineWidth="1";
            context.moveTo(object.leftBoundary(), object.topBoundary());
            context.strokeStyle=(object.colliding[Y] != null ? "red" : "#0f0");
            context.lineTo(object.rightBoundary(), object.topBoundary());
            context.stroke();

            // Right
            context.beginPath();
            context.lineWidth="1";
            context.moveTo(object.rightBoundary(), object.topBoundary());
            context.strokeStyle=(object.colliding[X] != null ? "red" : "#0f0");
            context.lineTo(object.rightBoundary(), object.bottomBoundary());
            context.stroke();

            // Bottom
            context.beginPath();
            context.lineWidth="1";
            context.moveTo(object.rightBoundary(), object.bottomBoundary());
            context.strokeStyle=(object.colliding[Y] != null ? "red" : "#0f0");
            context.lineTo(object.leftBoundary(),  object.bottomBoundary());
            context.stroke();

            // Left
            context.beginPath();
            context.lineWidth="1";
            context.moveTo(object.leftBoundary(), object.bottomBoundary());
            context.strokeStyle=(object.colliding[X] != null ? "red" : "#0f0");
            context.lineTo(object.leftBoundary(), object.topBoundary());
            context.stroke();
        }
        else {
            context.strokeStyle = 'red';
            context.strokeRect(object.leftBoundary(), object.topBoundary(),
                    object.boundaryRight + object.boundaryLeft, object.boundaryBottom + object.boundaryTop);
        }
    }

    function drawPath(path, red, green, blue) {

        for (var i = 0; i < path.length; i++) {
            var s = Math.ceil(i / path.length * 255);
            r = red ? red : s;
            g = green ? green : s;
            b = blue ? blue : s;

            context.fillStyle = "rgb("+r+","+g+","+b+")";
            context.fillRect(path[i][X] - (Pathfinding.navGridResolution / 2),
                             path[i][Y] - (Pathfinding.navGridResolution / 2),
                             Pathfinding.navGridResolution, Pathfinding.navGridResolution);
        }
    }

    function drawNavGrid() {
        // Overlay navGrid
        if (debug.enabled) {
            context.save();
            context.globalAlpha=0.4;
            // Draw grid
            context.lineWidth="1";
            context.strokeStyle = '#000000';
            context.beginPath();
            for (var i = 0; i < Pathfinding.navGridWidth; i++) {
                context.moveTo(i * Pathfinding.navGridResolution, 0);
                context.lineTo(i * Pathfinding.navGridResolution, boundaryY);
            }
            for (var j = 0; j < Pathfinding.navGridHeight; j++) {
                context.moveTo(0, j * Pathfinding.navGridResolution);
                context.lineTo(boundaryX, j * Pathfinding.navGridResolution);
            }
            context.stroke();
            // Show blocked boxes
            context.fillStyle = "#ff0000";
            for (var i = 0; i < Pathfinding.navGridWidth; i++)
                for (var j = 0; j < Pathfinding.navGridHeight; j++)
                    if (Pathfinding.navGrid[i][j].blocked)
                        context.fillRect(i * Pathfinding.navGridResolution, j * Pathfinding.navGridResolution, Pathfinding.navGridResolution, Pathfinding.navGridResolution);

            context.restore();
        }
    }

    function drawDebugInfo() {
        context.font="10px Arial";
        drawText("FPS: " + debug.fps, 10, 72);
        drawText("Visible entities: " + debug.drawnEntityCount + "/" + debug.entityCount, 10, 84);
        drawText("Player position: (" + player.x + ", " + player.y + ")", 10, 96);
        drawText("Map size: " + boundaryX + "x" + boundaryY, 10, 108);
    }

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
        // This should go somewhere else maybe
        grassPattern=context.createPattern(images.grass, 'repeat');

        // Start for real
        init();

        var mainloop = function() {
            update();
            draw();
        };
        var animationFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null ;

        if (animationFrame !== null) {
            var recurse = function() {
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


