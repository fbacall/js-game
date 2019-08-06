class Sprite {
    constructor (image, width, height, animations, initialAnim) {
        this.image = image;
        this.width = width;
        this.height = height;
        /**
         { top: [[0,0],[1,0],[2,0]]
       right: [[0,1],[1,1],[2,1]] etc.
         **/
        this.animations = animations || [];
        this.initialAnim = initialAnim;
    }

    draw (context, animation, frame, x, y) {
        // Clip the correct frame from the sprite sheet and display
        context.drawImage(this.image,
            (this.width * this.animations[animation][frame][0]),
            (this.height * this.animations[animation][frame][1]),
            this.width, this.height, x, y, this.width, this.height);
    }
}
