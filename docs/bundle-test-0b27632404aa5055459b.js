var Demo;
/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/AABB.js":
/*!*********************!*\
  !*** ./src/AABB.js ***!
  \*********************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ AABB; }
/* harmony export */ });
class AABB {
  constructor() {
    this.minX = Infinity;
    this.minY = Infinity;
    this.maxX = -Infinity;
    this.maxY = -Infinity;
  }

  add(x, y) {
    this.minX = Math.min(this.minX, x);
    this.minY = Math.min(this.minY, y);
    this.maxX = Math.max(this.maxX, x);
    this.maxY = Math.max(this.maxY, y);
  }

  get x() {
    return 0 | this.minX;
  }

  get y() {
    return 0 | this.minY;
  }

  get w() {
    return this.maxX - this.minX | 0;
  }

  get h() {
    return this.maxY - this.minY | 0;
  }

  get center() {
    return [(this.minX + this.maxX) / 2, (this.minY + this.maxY) / 2];
  }

  grow(n) {
    this.minX -= n;
    this.minY -= n;
    this.maxY += n;
    this.maxY += n;
  }

  shrink(dir, amount) {
    switch (dir) {
      case 0:
        this.minX += amount;
        this.minY += amount;
        break;

      case 1:
        this.maxX -= amount;
        this.minY += amount;
        break;

      case 2:
        this.maxX -= amount;
        this.maxY -= amount;
        break;

      case 3:
        this.minX += amount;
        this.maxY -= amount;
        break;

      default:
        throw new Error("Invalid direction: " + dir);
    }
  }

}

/***/ }),

/***/ "./src/Color.js":
/*!**********************!*\
  !*** ./src/Color.js ***!
  \**********************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LUM_THRESHOLD": function() { return /* binding */ LUM_THRESHOLD; },
/* harmony export */   "PERCEPTIVE_FACTOR_BLUE": function() { return /* binding */ PERCEPTIVE_FACTOR_BLUE; },
/* harmony export */   "PERCEPTIVE_FACTOR_GREEN": function() { return /* binding */ PERCEPTIVE_FACTOR_GREEN; },
/* harmony export */   "PERCEPTIVE_FACTOR_RED": function() { return /* binding */ PERCEPTIVE_FACTOR_RED; },
/* harmony export */   "default": function() { return /* binding */ Color; },
/* harmony export */   "getLuminance": function() { return /* binding */ getLuminance; }
/* harmony export */ });
const LUM_THRESHOLD = 0.03928;
const PERCEPTIVE_FACTOR_RED = 0.2126;
const PERCEPTIVE_FACTOR_GREEN = 0.7152;
const PERCEPTIVE_FACTOR_BLUE = 0.0722; // settings this to 2 will enable quicker, less accurate interpolation, 1 will switch to linear

const TO_LINEAR_POWER = 2.2;
const TO_RGB_POWER = 1 / TO_LINEAR_POWER;

function gun_luminance(v) {
  if (v <= LUM_THRESHOLD) {
    return v / 12.92;
  } else {
    return Math.pow((v + 0.055) / 1.055, 2.4);
  }
}

