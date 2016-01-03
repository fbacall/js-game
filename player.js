var playerSprite = new Sprite(
    images.player, 32, 48,
    {
        top:    [[0,3],[1,3],[0,3],[3,3]],
        right:  [[0,2],[1,2],[0,2],[3,2]],
        bottom: [[0,0],[1,0],[0,0],[3,0]],
        left:   [[0,1],[1,1],[0,1],[3,1]]
    },
    'bottom'
);

function Player(x, y) {
    MobileEntity.call(this, playerSprite, x, y, 20,10,22,10, settings.acceleration, settings.playerMaxSpeed
    );
}

extend(MobileEntity, Player);

Player.prototype.updateAnimation = MobileEntity.prototype.directionalAnimation;

Player.prototype.handleCollision = function (other, direction) {
    if (other.solid) {
        if (direction == X)
            this.velocity[X] = 0;
        else
            this.velocity[Y] = 0;
    }
};
