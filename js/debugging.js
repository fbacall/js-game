const debug = {
    enabled: false,
    drawObjectBorders: function (object) {
        // Image box
        context.strokeStyle = 'black';
        context.strokeRect(object.leftEdge(), object.topEdge(), object.width, object.height);
        // Collision box. Edge will appear red if colliding
        if (object.colliding) {
            // Top
            context.beginPath();
            context.lineWidth = "1";
            context.moveTo(object.leftBoundary(), object.topBoundary());
            context.strokeStyle = (object.colliding[Y] !== null ? "red" : "#0f0");
            context.lineTo(object.rightBoundary(), object.topBoundary());
            context.stroke();

            // Right
            context.beginPath();
            context.lineWidth = "1";
            context.moveTo(object.rightBoundary(), object.topBoundary());
            context.strokeStyle = (object.colliding[X] !== null ? "red" : "#0f0");
            context.lineTo(object.rightBoundary(), object.bottomBoundary());
            context.stroke();

            // Bottom
            context.beginPath();
            context.lineWidth = "1";
            context.moveTo(object.rightBoundary(), object.bottomBoundary());
            context.strokeStyle = (object.colliding[Y] !== null ? "red" : "#0f0");
            context.lineTo(object.leftBoundary(), object.bottomBoundary());
            context.stroke();

            // Left
            context.beginPath();
            context.lineWidth = "1";
            context.moveTo(object.leftBoundary(), object.bottomBoundary());
            context.strokeStyle = (object.colliding[X] !== null ? "red" : "#0f0");
            context.lineTo(object.leftBoundary(), object.topBoundary());
            context.stroke();
        }
        else {
            context.strokeStyle = 'red';
            context.strokeRect(object.leftBoundary(), object.topBoundary(),
                object.boundaryRight + object.boundaryLeft, object.boundaryBottom + object.boundaryTop);
        }
    },

    drawPath: function (path, red, green, blue) {

        for (let i = 0; i < path.length; i++) {
            const s = Math.ceil(i / path.length * 255);
            r = red ? red : s;
            g = green ? green : s;
            b = blue ? blue : s;

            context.fillStyle = "rgb("+r+","+g+","+b+")";
            context.fillRect(path[i][X] - (Pathfinding.navGridResolution / 2),
                path[i][Y] - (Pathfinding.navGridResolution / 2),
                Pathfinding.navGridResolution, Pathfinding.navGridResolution);
        }
    },

    drawNavGrid: function () {
        // Overlay navGrid
        if (debug.enabled) {
            context.save();
            context.globalAlpha=0.4;
            // Draw grid
            context.lineWidth="1";
            context.strokeStyle = '#000000';
            context.beginPath();
            for (let i = 0; i < Pathfinding.navGridWidth; i++) {
                context.moveTo(i * Pathfinding.navGridResolution, 0);
                context.lineTo(i * Pathfinding.navGridResolution, boundaryY);
            }
            for (let j = 0; j < Pathfinding.navGridHeight; j++) {
                context.moveTo(0, j * Pathfinding.navGridResolution);
                context.lineTo(boundaryX, j * Pathfinding.navGridResolution);
            }
            context.stroke();
            // Show blocked boxes
            context.fillStyle = "#ff0000";
            for (let i = 0; i < Pathfinding.navGridWidth; i++)
                for (let j = 0; j < Pathfinding.navGridHeight; j++)
                    if (Pathfinding.navGrid[i][j].blocked)
                        context.fillRect(i * Pathfinding.navGridResolution, j * Pathfinding.navGridResolution, Pathfinding.navGridResolution, Pathfinding.navGridResolution);

            context.restore();
        }
    },

    drawDebugInfo: function () {
        context.font="10px Arial";
        drawText("FPS: " + debug.fps, 10, 72);
        drawText("Visible entities: " + debug.drawnEntityCount + "/" + debug.entityCount, 10, 84);
        drawText("Player position: (" + player.x + ", " + player.y + ")", 10, 96);
        drawText("Map size: " + boundaryX + "x" + boundaryY, 10, 108);
    }
};
