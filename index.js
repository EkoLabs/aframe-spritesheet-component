
/**
 * A-Frame Spritesheet Component for A-Frame.
 * Enables dynamic control of animation spritesheets
 */
let SpriteSheet = AFRAME.registerComponent('sprite-sheet', {
    schema: {
        progress: { type: 'number', default: 0 },
        frameIndex: { type: 'number', default: null },
        frameName: { type: 'string', default: null },
        cols: { type: 'number', default: 1 },
        rows: { type: 'number', default: 1 },
        firstFrame: { type: 'number', default: 0 },
        lastFrame: { type: 'number', default: null },
        cloneTexture: { default: false },
        dataUrl: { type: 'string', default: null }
    },


    /**
     * Called once when component is attached.
     */
    init: function() {

        // if specified load spritesheet json data
        if (this.data.dataUrl) {
            this.mapCanvas = document.createElement( 'canvas' );
            this.textureCtx = this.mapCanvas.getContext( '2d' );
            this.texture = new THREE.Texture(this.mapCanvas);
            this.getSpriteSheetData(this.data.dataUrl);

            // callback for when the image has loaded
            this.el.addEventListener('materialtextureloaded', () => {
                this.imageLoaded = true;

                // save reference to the original image
                this.spriteSheetImage = this.el.object3D.children[0].material.map.image;
                this.texture = new THREE.Texture(this.mapCanvas);
                this.el.object3D.children[0].material.map = this.texture;
            });

        } else {
            // use rows and cols
            this.numFrames = this.data.rows * this.data.cols;

            // callback for when the image has loaded
            this.el.addEventListener('materialtextureloaded', () => {
                this.imageLoaded = true;
                // useful if animating multiple sprites
                if (this.data.cloneTexture) {
                    this.el.object3D.children[0].material.map = this.el.object3D.children[0].material.map.clone();
                    this.el.object3D.children[0].material.map.needsUpdate = true;
                }

                this.texture = this.el.object3D.children[0].material.map;
                this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping;

                // set size of one sprite
                this.texture.repeat.set(
                    this.texture.image.width / this.data.cols / this.texture.image.width,
                    this.texture.image.height / this.data.rows / this.texture.image.height
                );
                this.update();
            });

        }

        this.currentFrame = 0;
    },

    /**
     * Called when component is attached and when component data changes.
     */
    update: function() {
        // no actual animation
        if (!this.framesData && this.data.firstFrame == this.data.lastFrame) return;

        // if no last frame is specified use the number of available frames
        let lastFrame = this.data.lastFrame ? this.data.lastFrame : this.numFrames - 1;

        // decide current frame by this order: frame index (if specified), frame name (if specified), progress
        if (this.data.frameIndex){
            this.currentFrame = this.data.frameIndex;
        } else if (this.data.frameName && this.frameNameToIndex) {
            let frameIndex = this.frameNameToIndex[this.data.frameName];
            if (frameIndex != null)
                this.currentFrame = frameIndex;
            else
                console.warn(`Spritesheet error - No such frame with name ${this.data.frameName}`);
        } else {
            this.currentFrame = Math.round(this.data.progress * (lastFrame - this.data.firstFrame)) + this.data.firstFrame;
        }

        this.adjustTexture(this.currentFrame);
    },

    /**
     * Called when a component is removed (e.g., via removeAttribute).
     */
    remove: function() {
        // Cleanup
        this.mapCanvas = null;
        this.textureCtx = null;
        this.texture = null;
        this.spriteSheetImage = null;
        this.spriteSheetData = null;
        this.framesData = null;
    },

    /**
     * Load a TexturePacker JSON based spritesheet
     * Requires the A-Scene to have an 'a-assets' element present
     * @param {string} url
     */
    getSpriteSheetData: function(url) {
        let assetsEl = document.querySelector('a-assets');
        if (assetsEl) {
            assetsEl.fileLoader.load(url, data => {
                this.spriteSheetData = JSON.parse(data);
                this.framesData = Object.keys(this.spriteSheetData.frames).map(key => {
                    return this.spriteSheetData.frames[key];
                });

                // create a dictionary to map from keyframe names to frame number
                this.frameNameToIndex = {};
                Object.keys(this.spriteSheetData.frames).map((key, index) => {
                    this.frameNameToIndex[key] = index;
                });
                this.numFrames = this.framesData.length;

                this.frameWidth = this.framesData[0].sourceSize.w;
                this.frameHeight = this.framesData[0].sourceSize.h;

                this.mapCanvas.width = pow2ceil(this.frameWidth);
                this.mapCanvas.height = pow2ceil(this.frameHeight);

                this.texture.repeat.set(
                    this.frameWidth / this.mapCanvas.width,
                    this.frameHeight / this.mapCanvas.height
                );

                this.texture.offset.x = 0;
                this.texture.offset.y = 1 - this.frameHeight / this.mapCanvas.height;
            });
        } else{
            console.warn('Can\'t load spritesheet URL. No a-assets element present on the A-Scene!');
        }
    },

    /**
     * Adjust the texture to a specific frame index
     * @param {number} frameNum
     */
    adjustTexture: function(frameNum) {
        // image hasn't loaded, can't draw anything
        if (!this.imageLoaded) return;

        // no need to draw the same frame twice
        if (this.lastDrawnFrame == frameNum) return;

        // if using spritesheet json
        if (this.framesData) {
            this.adjustFrameBySpriteSheet(frameNum);
        } else{
            this.adjustFrameByRowsCols(frameNum);
        }

        this.lastDrawnFrame = frameNum;

    },

    /**
     * Adjust the spritesheet texture to a certain frame on a row/col grid image
     * @param {number} frameNum
     */
    adjustFrameByRowsCols: function(frameNum) {
        this.texture.offset.x = (frameNum % this.data.cols) / this.data.cols;
        this.texture.offset.y = - 1 / this.data.rows - Math.floor(frameNum / this.data.cols) / this.data.rows;
    },

    /**
     * Adjust the spritesheet texture to a certain frame on a TexturePacker JSON spritesheet
     * @param {number} frameNum
     */
    adjustFrameBySpriteSheet: function(frameNum) {
        let frameData = this.framesData[frameNum];

        this.textureCtx.clearRect(0, 0, this.mapCanvas.width, this.mapCanvas.height);
        this.textureCtx.save();
        if (frameData.rotated) {

            // drawing is rotated, so axes are rotated
            let drawData = {
                dX: this.frameHeight - (frameData.frame.h + frameData.spriteSourceSize.y),
                dY: frameData.spriteSourceSize.x,
                width: frameData.frame.h,
                height: frameData.frame.w
            };

            this.textureCtx.rotate(-90 * Math.PI / 180);
            this.textureCtx.translate(-this.frameHeight, 0);

            this.textureCtx.drawImage(this.spriteSheetImage,
                frameData.frame.x, frameData.frame.y, frameData.frame.h, frameData.frame.w,
                drawData.dX,
                drawData.dY,
                drawData.width,
                drawData.height
            );
        } else {
            let drawData = {
                dX: this.frameWidth/2 + (frameData.spriteSourceSize.x - frameData.sourceSize.w / 2),
                dY: this.frameHeight/2 + (frameData.spriteSourceSize.y - frameData.sourceSize.h / 2),
                width: frameData.frame.w,
                height: frameData.frame.h
            };

            this.textureCtx.drawImage(this.spriteSheetImage,
                frameData.frame.x, frameData.frame.y, frameData.frame.w, frameData.frame.h,
                drawData.dX,
                drawData.dY,
                drawData.width,
                drawData.height
            );
        }

        this.textureCtx.restore();
        this.texture.needsUpdate = true;
    }
});

/**
 * Returns the next highest number which is a power of 2
 * @param {number} number
 * @return {number}
 */
function pow2ceil(number) {
    number--;
    let p = 2;
    while (number >>= 1) {p <<= 1;}
    return p;
}

module.exports = SpriteSheet;
