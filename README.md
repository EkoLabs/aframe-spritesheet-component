# This repo is no longer actively maintained #

## A-Frame Spritesheet Component

<img src="https://ekolabs.github.io/aframe-spritesheet-component/aframe_spritesheet.gif">

Animated spritesheet support for [A-Frame](https://aframe.io).

### Demo / Using spritesheets

Spritesheets are a common way to play pre-rendered animation. This component allows you to load up a spritesheet image to an `a-image` element and easily control its animation. It allows usage of two types of spritesheet formats:

**[Rows and Cols](https://ekolabs.github.io/aframe-spritesheet-component/examples/rowscols/)**

A grid representing all frames of the animation. All of the frames must be of the same dimensions, and the animation index is assumed to be scanned left to right, top to bottom. If your last frame is not the one on the bottom right, you'll have to specify the index of the last frame using the `lastFrame` property.

**[JSON data format](https://ekolabs.github.io/aframe-spritesheet-component/examples/json/)**

The spritesheet image file can be made more compact by using a dictionary automatically generated with  [TexturePacker](https://www.codeandweb.com/texturepacker). This will help reduce file size.

#### Browser

Install and use by directly including the [browser files](dist):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/0.5.0/aframe.min.js"></script>
  <script src="https://unpkg.com/aframe-spritesheet-component/dist/aframe-spritesheet-component.min.js"></script>
</head>

<body>
  <a-scene>
    <!-- rows/cols format-->
    <a-image src="spritesheet.png" sprite-sheet="cols:8; rows: 3; progress: 0;"></a-image>
    <!-- json format -->
    <a-image src="spritesheet.png" sprite-sheet="dataUrl: spritesheet.json; progress: 0;" ></a-image>
  </a-scene>
</body>
```

<!-- If component is accepted to the Registry, uncomment this. -->
<!--
Or with [angle](https://npmjs.com/package/angle/), you can install the proper
version of the component straight into your HTML file, respective to your
version of A-Frame:

```sh
angle install aframe-spritesheet-component
```
-->

#### npm

Install via npm:

```bash
npm install @ekolabs/aframe-spritesheet-component
```

Then require and use.

```js
require('aframe');
require('aframe-spritesheet-component');
```

### API

| Property | Description | Default Value |
| -------- | ----------- | ------------- |
| progress | A value between 0 and 1 that represents animation progression. the index of the animation frame is calculated from this attribute. Used if no frameIndex or frameName specified | 0 |
| frameIndex | Explicit index of the animation frame to use. Used if no frameName specified | null |
| frameName | Explicit name of the animation frame to use, if using dataUrl | null |
| cols | number of cols in the spritesheet image (not needed if using dataUrl)| 1 |
| rows | number of rows spritesheet image (not needed if using dataUrl) | 1 |
| firstFrame| index of the first frame of the animation, ordered left to right starting at the first row | 0 |
| lastFrame| index of the last frame of the animation, ordered left to right starting at the first row . If not specified and not using the JSON format, value is `rows * cols - 1`| null |
| cloneTexture | if using separate instances of the same image, set this to true | false |
| dataUrl | If using a JSON format, url pointing to the json file| null |


### Acknowledgment
Walking pig sprite taken from <a href="http://www.glitchthegame.com">glitchthegame.com</a>, under a Public Domain Dedication license.

Interesting bit of Trivia: [Tiny Speck](https://tinyspeck.com/), the company behind the now-defunct Glitch game is now actually [Slack](https://slack.com)!

### Author
Developed by [Opher Vishnia](http://twitter.com/opherv) of [Eko](http://www.helloeko.com)

### License
Apache 2
