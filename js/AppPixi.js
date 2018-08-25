'use strict';

const DIMENSION = {
  'width': 800,
  'height': 800,
};

let intro;
let indexSequence;
let currentSequence;
let changeMode = true;
const volumeMax = 0.47;
const seqData = [
  {
    'folder': './flower/',
    'prefix': 'flower',
    'count': 81,
    'alpha': 1.5,
    'rotation': 1,
    'taille': 13,
    'offset': 60,
    'scale': 0.3,
    'changeScale': 0.4,
  },
  {
    'folder': './flower2/',
    'prefix': 'flower',
    'count': 238,
    'alpha': 0.8,
    'rotation': 2,
    'taille': 12,
    'offset': 55,
    'scale': 0.4,
    'changeScale': 0.2,
  },
  {
    'folder': './flower3/',
    'prefix': 'flower',
    'count': 189,
    'alpha': 0.9,
    'rotation': 3,
    'taille': 11,
    'offset': 50,
    'scale': 0.3,
    'changeScale': 0.5,
  },
  {
    'folder': './flower4/',
    'prefix': 'flower',
    'count': 175,
    'alpha': 20,
    'rotation': 4,
    'taille': 10,
    'offset': 45,
    'scale': 0.6,
    'changeScale': 0.1,
  },
  {
    'folder': './flower5/',
    'prefix': 'flower',
    'count': 97,
    'alpha': 1.3,
    'rotation': 5,
    'taille': 9,
    'offset': 40,
    'scale': 0.3,
    'changeScale': 0.2,
  },
  {
    'folder': './flower6/',
    'prefix': 'flower_',
    'count': 207,
    'alpha': 3,
    'rotation': 6,
    'taille': 8,
    'offset': 35,
    'scale': 0.9,
    'changeScale': 0.3,
  },
  {
    'folder': './flower7/',
    'prefix': 'flower_',
    'count': 197,
    'alpha': 0.5,
    'rotation': 7,
    'taille': 7,
    'offset': 30,
    'scale': 1,
    'changeScale': 0.4,
  },
  {
    'folder': './flower8/',
    'prefix': 'flower_',
    'count': 92,
    'alpha': 4.8,
    'rotation': 8,
    'taille': 6,
    'offset': 25,
    'scale': 0.4,
    'changeScale': 0.1,
  },
  {
    'folder': './flower9/',
    'prefix': 'flower_',
    'count': 179,
    'alpha': 0.9,
    'rotation': 9,
    'taille': 5,
    'offset': 20,
    'scale': 0.5,
    'changeScale': 0.2,
  },
  {
    'folder': './flower10/',
    'prefix': 'flower_',
    'count': 202,
    'alpha': 1.2,
    'rotation': 10,
    'taille': 4,
    'offset': 15,
    'scale': 0.4,
    'changeScale': 0.7,
  },
  {
    'folder': './flower11/',
    'prefix': 'flower_',
    'count': 197,
    'alpha': 0.3,
    'rotation': 11,
    'taille': 3,
    'offset': 10,
    'scale': 0.2,
    'changeScale': 0.6,
  },
  {
    'folder': './flower12/',
    'prefix': 'flower_',
    'count': 170,
    'alpha': 0.4,
    'rotation': 12,
    'taille': 2,
    'offset': 5,
    'scale': 0.6,
    'changeScale': 0.3,
  },
  {
    'folder': './flower13/',
    'prefix': 'flower_',
    'count': 184,
    'alpha': 0.7,
    'rotation': 13,
    'taille': 1,
    'offset': 0,
    'scale': 0.9,
    'changeScale': 0.2,
  },
];
const EXT = '.jpg';

const PARTICLE_AMOUT = 40000;
const SPEED = 2;
let cursorX;
let cursorY;
let clickIsOn;


// sound parameters
let mediaStreamSource = null;
let audioContext;
let meter;

const SCREEN = {
  'width': window.innerWidth,
  'height': window.innerHeight,
};
const OFFSET = {
  'x': (SCREEN.width - DIMENSION.width) / 2,
  'y': (SCREEN.height - DIMENSION.height) / 2,
};