const colorRegExp = /^(#)?([0-9a-f]+)$/i;

function hex(n) {
  const s = n.toString(16);
  return s.length === 1 ? "0" + s : s;
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function getLuminance(color) {
  //const c = Color.validate(color);
  return PERCEPTIVE_FACTOR_RED * gun_luminance(color.r) + PERCEPTIVE_FACTOR_GREEN * gun_luminance(color.g) + PERCEPTIVE_FACTOR_BLUE * gun_luminance(color.b);
}
class Color {
  constructor(r, g, b) {
    this.r = void 0;
    this.g = void 0;
    this.b = void 0;
    this.r = r;
    this.g = g;
    this.b = b;
  }

  mix(other, ratio, out) {
    if (!out) {
      out = new Color();
    }

    if (TO_LINEAR_POWER === 2) {
      // quick and dirty
      const r0 = this.r * this.r;
      const g0 = this.g * this.g;
      const b0 = this.b * this.b;
      const r1 = other.r * other.r;
      const g1 = other.g * other.g;
      const b1 = other.b * other.b;
      out.r = Math.sqrt(r0 + (r1 - r0) * ratio) | 0;
      out.g = Math.sqrt(g0 + (g1 - g0) * ratio) | 0;
      out.b = Math.sqrt(b0 + (b1 - b0) * ratio) | 0;
    } else if (TO_LINEAR_POWER === 1) {
      // linear is bad, but still might be interesting artistically
      out.r = this.r + (other.r - this.r) * ratio | 0;
      out.g = this.g + (other.g - this.g) * ratio | 0;
      out.b = this.b + (other.b - this.b) * ratio | 0;
    } else {
      const r0 = Math.pow(this.r, TO_LINEAR_POWER);
      const g0 = Math.pow(this.g, TO_LINEAR_POWER);
      const b0 = Math.pow(this.b, TO_LINEAR_POWER);
      const r1 = Math.pow(other.r, TO_LINEAR_POWER);
      const g1 = Math.pow(other.g, TO_LINEAR_POWER);
      const b1 = Math.pow(other.b, TO_LINEAR_POWER);
      out.r = Math.pow(r0 + (r1 - r0) * ratio, TO_RGB_POWER) | 0;
      out.g = Math.pow(g0 + (g1 - g0) * ratio, TO_RGB_POWER) | 0;
      out.b = Math.pow(b0 + (b1 - b0) * ratio, TO_RGB_POWER) | 0;
    }

    return out;
  }

  multiply(n, out) {
    if (!out) {
      out = new Color();
    }

    out.r = this.r * n;
    out.g = this.g * n;
    out.b = this.b * n;
    return out;
  }

  scale(r, g, b, out) {
    if (!out) {
      out = new Color();
    }

    out.r = this.r * r;
    out.g = this.g * g;
    out.b = this.b * b;
    return out;
  }

  set(r, g, b) {
    if (r instanceof Color) {
      this.r = r.r;
      this.g = r.g;
      this.b = r.b;
    } else {
      this.r = r;
      this.g = g;
      this.b = b;
    }

    return this;
  }

  toRGBHex() {
    return "#" + hex(this.r) + hex(this.g) + hex(this.b);
  }

  toRGBA(alpha) {
    return "rgba(" + this.r + "," + this.g + "," + this.b + "," + alpha + ")";
  }

  toHex() {
    return (this.r << 16) + (this.g << 8) + this.b;
  }

  static validate(color) {
    let m;

    if (typeof color !== "string" || !(m = colorRegExp.exec(color))) {
      return null;
    }

    const col = m[2];

    if (col.length === 3) {
      return new Color(parseInt(col[0], 16) * 17, parseInt(col[1], 16) * 17, parseInt(col[2], 16) * 17);
    } else if (col.length === 6) {
      return new Color(parseInt(col.substring(0, 2), 16), parseInt(col.substring(2, 4), 16), parseInt(col.substring(4, 6), 16));
    } else {
      return null;
    }
  }

  static from(color) {
    let factor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1.0;

    if (Array.isArray(color)) {
      const length = color.length;
      const array = new Float32Array(length * 3);
      const f = factor / 255;
      let off = 0;

      for (let i = 0; i < length; i++) {
        const col = Color.from(color[i]);
        array[off++] = col.r * f;
        array[off++] = col.g * f;
        array[off++] = col.b * f;
      }

      return array;
    }

    const col = Color.validate(color);

    if (!col) {
      throw new Error("Invalid color " + color);
    }

    col.r *= factor;
    col.g *= factor;
    col.b *= factor;
    return col;
  }

  static fromHSL(h, s, l) {
    let r, g, b;

    if (s <= 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return new Color(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
  }

}

/***/ }),

/***/ "./src/World.js":
/*!**********************!*\
  !*** ./src/World.js ***!
  \**********************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Biomes": function() { return /* binding */ Biomes; },
/* harmony export */   "MAX_HEIGHT": function() { return /* binding */ MAX_HEIGHT; },
/* harmony export */   "MAX_LATITUDE": function() { return /* binding */ MAX_LATITUDE; },
/* harmony export */   "default": function() { return /* binding */ World; }
/* harmony export */ });
/* harmony import */ var prando__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! prando */ "./node_modules/prando/dist/Prando.es.js");
/* harmony import */ var simplex_noise__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! simplex-noise */ "./node_modules/simplex-noise/dist/esm/simplex-noise.js");
/* harmony import */ var _terrain__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./terrain */ "./src/terrain.js");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./util */ "./src/util.js");
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./env */ "./src/env.js");
/* harmony import */ var _shuffle__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./shuffle */ "./src/shuffle.js");
/* harmony import */ var rtree__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rtree */ "./node_modules/rtree/lib/index.js");
/* harmony import */ var rtree__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(rtree__WEBPACK_IMPORTED_MODULE_6__);






 // A single iteration of Bob Jenkins' One-At-A-Time hashing algorithm.

function hash(x) {
  x += x << 10;
  x ^= x >> 6;
  x += x << 3;
  x ^= x >> 11;
  x += x << 15;
  return x;
}

const Biomes = _terrain__WEBPACK_IMPORTED_MODULE_2__.TerrainTypes.map((t, i) => t.name !== "SEA" && t.name !== "ROCK" ? i : -1).filter(n => n >= 0);

function createBiomes(prando) {
  const biomes = new Array(256);

  for (let i = 0; i < 256; i++) {
    biomes[i] = Biomes[0 | prando.next(0, Biomes.length)];
  }

  return biomes;
}

function getRandomValues(prando, count) {
  const out = [];

  for (let i = 0; i < count; i++) {
    out.push(prando.next());
  }

  return out;
}

