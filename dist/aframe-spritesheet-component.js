/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * A-Frame Spritesheet Component component for A-Frame.
 */
var SpriteSheet = AFRAME.registerComponent('sprite-sheet', {
    schema: {
        progress: { type: 'number', default: 0 },
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
    init: function init() {
        var _this = this;

        // if specified load spritesheet json data
        if (this.data.dataUrl) {
            this.mapCanvas = document.createElement('canvas');
            this.textureCtx = this.mapCanvas.getContext('2d');
            this.texture = new THREE.Texture(this.mapCanvas);
            this.getSpriteSheetData(this.data.dataUrl);

            // callback for when the image has loaded
            this.el.addEventListener('materialtextureloaded', function () {
                _this.imageLoaded = true;

                // save reference to the original image
                _this.spriteSheetImage = _this.el.object3D.children[0].material.map.image;
                _this.texture = new THREE.Texture(_this.mapCanvas);
                _this.el.object3D.children[0].material.map = _this.texture;
            });
        } else {
            // use rows and cols
            this.numFrames = this.data.rows * this.data.cols;

            // callback for when the image has loaded
            this.el.addEventListener('materialtextureloaded', function () {
                _this.imageLoaded = true;
                // useful if animating multiple sprites
                if (_this.data.cloneTexture) {
                    _this.el.object3D.children[0].material.map = _this.el.object3D.children[0].material.map.clone();
                    _this.el.object3D.children[0].material.map.needsUpdate = true;
                }
                _this.texture = _this.el.object3D.children[0].material.map;

                _this.texture.wrapS = _this.texture.wrapT = THREE.RepeatWrapping;

                // set size of one sprite
                _this.texture.repeat.set(_this.texture.image.width / _this.data.cols / _this.texture.image.width, _this.texture.image.height / _this.data.rows / _this.texture.image.height);
                _this.update();
            });
        }

        this.currentFrame = 0;
    },

    /**
     * Called when component is attached and when component data changes.
     */
    update: function update() {
        // no actual animation
        if (!this.framesData && this.data.firstFrame == this.data.lastFrame) return;

        // if no last frame is specified use the number of availble frames
        var lastFrame = this.data.lastFrame ? this.data.lastFrame : this.numFrames - 1;

        this.currentFrame = Math.round(this.data.progress * (lastFrame - this.data.firstFrame)) + this.data.firstFrame;
        this.adjustTexture(this.currentFrame);
    },

    /**
     * Called when a component is removed (e.g., via removeAttribute).
     */
    remove: function remove() {
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
    getSpriteSheetData: function getSpriteSheetData(url) {
        var _this2 = this;

        var assetsEl = document.querySelector('a-assets');
        if (assetsEl) {
            assetsEl.fileLoader.load(url, function (data) {
                _this2.spriteSheetData = JSON.parse(data);
                _this2.framesData = Object.keys(_this2.spriteSheetData.frames).map(function (key) {
                    return _this2.spriteSheetData.frames[key];
                });
                _this2.numFrames = _this2.framesData.length;

                _this2.frameWidth = _this2.framesData[0].sourceSize.w;
                _this2.frameHeight = _this2.framesData[0].sourceSize.h;

                _this2.mapCanvas.width = pow2ceil(_this2.frameWidth);
                _this2.mapCanvas.height = pow2ceil(_this2.frameHeight);

                _this2.texture.repeat.set(_this2.frameWidth / _this2.mapCanvas.width, _this2.frameHeight / _this2.mapCanvas.height);

                _this2.texture.offset.x = 0;
                _this2.texture.offset.y = 1 - _this2.frameHeight / _this2.mapCanvas.height;
            });
        } else {
            console.warn('Can\'t load spritesheet URL. No a-assets element present on the A-Scene!');
        }
    },

    /**
     * Adjust the texture to a specific frame index
     * @param {number} frameNum
     */
    adjustTexture: function adjustTexture(frameNum) {
        // image hasn't loaded, can't draw anything
        if (!this.imageLoaded) return;

        // no need to draw the same frame twice
        if (this.lastDrawnFrame == frameNum) return;

        // if using spritesheet json
        if (this.framesData) {
            this.adjustFrameBySpriteSheet(frameNum);
        } else {
            this.adjustFrameByRowsCols(frameNum);
        }

        this.lastDrawnFrame = frameNum;
    },

    /**
     * Adjust the spritesheet texture to a certain frame on a row/col grid image
     * @param {number} frameNum
     */
    adjustFrameByRowsCols: function adjustFrameByRowsCols(frameNum) {
        this.texture.offset.x = frameNum % this.data.cols / this.data.cols;
        this.texture.offset.y = -1 / this.data.rows - Math.floor(frameNum / this.data.cols) / this.data.rows;
    },

    /**
     * Adjust the spritesheet texture to a certain frame on a TexturePacker JSON spritesheet
     * @param {number} frameNum
     */
    adjustFrameBySpriteSheet: function adjustFrameBySpriteSheet(frameNum) {
        var frameData = this.framesData[frameNum];

        this.textureCtx.clearRect(0, 0, this.mapCanvas.width, this.mapCanvas.height);
        this.textureCtx.save();
        if (frameData.rotated) {

            // drawing is rotated, so axes are rotated
            var drawData = {
                dX: this.frameHeight - (frameData.frame.h + frameData.spriteSourceSize.y),
                dY: frameData.spriteSourceSize.x,
                width: frameData.frame.h,
                height: frameData.frame.w
            };

            this.textureCtx.rotate(-90 * Math.PI / 180);
            this.textureCtx.translate(-this.frameHeight, 0);

            this.textureCtx.drawImage(this.spriteSheetImage, frameData.frame.x, frameData.frame.y, frameData.frame.h, frameData.frame.w, drawData.dX, drawData.dY, drawData.width, drawData.height);
        } else {
            var _drawData = {
                dX: this.frameWidth / 2 + (frameData.spriteSourceSize.x - frameData.sourceSize.w / 2),
                dY: this.frameHeight / 2 + (frameData.spriteSourceSize.y - frameData.sourceSize.h / 2),
                width: frameData.frame.w,
                height: frameData.frame.h
            };

            this.textureCtx.drawImage(this.spriteSheetImage, frameData.frame.x, frameData.frame.y, frameData.frame.w, frameData.frame.h, _drawData.dX, _drawData.dY, _drawData.width, _drawData.height);
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
    var p = 2;
    while (number >>= 1) {
        p <<= 1;
    }
    return p;
}

module.exports = SpriteSheet;

/***/ })
/******/ ]);