class App {
  constructor() {
    indexSequence = 0;
    currentSequence = 0;
    this.canvas = document.createElement('canvas');
    this.canvas.width = DIMENSION.width;
    this.canvas.height = DIMENSION.height;
    this.ctx = this.canvas.getContext('2d');
    this.allImages = [];
    this.allSequences = [];
    this.soundSetup();
    this.loadImage(0);
    this.counter = 0;
    clickIsOn = true;
  }
  soundSetup() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    // grab an audio context
    audioContext = new AudioContext();
    try {
      // monkeypatch getUserMedia
      navigator.getUserMedia = navigator.getUserMedia ||
          navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      // ask for an audio input
      navigator.getUserMedia(
          {
            'audio': {
              'mandatory': {
                'googEchoCancellation': 'false',
                'googAutoGainControl': 'false',
                'googNoiseSuppression': 'false',
                'googHighpassFilter': 'false',
              },
              'optional': [],
            },
          },
          this.onMicrophoneGranted, this.onMicrophoneDenied);
    } catch (e) {
      alert('getUserMedia threw exception :' + e);
    }
  }
  onMicrophoneDenied() {
    alert('Stream generation failed.');
  }
  onMicrophoneGranted(stream) {
    // Create an AudioNode from the stream.
    mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Create a new volume meter and connect it.
    meter = createAudioMeter(audioContext);
    mediaStreamSource.connect(meter);
  }

  loadImage(id) {
    this.img = new Image();
    this.img.onload = (function(e) {
                        this.allImages.push(this.img);
                        id++;
                        if (id < seqData[indexSequence].count &&
                            indexSequence < seqData.length) {
                          this.loadImage(id);
                        } else if (
                            id >= seqData[indexSequence].count &&
                            indexSequence < seqData.length) {
                          this.allSequences.push(this.allImages);
                          id = 0;
                          indexSequence++;
                          this.allImages = [];
                          this.loadImage(id);
                        }
                        if (indexSequence == seqData.length) {
                          console.log('All images loaded');
                          this.onAllImagesLoaded(0);
                        }
                      }).bind(this);
    if (indexSequence < seqData.length) {
      this.img.src = './data/' + seqData[indexSequence].folder +
          seqData[indexSequence].prefix + id + EXT;
    }
  }
  onAllImagesLoaded(e) {
    this.PX = new PIXI.Application(
        DIMENSION.width, DIMENSION.height, {antialias: true});
    let canvasContainer = document.getElementById('pixiContainer');
    canvasContainer.appendChild(this.PX.view);
    intro = document.querySelector('intro');
    intro.classList.toggle('desactive');
    intro.classList.toggle('active');
    // tableau de particules
    this.allGraphics = [];
    //
    this.sprites = new PIXI.particles.ParticleContainer(PARTICLE_AMOUT, {
      scale: true,
      position: true,
      rotation: true,
      alpha: true,
    });
    for (let i = 0; i < PARTICLE_AMOUT; i++) {
      let graphic = PIXI.Sprite.fromImage('./data/line.png');
      this.allGraphics.push(graphic);
      this.sprites.addChild(graphic);
      graphic.anchor.set(0);
      graphic.alpha = 0.5;
      graphic.scale.set(0.4);
    }
    this.PX.stage.addChild(this.sprites);
    this.PX.ticker.add(this.draw, this);

    this.PX.view.onmousemove = function(e) {
      cursorX = e.pageX - OFFSET.x;
      cursorY = e.pageY - OFFSET.y;
    };
    this.PX.view.onmouseup = function(e) {
      clickIsOn = !clickIsOn;
    };
  }
  // convert 0..255 R,G,B values to a hexidecimal color string
  rgbToHex(r, g, b) {
    let bin = r << 16 | g << 8 | b;
    return (function(h) {
      return new Array(7 - h.length).join('0') + h;
    })(bin.toString(16).toUpperCase());
  }
  mapRange(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
  }
  updateCanvas() {
    if (this.counter % SPEED == 0) {
      let shifted = this.allSequences[currentSequence].shift();
      this.ctx.clearRect(0, 0, DIMENSION.width, DIMENSION.height);
      this.ctx.drawImage(shifted, 0, 0);
      this.imageDatas =
          this.ctx.getImageData(0, 0, shifted.width, shifted.height);
      this.allSequences[currentSequence].push(shifted);
    }
    this.counter++;
  }
  processData() {
    for (let y = 0; y < DIMENSION.height; y += 3) {
      for (let x = 0; x < DIMENSION.width; x += 3) {
        let index = (y * DIMENSION.width + x) * 4;
        let red = this.imageDatas.data[index];
        let green = this.imageDatas.data[index + 1];
        let blue = this.imageDatas.data[index + 2];
        let brightness = Math.round(red * 0.3 + green * 0.59 + blue * 0.11);
        if (brightness > 80) {
          let shifted = this.allGraphics.shift();
          shifted.tint = '0x' + this.rgbToHex(red, green, blue);
          shifted.x = x;
          shifted.y = y;
          shifted.originX = x;
          shifted.originY = y;
          this.allGraphics.push(shifted);
        }
      }
    }
  }
  moveParticles() {
    // console.log(seqData[currentSequence].offset);
    let radius = meter.volume * DIMENSION.width / 2;
    let mouseRadius = 50;
    for (let i = 0; i < PARTICLE_AMOUT; i++) {
      let offsetDistance = this.mapRange(
          i, 0, PARTICLE_AMOUT, 0, seqData[currentSequence].offset);
      let particule = this.allGraphics[i];
      let pixelsPosition = new Vector(particule.originX, particule.originY);
      let mouseCenter = new Vector(cursorX, cursorY);
      let center = new Vector(DIMENSION.width / 2, DIMENSION.height / 2);
      let distance = pixelsPosition.subtract(center);
      let mouseDistance = pixelsPosition.subtract(mouseCenter);
      let ratio = distance.x * distance.y;
      // particule.scale.set(0.4);
      particule.rotation =
          Math.atan2(particule.y - mouseCenter.y, particule.x - mouseCenter.x);
      // ecarter si on souffle
      if (mouseDistance.getLength() < radius) {
        // particule.alpha = meter.voulume / 10 * mouseDistance.getLength() /
        //     DIMENSION.width / 5;
        particule.alpha = seqData[currentSequence].alpha;
        particule.x += distance.x * meter.volume + offsetDistance;
        particule.y += distance.y * meter.volume + offsetDistance;
        particule.rotation = offsetDistance +
            seqData[currentSequence].rotation * meter.volume *
                Math.atan2(
                    particule.y - mouseCenter.y, particule.x - mouseCenter.x);
        particule.scale.set(seqData[currentSequence].changeScale);
      } else {
        particule.scale.set(seqData[currentSequence].scale);
        particule.alpha = mouseDistance.getLength() / DIMENSION.width /
            seqData[currentSequence].taille;
      }
    }
  }
  draw() {
    this.updateCanvas();
    this.processData();
    this.moveParticles();
    if (meter.volume > volumeMax && changeMode == true) {
      this.changeVideo();
      changeMode = false;
    } else {
      changeMode = true;
    }
    if (clickIsOn) {
      this.changeVideo();
      clickIsOn = !clickIsOn;
    }
  }
  changeVideo() {
    if (currentSequence < seqData.length - 1) {
      currentSequence++;
    } else {
      currentSequence = 0;
    }
  }
}
window.onload = function() {
  new App();
};
const Vector = function(x, y) {
  this.x = x || 0;
  this.y = y || 0;
};