const MAX_HEIGHT = 120;
const MAX_LATITUDE = 10800; // 2 * 10 hex patches in cartesian coordinates (not hex q/r)
//export const MAX_LONGITUDE = MAX_LATITUDE * 2

function norm(rnd, array) {
  let slices = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;
  let sum = 0;

  for (let i = 0; i < array.length; i += 2) {
    const weight = array[i + 1];
    sum += weight;
  }

  const factor = 1 / (sum * slices);
  const out = [];

  for (let i = 0; i < array.length; i += 2) {
    const terrain = array[i];
    let sliceWeight = array[i + 1] * factor;

    for (let j = 0; j < slices; j++) {
      out.push([terrain, sliceWeight]);
    }
  }

  (0,_shuffle__WEBPACK_IMPORTED_MODULE_5__["default"])(rnd, out);
  sum = 0;

  for (let i = 0; i < out.length; i++) {
    const e = out[i];
    const weight = e[1];
    sum += weight;
    e[1] = sum;
  }

  return out;
}

class World {
  /**
   * Initial world seed
   * @type {number}
   */

  /**
   *
   * @type {Prando}
   */

  /**
   *
   * @type {SimplexNoise}
   */

  /**
   * RTree for faces
   *
   * @type {RTree}
   */
  constructor(seed) {
    this.seed = 0;
    this.rnd = void 0;
    this.noise = void 0;
    this.rTree = null;
    this.nh = [];
    this.bo = [];
    this.biomeLookup = [];
    this.biomeMask = 0;
    this.TROPIC = [];
    this.MODERATE = [];
    console.log("WORLD: seed = ", seed);
    this.seed = seed;
    const prando = new prando__WEBPACK_IMPORTED_MODULE_0__["default"](seed);
    this.rnd = prando; // noise offsets x/y for 3 octaves

    this.nh = getRandomValues(prando, 6);
    this.bo = getRandomValues(prando, 9);
    this.biomeMask = prando.nextInt();
    this.biomeLookup = createBiomes(prando);
    this.noise = new simplex_noise__WEBPACK_IMPORTED_MODULE_1__["default"](() => prando.next());
    this.rTree = new (rtree__WEBPACK_IMPORTED_MODULE_6___default())();
    this.TROPIC = norm(prando, [_terrain__WEBPACK_IMPORTED_MODULE_2__.Terrain.RAINFOREST, 3, _terrain__WEBPACK_IMPORTED_MODULE_2__.Terrain.RAINFOREST_2, 3, _terrain__WEBPACK_IMPORTED_MODULE_2__.Terrain.TALL_GRASS, 2, _terrain__WEBPACK_IMPORTED_MODULE_2__.Terrain.GRASS, 1, _terrain__WEBPACK_IMPORTED_MODULE_2__.Terrain.MUD, 1, _terrain__WEBPACK_IMPORTED_MODULE_2__.Terrain.SAND, 1]);
    this.MODERATE = norm(prando, [_terrain__WEBPACK_IMPORTED_MODULE_2__.Terrain.DARK_WOODS, 4, _terrain__WEBPACK_IMPORTED_MODULE_2__.Terrain.DIRT, 1, _terrain__WEBPACK_IMPORTED_MODULE_2__.Terrain.WOODS, 4, _terrain__WEBPACK_IMPORTED_MODULE_2__.Terrain.TALL_GRASS, 4, _terrain__WEBPACK_IMPORTED_MODULE_2__.Terrain.MUD, 1, _terrain__WEBPACK_IMPORTED_MODULE_2__.Terrain.SAND, 1, _terrain__WEBPACK_IMPORTED_MODULE_2__.Terrain.GRASS, 4]);
    console.log("TROPIC", this.TROPIC);
    console.log("MODERATE", this.MODERATE);
  }
  /**
   * Calculates the height/y-coordinate for the given x/z coordinates.
   *
   * @param {number} x
   * @param {number} z
   *
   * @param {number} offset
   * @return {number} height or y-coordinate
   */


  calculateHeight(x, z) {
    let offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    const {
      noise,
      nh
    } = this;
    const [ox0, oy0, ox1, oy1, ox2, oy2] = nh;
    const ns0 = 0.003;
    const ns1 = ns0 * 0.13;
    const ns2 = ns0 * -0.17; // three octaves of noise

    const h = (noise.noise3D(ox0 + x * ns0, oy0 + z * ns0, 0) * 0.7 + noise.noise3D(ox1 + x * ns1, oy1 + z * ns1, offset) * 0.2 + noise.noise3D(ox2 + x * ns2, oy2 + z * ns2, offset) * 0.1) * MAX_HEIGHT;
    return h;
  }

