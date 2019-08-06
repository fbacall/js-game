class PathNode {
    constructor (x, y, blocked) {
        this.x = x;
        this.y = y;
        this.blocked = blocked || false;
    }

    neighbours () {
        const array = [];
        for (let i = ((this.x > 0) ? this.x - 1 : this.x);
             i <= ((this.x < (Pathfinding.navGridWidth - 1)) ? this.x + 1 : this.x);
             i++) {
            for (let j = ((this.y > 0) ? this.y - 1 : this.y);
                 j <= ((this.y < (Pathfinding.navGridHeight - 1)) ? this.y + 1 : this.y);
                 j++) {
                if (this !== Pathfinding.navGrid[i][j])
                    array.push(Pathfinding.navGrid[i][j]);
            }
        }
        return array;
    }
}

const Pathfinding = {
    navGridResolution: 32,
    navGrid: [],

    initialiseNavGrid : function (world) {
        Pathfinding.navGridWidth = Math.ceil(boundaryX / Pathfinding.navGridResolution);
        Pathfinding.navGridHeight = Math.ceil(boundaryY / Pathfinding.navGridResolution);

        // Build graph of nodes
        for (let i = 0; i < Pathfinding.navGridWidth; i++) {
            Pathfinding.navGrid[i] = [];
            for (let j = 0; j < Pathfinding.navGridHeight; j++) {
                Pathfinding.navGrid[i][j] = new PathNode(i, j, false);
            }
        }

        // Determine which nodes are blocked based on the entities
        world.entities.each(function (entity) {
            Pathfinding.blockNodes(entity);
        });
    },

    // Blocks off nodes from the navGrid according to the collision box of a given entity
    blockNodes : function (entity) {
        const startX = Math.floor(entity.leftBoundary() / Pathfinding.navGridResolution);
        const endX = Math.floor(entity.rightBoundary() / Pathfinding.navGridResolution);
        const startY = Math.floor(entity.topBoundary() / Pathfinding.navGridResolution);
        const endY = Math.floor(entity.bottomBoundary() / Pathfinding.navGridResolution);
        for (let i = startX; i <= endX; i++)
            for (let j = startY; j <= endY; j++)
                Pathfinding.navGrid[i][j].blocked = entity.solid;
    },

    aStar: function (startCoords, goalCoords) {
        let start = Pathfinding.toNavGridNode(startCoords[0], startCoords[1]);
        let goal = Pathfinding.toNavGridNode(goalCoords[0], goalCoords[1]);

        // Find closest node if blocked
        if (start.blocked)
            start = Pathfinding.toClosestOpenNavGridNode(startCoords[0], startCoords[1]);
        if (goal.blocked)
            goal = Pathfinding.toClosestOpenNavGridNode(goalCoords[0], goalCoords[1]);

        // Reset grid
        for (let i = 0; i < Pathfinding.navGridWidth; i++) {
            for (let j = 0; j < Pathfinding.navGridHeight; j++) {
                Pathfinding.navGrid[i][j].gScore = 0;
                Pathfinding.navGrid[i][j].fScore = 0;
                Pathfinding.navGrid[i][j].parent = null;
            }
        }

        const closed = [];
        const open = [start];
        let current = start;
        current.fScore = magnitude([current.x - goal.x, current.y - goal.y]);

        while (open.length > 0) {
            // Find node in open set with lowest F value
            current = open[0];
            for (let i = 0; i < open.length;i++)
                if (open[i].fScore < current.fScore)
                    current = open[i];

            if (current.x === goal.x && current.y === goal.y) {
                // Reverse the path and return
                let c = current;
                let path = [];
                let tries = 0; // Incase something goes wrong and we get stuck in a loop
                while (c.parent && ++tries < 1000) {
                    path.push(Pathfinding.toMapCoords(c));
                    c = c.parent;
                }

                if (tries === 1000) {
                    alert("Can't pathfind!!!1");
                    Pathfinding.DEBUG_PATH = path;
                }
                path.push(Pathfinding.toMapCoords(c));
                return path.reverse();
            }

            open.splice(open.indexOf(current), 1);
            closed.push(current);

            const neighbours = current.neighbours();
            for (let i = 0; i < neighbours.length; i++) {
                const neighbour = neighbours[i];
                const gScore = current.gScore + magnitude([current.x - neighbour.x, current.y - neighbour.y]);

                // Ignore this node if its in the closed list, or its impassable
                if (closed.indexOf(neighbour) !== -1 || neighbour.blocked)
                    continue;

                // If the node isn't in the open list or it is, but with a higher g score than the one we just calculated...
                if (open.indexOf(neighbour) === -1 || gScore < neighbour.gScore) {
                    neighbour.parent = current;
                    neighbour.gScore = gScore;
                    neighbour.fScore = gScore + magnitude([neighbour.x - goal.x, neighbour.y - goal.y]);

                    if (open.indexOf(neighbour) === -1) {
                        open.push(neighbour);
                    }
                }
            }
        }
        return [];
    },

    toMapCoords : function(node) {
        return [node.x * Pathfinding.navGridResolution + (Pathfinding.navGridResolution / 2),
            node.y * Pathfinding.navGridResolution + (Pathfinding.navGridResolution / 2)];
    },
    toNavGridNode : function(x,y) {
        return Pathfinding.navGrid[Math.floor(x / Pathfinding.navGridResolution)][Math.floor(y / Pathfinding.navGridResolution)]
    },
    toClosestOpenNavGridNode : function(x,y) {
        const node = Pathfinding.toNavGridNode(x,y);
        let dist = 1;

        let bestNodeDist = null;
        let bestNode = null;

        while (!bestNode && dist < 20) {
            for (let xDiff = -dist; xDiff <= dist; xDiff++) {
                for (let yDiff = -dist; yDiff <= dist; yDiff++) {
                    const newX = node.x + xDiff;
                    const newY =  node.y + yDiff;
                    if (Pathfinding.navGrid[newX] && Pathfinding.navGrid[newX][newY]) {
                        const newNode = Pathfinding.navGrid[newX][newY];
                        const newNodeDist = Math.sqrt(newNode.x * newNode.x + newNode.y * newNode.y);
                        if (!newNode.blocked && (!bestNodeDist || (newNodeDist < bestNodeDist))) {
                            bestNode = newNode;
                            bestNodeDist = newNodeDist;
                        }
                    }
                }
            }
            dist += 1;
        }

        return bestNode;
    }
};