// return the angle of the vector in radians
Vector.prototype.getDirection = function() {
  return Math.atan2(this.y, this.x);
};

// set the direction of the vector in radians
Vector.prototype.setDirection = function(direction) {
  const magnitude = this.getMagnitude();
  this.x = Math.cos(angle) * magnitude;
  this.y = Math.sin(angle) * magnitude;
};

// get the magnitude of the vector
Vector.prototype.getMagnitude = function() {
  // use pythagoras theorem to work out the magnitude of the vector
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

// set the magnitude of the vector
Vector.prototype.setMagnitude = function(magnitude) {
  const direction = this.getDirection();
  this.x = Math.cos(direction) * magnitude;
  this.y = Math.sin(direction) * magnitude;
};

// add two vectors together and return a new one
Vector.prototype.add = function(v2) {
  return new Vector(this.x + v2.x, this.y + v2.y);
};

// add a vector to this one
Vector.prototype.addTo = function(v2) {
  this.x += v2.x;
  this.y += v2.y;
};

// subtract two vectors and reutn a new one
Vector.prototype.subtract = function(v2) {
  return new Vector(this.x - v2.x, this.y - v2.y);
};

// subtract a vector from this one
Vector.prototype.subtractFrom = function(v2) {
  this.x -= v2.x;
  this.y -= v2.y;
};

// multiply this vector by a scalar and return a new one
Vector.prototype.multiply = function(scalar) {
  return new Vector(this.x * scalar, this.y * scalar);
};

// multiply this vector by the scalar
Vector.prototype.multiplyBy = function(scalar) {
  this.x *= scalar;
  this.y *= scalar;
};

// scale this vector by scalar and return a new vector
Vector.prototype.divide = function(scalar) {
  return new Vector(this.x / scalar, this.y / scalar);
};

// scale this vector by scalar
Vector.prototype.divideBy = function(scalar) {
  this.x /= scalar;
  this.y /= scalar;
};

// Aliases
Vector.prototype.getLength = Vector.prototype.getMagnitude;
Vector.prototype.setLength = Vector.prototype.setMagnitude;

Vector.prototype.getAngle = Vector.prototype.getDirection;
Vector.prototype.setAngle = Vector.prototype.setDirection;

// Utilities
Vector.prototype.copy = function() {
  return new Vector(this.x, this.y);
};

Vector.prototype.toString = function() {
  return 'x: ' + this.x + ', y: ' + this.y;
};

Vector.prototype.toArray = function() {
  return [this.x, this.y];
};

Vector.prototype.toObject = function() {
  return {x: this.x, y: this.y};
};