  getBiome(x, y, z) {
    const tempNs = 0.00007;
    const moistNs = 0.00005;
    const ns2 = 0.0013;
    const [tempNx, tempNy, moistNx, moistNy, flavorNx, flavorNy, tempNz, moistNz, flavorNz] = this.bo;
    const tempMalus = Math.min(1, 1 - Math.cos(y / MAX_LATITUDE * _env__WEBPACK_IMPORTED_MODULE_4__.TAU / 4) * 4);
    const moistureBonus = Math.pow(Math.cos(y / MAX_LATITUDE * _env__WEBPACK_IMPORTED_MODULE_4__.TAU / 4), 2);
    const temperature = Math.max(-1, this.noise.noise3D(tempNx + x * tempNs, tempNy + y * tempNs, tempNz) * 0.8 - tempMalus);
    const moisture = Math.min(1, this.noise.noise3D(moistNx + x * moistNs, moistNy + y * moistNs, moistNz) + moistureBonus);
    const flavor = (this.noise.noise3D(flavorNx + x * ns2, flavorNy + y * ns2, flavorNz) * 2 + this.noise.noise3D(flavorNy + y * ns2, flavorNx + x * ns2, flavorNx) * 3) / 5;

    if (z < 0) {
      if (z < -10) {
        return _terrain__WEBPACK_IMPORTED_MODULE_2__.Terrain.DEEP_SEA;
      }

      return _terrain__WEBPACK_IMPORTED_MODULE_2__.Terrain.SEA;
    } else if (z < 12) {
      return _terrain__WEBPACK_IMPORTED_MODULE_2__.Terrain.SAND;
    }

    if (temperature < -0.25) {
      return _terrain__WEBPACK_IMPORTED_MODULE_2__.Terrain.ICE;
    }

    if (moisture < -0.3) {
      if (temperature < 0.8) {
        return _terrain__WEBPACK_IMPORTED_MODULE_2__.Terrain.STEPPE;
      } else {
        return _terrain__WEBPACK_IMPORTED_MODULE_2__.Terrain.SAND;
      }
    }

    let area;

    if (temperature > 0.7 && moisture > 0.8) {
      area = this.TROPIC;
    } else {
      area = this.MODERATE;
    }

    let value = 1 + Math.max(-1.5, Math.min(1.5, flavor + moisture * 0.5)) / 1.5;
    const last = area.length - 1;

    for (let i = 0; i < last; i++) {
      const [terrain, limit] = area[i];

      if (value < limit) {
        return terrain;
      }

      value -= limit;
    }

    return area[last][0];
  }

}

/***/ }),

/***/ "./src/env.js":
/*!********************!*\
  !*** ./src/env.js ***!
  \********************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Env": function() { return /* binding */ Env; },
/* harmony export */   "SCALE": function() { return /* binding */ SCALE; },
/* harmony export */   "TAU": function() { return /* binding */ TAU; }
/* harmony export */ });
const SCALE = 10;
const TAU = 2 * Math.PI;
class Env {
  constructor() {
    this.world = null;
  }

  init(world) {
    this.world = world;
  }

}
/* harmony default export */ __webpack_exports__["default"] = (new Env());

/***/ }),

/***/ "./src/shuffle.js":
/*!************************!*\
  !*** ./src/shuffle.js ***!
  \************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ shuffle; }
/* harmony export */ });
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./env */ "./src/env.js");

function shuffle(rnd, a) {
  let j, x, i;

  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(rnd.next(0, i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }

  return a;
}

/***/ }),

/***/ "./src/terrain.js":
/*!************************!*\
  !*** ./src/terrain.js ***!
  \************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Terrain": function() { return /* binding */ Terrain; },
/* harmony export */   "TerrainTypes": function() { return /* binding */ TerrainTypes; },
/* harmony export */   "calculateNormal": function() { return /* binding */ calculateNormal; }
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util */ "./src/util.js");
/* harmony import */ var _AABB__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AABB */ "./src/AABB.js");





function calculateNormalFromHeightMap(world, x0, z0) {
  const e = 0.01;
  const x1 = x0 + e;
  const z1 = z0;
  const x2 = x0;
  const z2 = z0 + e;
  const y0 = world.calculateHeight(x0, z0);
  const y1 = world.calculateHeight(x1, z1);
  const y2 = world.calculateHeight(x2, z2);
  return calculateNormal(x0, y0, z0, x1, y1, z1, x2, y2, z2);
}

function calculateNormal(x0, y0, z0, x1, y1, z1, x2, y2, z2) {
  const ax = x1 - x0;
  const ay = y1 - y0;
  const az = z1 - z0;
  const bx = x2 - x0;
  const by = y2 - y0;
  const bz = z2 - z0;
  const nx = ay * bz - az * by;
  const ny = az * bx - ax * bz;
  const nz = ax * by - ay * bx;
  const f = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz); // if (f === Infinity)
  // {
  //     return [0,1,0]
  // }

  return [nx * f, ny * f, nz * f];
} // console.log(TerrainTypes.map((t,i) => t.name + ": " + i + ",").join("\n"))

function initFace(world, face) {
  const patchX = 0;
  const patchY = 0;
  const first = face.halfEdge;
  let curr = first;
  let x = 0;
  let z = 0;
  const aabb = new _AABB__WEBPACK_IMPORTED_MODULE_1__["default"]();

  do {
    const next = curr.next;
    const x0 = 0 | patchX + curr.vertex.x;
    const z0 = 0 | patchY + curr.vertex.y;
    x += x0;
    z += z0;
    aabb.add(x, z);
    curr = next;
  } while (curr !== first);

  x >>= 2;
  z >>= 2;
  face.center = [x, Math.round(world.calculateHeight(x, z)), z];
  face.aabb = aabb;
  world.rTree.insert(aabb, face);
}

function getArea(face) {
  const patchX = 0;
  const patchY = 0;
  const first = face.halfEdge;
  let curr = first;
  let area = 0;

  do {
    const next = curr.next;
    const x0 = 0 | patchX + curr.vertex.x;
    const z0 = 0 | patchY + curr.vertex.y;
    const x1 = 0 | patchX + next.vertex.x;
    const z1 = 0 | patchY + next.vertex.y;
    area += z1 * x0 - x1 * z0;
    curr = next;
  } while (curr !== first);

  return area / 2;
}

function initializeFaces(world, faces) {
  faces.forEach(face => {
    initFace(world, face);
    (0,_util__WEBPACK_IMPORTED_MODULE_0__.forEachHalfEdge)(face, he => {
      const {
        vertex
      } = he;

      if (vertex.biome < 0) {
        vertex.z = world.calculateHeight(vertex.x, vertex.y);
        vertex.biome = world.getBiome(vertex.x, vertex.y, vertex.z);

        if (vertex.z < 10) {
          vertex.z = 10;
        }
      }
    });
  });
}

class GeomPerMat {
  constructor(world, terrain) {
    this.world = null;
    this.indices = [];
    this.vertices = [];
    this.normals = [];
    this.terrain = -1;
    this.world = world;
    this.terrain = terrain;
  }

  triFn() {
    const vOff = this.vertices.length / 3;
    return (a, b, c) => this.indices.push(vOff + a, vOff + b, vOff + c);
  }

  addVertices(x, y, z) {
    this.vertices.push(x, y, z);
  }

  addNormal(x, y, z) {
    const l = Math.sqrt(x * x + y * y + z * z);
    const f = 1 / l;
    x *= f;
    y *= f;
    z *= f;
    this.normals.push(x, y, z);
  }

  getVertex(idx) {
    const off = idx * 3;
    const x = this.vertices[off];
    const y = this.vertices[off + 1];
    const z = this.vertices[off + 2];
    return [x, y, z];
  }

  createThreeGeometry() {
    if (!this.indices.length) {
      console.log("No geometry for " + this.terrain.name);
      return null;
    } // console.log("index", this.indices)
    // console.log("position", this.vertices)
    // console.log("normal", this.normals)


    const geometry = new three__WEBPACK_IMPORTED_MODULE_2__.BufferGeometry();
    geometry.setIndex(this.indices);
    geometry.setAttribute("position", new three__WEBPACK_IMPORTED_MODULE_2__.Float32BufferAttribute(this.vertices, 3));
    geometry.setAttribute("normal", new three__WEBPACK_IMPORTED_MODULE_2__.Float32BufferAttribute(this.normals, 3));
    return geometry;
  }

}

let tileNameLookup = [null, "case-1", "case-2", "case-3", "case-4", "case-m5", "case-6", "case-7", "case-8", "case-9", "case-m10", "case-11", "case-12", "case-13", "case-14", "case-15", // multi case
null, "case-m1", "case-m2", "case-3", "case-m4", "case-m5", "case-6", "case-7", "case-m8", "case-9", "case-m10", "case-11", "case-12", "case-13", "case-14", "case-15"];

function getDistance(x0, y0, z0, x1, y1, z1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dz = z1 - z0;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function getStats(diffs) {
  let median;
  const len = diffs.length;
  let half = len >> 1;

  if ((len & 1) === 0) {
    median = diffs[half].diff;
  } else {
    median = (diffs[half].diff + diffs[half + 1].diff) / 2;
  }

  console.log("DIFFS", diffs);
  console.log("Median Height difference", median);
  console.log("Average Height difference", diffs.reduce((a, b) => a + b.diff, 0) / diffs.length);
}

function getEdgesByHeightDifference(faces) {
  const edgesCounted = new Set();
  const differences = [];

  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    const first = face.halfEdge;
    let curr = first;

    do {
      let edge = curr.edge;

      if (!edgesCounted.has(edge) && curr.twin) {
        edgesCounted.add(edge);
        const y0 = face.center[2];
        const y1 = curr.twin.face.center[2];
        const diff = Math.abs(y0 - y1);
        differences.push({
          diff,
          edge
        });
      }

      curr = curr.next;
    } while (curr !== first);
  }

  differences.sort((a, b) => a.diff - b.diff);
  return differences;
}

class Terrain {
  /**
   * @type {Scene}
   */

  /**
   *
   * @type {HexagonPatch}
   */

  /**
   *
   * @type {Array.<Face>}
   */
  constructor(scene, world, patch) {
    this.scene = null;
    this.patch = null;
    this.world = null;
    this.faces = null;
    this.scene = scene;
    this.world = world;
    this.patch = patch;
    this.faces = this.patch.build();
    initializeFaces(world, this.faces);
  }

  createGeometries(msTiles) {
    const MARK_FACES = false;
    const patchX = 0;
    const patchY = 0;
    const {
      world
    } = this;
    const geoms = TerrainTypes.map(tt => new GeomPerMat(world, tt));
    const lines = [];
    const faces = this.faces;

    for (let i = 0; i < faces.length; i++) {
      const face = faces[i];
      const first = face.halfEdge;
      const {
        biome: biome3
      } = first.vertex;
      const {
        biome: biome2
      } = first.next.vertex;
      const {
        biome: biome1
      } = first.next.next.vertex;
      const {
        biome: biome0
      } = first.next.next.next.vertex;
      const localBiomes = new Set([biome0, biome1, biome2, biome3]);
      const multiMode = localBiomes.size > 2;

      if (localBiomes.size === 1) {
        // easiest case. We only have one biome, case-15 with that biome, done
        this.insert(msTiles["case-15"], face, geoms[biome0]);
      } else {
        for (let terrain of localBiomes) {
          const tileName = tileNameLookup[(terrain === biome0) + (terrain === biome1) * 2 + (terrain === biome2) * 4 + (terrain === biome3) * 8 + multiMode * 16];

          if (tileName) {
            this.insert(msTiles[tileName], face, geoms[terrain]);
          }
        }
      }

      const {
        vertex: vertex0
      } = first;
      const {
        vertex: vertex1
      } = first.next;
      const {
        vertex: vertex2
      } = first.next.next;
      const {
        vertex: vertex3
      } = first.next.next.next;

      if (MARK_FACES) {
        lines.push(new three__WEBPACK_IMPORTED_MODULE_2__.Vector3(vertex0.x, vertex0.z, vertex0.y), new three__WEBPACK_IMPORTED_MODULE_2__.Vector3(vertex1.x, vertex1.z, vertex1.y));
        lines.push(new three__WEBPACK_IMPORTED_MODULE_2__.Vector3(vertex1.x, vertex1.z, vertex1.y), new three__WEBPACK_IMPORTED_MODULE_2__.Vector3(vertex2.x, vertex2.z, vertex2.y));
        lines.push(new three__WEBPACK_IMPORTED_MODULE_2__.Vector3(vertex2.x, vertex2.z, vertex2.y), new three__WEBPACK_IMPORTED_MODULE_2__.Vector3(vertex3.x, vertex3.z, vertex3.y));
        lines.push(new three__WEBPACK_IMPORTED_MODULE_2__.Vector3(vertex3.x, vertex3.z, vertex3.y), new three__WEBPACK_IMPORTED_MODULE_2__.Vector3(vertex0.x, vertex0.z, vertex0.y));
        lines.push(new three__WEBPACK_IMPORTED_MODULE_2__.Vector3(vertex0.x, vertex0.z, vertex0.y), new three__WEBPACK_IMPORTED_MODULE_2__.Vector3((vertex0.x * 4 + vertex1.x + vertex2.x + vertex3.x) / 7, (vertex0.z * 4 + vertex1.z + vertex2.z + vertex3.z) / 7, (vertex0.y * 4 + vertex1.y + vertex2.y + vertex3.y) / 7));
      }
    }

    let diff = getEdgesByHeightDifference(faces);
    getStats(diff);
    diff.filter(e => e.diff > 15).forEach(_ref => {
      let {
        edge
      } = _ref;
      const vertex0 = edge.halfEdge.vertex;
      const vertex1 = edge.halfEdge.next.vertex;
      lines.push(new three__WEBPACK_IMPORTED_MODULE_2__.Vector3(vertex0.x, vertex0.z, vertex0.y), new three__WEBPACK_IMPORTED_MODULE_2__.Vector3(vertex1.x, vertex1.z, vertex1.y));
    });
    return [geoms, lines];
  }

  insert(tile, face, geom) {
    //console.log("INSERT", tile, face, biome)
    if (tile.type !== "Mesh") {
      throw new Error("Expecting only meshes, is: " + geometry.type);
    }

    const {
      world
    } = this;
    const {
      geometry
    } = tile;
    const first = face.halfEdge;
    const {
      vertex: vertex0
    } = first;
    const {
      vertex: vertex1
    } = first.next;
    const {
      vertex: vertex2
    } = first.next.next;
    const {
      vertex: vertex3
    } = first.next.next.next;
    const verticesIn = geometry.attributes.position.array;
    const normalsIn = geometry.attributes.normal.array;
    const indexIn = geometry.index.array;
    const tri = geom.triFn(); // hexagon patch vertices are z-up, so we swap

    const {
      x: x0,
      y: z0,
      z: y0
    } = vertex0;
    const {
      x: x1,
      y: z1,
      z: y1
    } = vertex1;
    const {
      x: x2,
      y: z2,
      z: y2
    } = vertex2;
    const {
      x: x3,
      y: z3,
      z: y3
    } = vertex3;

    for (let i = 0; i < verticesIn.length; i += 3) {
      let xIn = verticesIn[i];
      let yIn = -verticesIn[i + 1];
      let zIn = verticesIn[i + 2];
      let x = xIn + 0.5;
      const y = yIn;
      let z = zIn + 0.5;
      const scale = getDistance(x0, y0, z0, x2, y2, z2) / Math.sqrt(2);
      let rx2, ry2, rz2;
      let localUp;
      {
        const rx0 = x0 + (x1 - x0) * x;
        const ry0 = y0 + (y1 - y0) * x;
        const rz0 = z0 + (z1 - z0) * x;
        const rx1 = x3 + (x2 - x3) * x;
        const ry1 = y3 + (y2 - y3) * x;
        const rz1 = z3 + (z2 - z3) * x;
        rx2 = rx0 + (rx1 - rx0) * z;
        ry2 = ry0 + (ry1 - ry0) * z;
        rz2 = rz0 + (rz1 - rz0) * z;
        localUp = calculateNormalFromHeightMap(world, rx2, rz2); //console.log("LOCAL UP", localUp)

        rx2 += localUp[0] * y * scale;
        ry2 += localUp[1] * y * scale;
        rz2 += localUp[2] * y * scale;
        geom.addVertices(rx2, ry2, rz2);
      }
      {
        const nx = x + normalsIn[i];
        const ny = y - normalsIn[i + 1];
        const nz = z + normalsIn[i + 2];
        const rx0 = x0 + (x1 - x0) * nx;
        const ry0 = y0 + (y1 - y0) * nx;
        const rz0 = z0 + (z1 - z0) * nx;
        const rx1 = x3 + (x2 - x3) * nx;
        const ry1 = y3 + (y2 - y3) * nx;
        const rz1 = z3 + (z2 - z3) * nx;
        let rnx = rx0 + (rx1 - rx0) * nz;
        let rny = ry0 + (ry1 - ry0) * nz;
        let rnz = rz0 + (rz1 - rz0) * nz;
        rnx += localUp[0] * ny * scale;
        rny += localUp[1] * ny * scale;
        rnz += localUp[2] * ny * scale;
        geom.addNormal(rnx - rx2, rny - ry2, rnz - rz2);
      }
    }

    for (let i = 0; i < indexIn.length; i += 3) {
      const a = indexIn[i];
      const b = indexIn[i + 1];
      const c = indexIn[i + 2];
      tri(a, b, c);
    }
  }

}
const TerrainTypes = [{
  "name": "SEA",
  material: {
    roughness: 0.1,
    color: "#002888"
  }
}, {
  "name": "DEEP_SEA",
  material: {
    roughness: 0.2,
    color: "#060f69"
  }
}, {
  "name": "GRASS",
  material: {
    roughness: 0.96,
    color: "#284"
  }
}, {
  "name": "WATER",
  material: {
    roughness: 0.05,
    color: "#004290"
  }
}, {
  "name": "TALL_GRASS",
  material: {
    roughness: 0.98,
    color: "#4b8822"
  }
}, {
  "name": "REEDS",
  material: {
    roughness: 0.98,
    color: "#7e8822"
  }
}, {
  "name": "WOODS",
  material: {
    roughness: 0.94,
    color: "#1c6b37"
  }
}, {
  "name": "DARK_WOODS",
  material: {
    roughness: 0.94,
    color: "#103b29"
  }
}, {
  "name": "DIRT",
  material: {
    roughness: 0.99,
    color: "#4d2605"
  }
}, {
  "name": "MUD",
  material: {
    roughness: 0.7,
    color: "#38261e"
  }
}, {
  "name": "SAND",
  material: {
    roughness: 0.99,
    color: "#afaa41"
  }
}, {
  "name": "ICE",
  material: {
    roughness: 0.4,
    color: "#bbbbff"
  }
}, {
  "name": "SNOW",
  material: {
    roughness: 0.4,
    color: "#bbbbff"
  }
}, {
  "name": "ROCK",
  material: {
    roughness: 0.7,
    color: "#777"
  }
}, {
  "name": "RAINFOREST",
  material: {
    roughness: 0.95,
    color: "#049439"
  }
}, {
  "name": "RAINFOREST_2",
  material: {
    roughness: 0.96,
    color: "#056442"
  }
}, {
  "name": "STEPPE",
  material: {
    roughness: 0.96,
    color: "#93a167"
  }
}]; // console.log(TerrainTypes.map((t,i) => "Terrain." + t.name + " = " + i).join("\n"))

Terrain.SEA = 0;
Terrain.DEEP_SEA = 1;
Terrain.GRASS = 2;
Terrain.WATER = 3;
Terrain.TALL_GRASS = 4;
Terrain.REEDS = 5;
Terrain.WOODS = 6;
Terrain.DARK_WOODS = 7;
Terrain.DIRT = 8;
Terrain.MUD = 9;
Terrain.SAND = 10;
Terrain.ICE = 11;
Terrain.SNOW = 12;
Terrain.ROCK = 13;
Terrain.RAINFOREST = 14;
Terrain.RAINFOREST_2 = 15;
Terrain.STEPPE = 16;

/***/ }),

/***/ "./src/test.js":
/*!*********************!*\
  !*** ./src/test.js ***!
  \*********************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var domready__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! domready */ "./node_modules/domready/ready.js");
/* harmony import */ var domready__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(domready__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _style_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./style.css */ "./src/style.css");
/* harmony import */ var _World__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./World */ "./src/World.js");
/* harmony import */ var _terrain__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./terrain */ "./src/terrain.js");
/* harmony import */ var _Color__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Color */ "./src/Color.js");





const PHI = (1 + Math.sqrt(5)) / 2;
const TAU = Math.PI * 2;
const DEG2RAD_FACTOR = TAU / 360;
const config = {
  width: 0,
  height: 0
};
/**
 * @type CanvasRenderingContext2D
 */

let ctx;
let canvas;
const pink = _Color__WEBPACK_IMPORTED_MODULE_4__["default"].from("#f0f");
domready__WEBPACK_IMPORTED_MODULE_0___default()(() => {
  canvas = document.createElement("canvas");
  document.getElementById("root").appendChild(canvas);
  ctx = canvas.getContext("2d");
  const width = window.innerWidth * 0.9 | 0;
  const height = width >> 1;
  config.width = width;
  config.height = height;
  canvas.width = width;
  canvas.height = height;
  const world = new _World__WEBPACK_IMPORTED_MODULE_2__["default"](1412);

  const paint = () => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    let imageData = ctx.getImageData(0, 0, width, height);
    const {
      data
    } = imageData;
    let off = 0;
    const cx = width >> 1;
    const cy = height >> 1;
    const h = _World__WEBPACK_IMPORTED_MODULE_2__.MAX_LATITUDE * 2;
    const f = h / height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const x0 = x - cx;
        const y0 = y - cy;
        const biome = world.getBiome(x0 * f, y0 * f);
        const color = biome !== undefined ? _Color__WEBPACK_IMPORTED_MODULE_4__["default"].from(_terrain__WEBPACK_IMPORTED_MODULE_3__.TerrainTypes[biome].material.color) : pink;
        data[off] = color.r;
        data[off + 1] = color.g;
        data[off + 2] = color.b;
        off += 4;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  paint();
  canvas.addEventListener("click", paint, true);
});

/***/ }),

/***/ "./src/util.js":
/*!*********************!*\
  !*** ./src/util.js ***!
  \*********************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "clamp": function() { return /* binding */ clamp; },
/* harmony export */   "forEachHalfEdge": function() { return /* binding */ forEachHalfEdge; },
/* harmony export */   "resolve": function() { return /* binding */ resolve; }
/* harmony export */ });
function clamp(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
function resolve(names, values) {
  const indexes = [];

  outer: for (let i = 0; i < names.length; i++) {
    const name = names[i];

    for (let j = 0; j < values.length; j++) {
      const value = values[j];

      if (value.name === name) {
        indexes.push(j);
        continue outer;
      }
    }

    throw new Error("Could not find element with name " + name);
  }

  return indexes;
}
function forEachHalfEdge(face, fn) {
  const first = face.halfEdge;
  let curr = first;

  do {
    fn(curr);
    curr = curr.next;
  } while (curr !== first);
}

/***/ }),

/***/ "./src/style.css":
/*!***********************!*\
  !*** ./src/style.css ***!
  \***********************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	!function() {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = function(result, chunkIds, fn, priority) {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var chunkIds = deferred[i][0];
/******/ 				var fn = deferred[i][1];
/******/ 				var priority = deferred[i][2];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every(function(key) { return __webpack_require__.O[key](chunkIds[j]); })) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	!function() {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"test": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = function(chunkId) { return installedChunks[chunkId] === 0; };
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = function(parentChunkLoadingFunction, data) {
/******/ 			var chunkIds = data[0];
/******/ 			var moreModules = data[1];
/******/ 			var runtime = data[2];
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some(function(id) { return installedChunks[id] !== 0; })) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkDemo"] = self["webpackChunkDemo"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors"], function() { return __webpack_require__("./src/test.js"); })
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	Demo = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=bundle-test-0b27632404aa5055459b.js.map