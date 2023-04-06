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

/***/ "./src/HexagonPatch.js":
/*!*****************************!*\
  !*** ./src/HexagonPatch.js ***!
  \*****************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PATCH_SIZE": function() { return /* binding */ PATCH_SIZE; },
/* harmony export */   "createHexagon": function() { return /* binding */ createHexagon; },
/* harmony export */   "default": function() { return /* binding */ HexagonPatch; },
/* harmony export */   "findFaceIndex": function() { return /* binding */ findFaceIndex; },
/* harmony export */   "removeEdge": function() { return /* binding */ removeEdge; }
/* harmony export */ });
/* harmony import */ var _geometry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./geometry */ "./src/geometry.js");
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./env */ "./src/env.js");
/* harmony import */ var _shuffle__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./shuffle */ "./src/shuffle.js");




function findInsideEdges(faces) {
  const edges = new Set();

  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    const first = face.halfEdge;
    let curr = first;

    do {
      if (curr.twin) {
        edges.add(curr.edge);
      }

      curr = curr.next;
    } while (curr !== first);
  }

  return edges;
}

function getEdges(faces) {
  const edges = new Set();

  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    const first = face.halfEdge;
    let curr = first;

    do {
      if (!curr.edge) {
        throw new Error("No edge set");
      }

      edges.add(curr.edge);
      curr = curr.next;
    } while (curr !== first);
  }

  return edges;
}

function findFaceIndex(faces, other) {
  if (!other) {
    throw new Error("Need face");
  }

  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];

    if (face === other) {
      return i;
    }
  }

  return -1;
}

function resetFacesInLoop(prev, face) {
  let curr = prev;

  do {
    curr.face = face;
    curr = curr.next;
  } while (curr !== prev);
}

function removeEdge(faces, edge) {
  let onlyFromTris = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  if (!edge || !edge.halfEdge || !edge.halfEdge.twin) {
    throw new Error("Need half edge and twin");
  }

  const he = edge.halfEdge;
  const face = he.face;
  const other = he.twin.face;

  if (onlyFromTris && (face.length !== 3 || other.length !== 3)) {
    return;
  }

  const index = findFaceIndex(faces, other);

  if (index < 0) {
    throw new Error("Did not find twin face in faces array");
  }

  faces.splice(index, 1);
  const prev = he.prev;
  const twinPrev = he.twin.prev;
  prev.next = he.twin.next;
  twinPrev.next = he.next;
  resetFacesInLoop(prev, face);

  if (face.halfEdge === he) {
    face.halfEdge = prev;
  }
}

function subdivideEdge(he) {
  const {
    twin
  } = he;
  const vertex = new _geometry__WEBPACK_IMPORTED_MODULE_0__.Vertex((he.vertex.x + he.next.vertex.x) / 2, (he.vertex.y + he.next.vertex.y) / 2, (he.vertex.z + he.next.vertex.z) / 2, null);
  const edge = new _geometry__WEBPACK_IMPORTED_MODULE_0__.Edge(null);
  const newEdge = new _geometry__WEBPACK_IMPORTED_MODULE_0__.HalfEdge(he.next, vertex, edge, he.face);
  he.next = newEdge;

  if (twin) {
    twin.next = new _geometry__WEBPACK_IMPORTED_MODULE_0__.HalfEdge(twin.next, vertex, edge, he.face);
    he.twinWith(twin.next);
    twin.twinWith(newEdge);
  }

  return newEdge;
}

function divideTriIntoQuads(faces, face) {
  let ha = face.halfEdge;
  let hab = face.halfEdge.next;
  let hb = face.halfEdge.next.next;
  let hbc = face.halfEdge.next.next.next;
  let hc = face.halfEdge.next.next.next.next;
  let hca = face.halfEdge.next.next.next.next.next;
  const vertex = new _geometry__WEBPACK_IMPORTED_MODULE_0__.Vertex((ha.vertex.x + hb.vertex.x + hc.vertex.x) / 3, (ha.vertex.y + hb.vertex.y + hc.vertex.y) / 3, (ha.vertex.z + hb.vertex.z + hc.vertex.z) / 3, null);
  const fa = new _geometry__WEBPACK_IMPORTED_MODULE_0__.Face(null);
  const fb = new _geometry__WEBPACK_IMPORTED_MODULE_0__.Face(null);
  const fc = new _geometry__WEBPACK_IMPORTED_MODULE_0__.Face(null);
  const hvca = new _geometry__WEBPACK_IMPORTED_MODULE_0__.HalfEdge(hca, vertex, new _geometry__WEBPACK_IMPORTED_MODULE_0__.Edge(null), fa);
  const hvab = new _geometry__WEBPACK_IMPORTED_MODULE_0__.HalfEdge(hab, vertex, new _geometry__WEBPACK_IMPORTED_MODULE_0__.Edge(null), fb);
  const hvbc = new _geometry__WEBPACK_IMPORTED_MODULE_0__.HalfEdge(hbc, vertex, new _geometry__WEBPACK_IMPORTED_MODULE_0__.Edge(null), fc);
  const habv = new _geometry__WEBPACK_IMPORTED_MODULE_0__.HalfEdge(hvca, hab.vertex, hvca.edge, fa);
  const hbcv = new _geometry__WEBPACK_IMPORTED_MODULE_0__.HalfEdge(hvab, hbc.vertex, hvab.edge, fb);
  const hcav = new _geometry__WEBPACK_IMPORTED_MODULE_0__.HalfEdge(hvbc, hca.vertex, hvbc.edge, fc);
  hvab.twinWith(habv);
  hvbc.twinWith(hbcv);
  hvca.twinWith(hcav);
  hca.face = fa;
  hab.face = fb;
  hbc.face = fc;
  ha.next = habv;
  hb.next = hbcv;
  hc.next = hcav;
  resetFacesInLoop(ha, fa);
  resetFacesInLoop(hb, fb);
  resetFacesInLoop(hc, fc); //fa.halfEdge = fa.halfEdge.next.next
  //fb.halfEdge = fb.halfEdge.next.next.next

  const group = new _geometry__WEBPACK_IMPORTED_MODULE_0__.FaceGroup(3);
  fa.group = group;
  fb.group = group;
  fc.group = group;
  faces.push(fa, fb, fc);
}

function subdivideQuad(faces, face) {
  let ha = face.halfEdge;
  let hab = ha.next;
  let hb = hab.next;
  let hbc = hb.next;
  let hc = hbc.next;
  let hcd = hc.next;
  let hd = hcd.next;
  let hda = hd.next;
  const vertex = new _geometry__WEBPACK_IMPORTED_MODULE_0__.Vertex((ha.vertex.x + hb.vertex.x + hc.vertex.x + hd.vertex.x) / 4, (ha.vertex.y + hb.vertex.y + hc.vertex.y + hd.vertex.y) / 4, (ha.vertex.z + hb.vertex.z + hc.vertex.z + hd.vertex.z) / 4, null);
  const fa = new _geometry__WEBPACK_IMPORTED_MODULE_0__.Face(null);
  const fb = new _geometry__WEBPACK_IMPORTED_MODULE_0__.Face(null);
  const fc = new _geometry__WEBPACK_IMPORTED_MODULE_0__.Face(null);
  const fd = new _geometry__WEBPACK_IMPORTED_MODULE_0__.Face(null);
  const hvab = new _geometry__WEBPACK_IMPORTED_MODULE_0__.HalfEdge(hab, vertex, new _geometry__WEBPACK_IMPORTED_MODULE_0__.Edge(null), fb);
  const hvbc = new _geometry__WEBPACK_IMPORTED_MODULE_0__.HalfEdge(hbc, vertex, new _geometry__WEBPACK_IMPORTED_MODULE_0__.Edge(null), fc);
  const hvcd = new _geometry__WEBPACK_IMPORTED_MODULE_0__.HalfEdge(hcd, vertex, new _geometry__WEBPACK_IMPORTED_MODULE_0__.Edge(null), fd);
  const hvda = new _geometry__WEBPACK_IMPORTED_MODULE_0__.HalfEdge(hda, vertex, new _geometry__WEBPACK_IMPORTED_MODULE_0__.Edge(null), fa);
  const habv = new _geometry__WEBPACK_IMPORTED_MODULE_0__.HalfEdge(hvda, hab.vertex, hvcd.edge, fa);
  const hbcv = new _geometry__WEBPACK_IMPORTED_MODULE_0__.HalfEdge(hvab, hbc.vertex, hvab.edge, fb);
  const hcdv = new _geometry__WEBPACK_IMPORTED_MODULE_0__.HalfEdge(hvbc, hcd.vertex, hvbc.edge, fc);
  const hdav = new _geometry__WEBPACK_IMPORTED_MODULE_0__.HalfEdge(hvcd, hda.vertex, hvda.edge, fd);
  hvab.twinWith(habv);
  hvbc.twinWith(hbcv);
  hvcd.twinWith(hcdv);
  hvda.twinWith(hdav);
  ha.next = habv;
  hb.next = hbcv;
  hc.next = hcdv;
  hd.next = hdav;
  resetFacesInLoop(ha, fa);
  resetFacesInLoop(hb, fb);
  resetFacesInLoop(hc, fc);
  resetFacesInLoop(hd, fd);
  faces.push(fa, fb, fc, fd);
  const group = new _geometry__WEBPACK_IMPORTED_MODULE_0__.FaceGroup(4);
  fa.group = group;
  fb.group = group;
  fc.group = group;
  fd.group = group;
}

function divideIntoQuads(faces) {
  getEdges(faces).forEach(e => subdivideEdge(e.halfEdge));
  const newFaces = [];

  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    const {
      length
    } = face;

    if (length === 6) {
      divideTriIntoQuads(newFaces, face);
    } else if (length === 8) {
      subdivideQuad(newFaces, face);
    } else {
      throw new Error("Not tri or quad: " + length);
    }
  }

  return newFaces;
}

function validateFace(face) {
  const {
    halfEdge
  } = face;

  if (!halfEdge) {
    throw new Error("No half edge: " + face);
  }

  const set = new Set();
  let curr = halfEdge;

  do {
    if (set.has(curr)) {
      throw new Error("Duplicate on iteration: " + curr);
    }

    set.add(curr);
    const next = curr.next;

    if (!next) {
      throw new Error("Next not set: " + face);
    }

    curr = next;
  } while (curr !== halfEdge);
}

function setToAverage(v) {
  const {
    halfEdge: start
  } = v;

  if (!start) {
    return;
  }

  let x = 0;
  let y = 0;
  let z = 0;
  let count = 0;
  let curr = start;
  let twin;
  let max = 20;

  do {
    x += curr.next.vertex.x;
    y += curr.next.vertex.y;
    z += curr.next.vertex.z;
    count++;
    twin = curr.twin;

    if (twin) {
      curr = twin.next;
    }
  } while (twin && curr !== start && max-- > 0); // if (!twin)
  // {
  //     const prev = start.prev;
  //     let curr = prev;
  //     max = 10
  //     do
  //     {
  //         x += curr.next.vertex.x
  //         y += curr.next.vertex.y
  //         count++
  //
  //         twin = curr.twin;
  //         if (twin)
  //         {
  //             curr = twin.prev
  //         }
  //
  //     } while(twin && curr !== prev && max-- > 0)
  // }


  if (twin) {
    v.x = x / count;
    v.y = y / count;
    v.z = z / count;
  }
}

function relax(faces) {
  const set = new Set();

  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    let curr = face.halfEdge;

    do {
      set.add(curr.vertex);
      curr = curr.next;
    } while (curr !== face.halfEdge);
  }

  const verts = [...set];
  const relaxCount = 25;

  for (let i = 0; i < relaxCount; i++) {
    for (let j = 0; j < verts.length; j++) {
      const v = verts[j];
      setToAverage(v);
    }
  }

  console.log(faces.length, ", verts =", set.size);
}

function pDistance(x, y, x1, y1, x2, y2) {
  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;
  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq != 0) //in case of 0 length line
    param = dot / len_sq;
  var xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

function getMinimumDistanceToPoint(face, x0, y0) {
  let min = Infinity;
  let curr = face.halfEdge;

  do {
    const dist = pDistance(x0, y0, curr.vertex.x, curr.vertex.y, curr.next.vertex.x, curr.next.vertex.y);

    if (dist < min) {
      min = dist;
    }

    curr = curr.next;
  } while (curr !== face.halfEdge);

  return min;
}

function quickFix(faces) {
  // XXX: we still have odd double points and this removes them until I find out my
  const map = new Map();

  const key = vertex => Math.round(vertex.x) + ":" + Math.round(vertex.y);

  let count = 0;

  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    const first = face.halfEdge;
    let curr = first;

    do {
      const {
        vertex
      } = curr;
      const k = key(vertex);
      const existing = map.get(k);

      if (existing) {
        count++;
        curr.vertex = existing;
        curr.vertex.halfEdge = curr;
      } else {
        map.set(k, vertex);
      }

      curr = curr.next;
    } while (curr !== first);
  }

  console.log("Quick-fixed #" + count + " vertices");
}

function pixelatePositions(faces) {
  // XXX: we still have odd double points and this removes them until I find out my
  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    const first = face.halfEdge;
    let curr = first;

    do {
      const {
        vertex
      } = curr;
      vertex.x |= 0;
      vertex.y |= 0;
      vertex.z |= 0;
      curr = curr.next;
    } while (curr !== first);
  }
}

function getSetOfIds(faces) {
  const ids = new Set();

  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    ids.add(face.id);
  }

  return ids;
}

function validateFaces(faces) {
  const ids = getSetOfIds(faces);

  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    const first = face.halfEdge;
    let curr = first;

    do {
      const id = curr.face.id;

      if (!ids.has(id)) {
        console.warn("Coming from Face #" + face.id + ": Face id #" + id + " of node #" + curr.id + " is not in the faces array");
      }

      curr = curr.next;
    } while (curr !== first);
  }
}

function fixEdges(faces) {
  const ids = getSetOfIds(faces);
  let connectedCount = 0;
  let notConnectedCount = 0;

  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    const start = face.halfEdge;
    let curr = start;

    do {
      const {
        twin
      } = curr;

      if (twin) {
        if (curr.edge !== twin.edge) {
          console.log("Edge mismatch");
        }

        const {
          edge
        } = curr;

        if (edge.halfEdge !== curr && edge.halfEdge !== twin) {
          // fix edge pointer
          edge.halfEdge = curr;
          notConnectedCount++;
        } else {
          connectedCount++;
        }
      }

      curr = curr.next;
    } while (curr !== start);
  } //console.log({connectedCount, notConnectedCount})

} /////////////////////////////////////////


const TAU = Math.PI * 2;
const sin60 = Math.sin(TAU / 6);
const hFactor = Math.sqrt(3);
const directions = [new _geometry__WEBPACK_IMPORTED_MODULE_0__.Vertex(0, 0, null), new _geometry__WEBPACK_IMPORTED_MODULE_0__.Vertex(0, -1, null), new _geometry__WEBPACK_IMPORTED_MODULE_0__.Vertex(sin60, -0.5, 0, null), new _geometry__WEBPACK_IMPORTED_MODULE_0__.Vertex(sin60, 0.5, 0, null), new _geometry__WEBPACK_IMPORTED_MODULE_0__.Vertex(0, 1, null), new _geometry__WEBPACK_IMPORTED_MODULE_0__.Vertex(-sin60, 0.5, 0, null), new _geometry__WEBPACK_IMPORTED_MODULE_0__.Vertex(-sin60, -0.5, 0, null)];
const evenNeighbors = [[0, -1], [1, 0], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
const oddNeighbors = [[1, -1], [1, 0], [1, 1], [0, 1], [-1, 0], [0, -1]];
function createHexagon(q, r, faces, points, patch) {
  const start = faces.length;
  patch.setHexagon(q, r, start);
  const w = hFactor * patch.size;
  const hw = w * 0.5;
  const h = patch.size * 2;
  const offX = w * q + ((r & 1) !== 0 ? hw : 0);
  const offY = h * 0.75 * r;
  const verts = directions.map(d => new _geometry__WEBPACK_IMPORTED_MODULE_0__.Vertex(d.x * patch.size + offX, d.y * patch.size + offY, 0, null).round());
  const v3 = verts[0];
  let prevFace;
  let firstFace;
  const last = verts.length - 1;

  for (let i = 1; i < verts.length; i++) {
    const v = verts[i];
    const v2 = verts[i === last ? 1 : i + 1];
    const face = new _geometry__WEBPACK_IMPORTED_MODULE_0__.Face(null);

    if (i === 1) {
      firstFace = face;
    }

    const he0 = new _geometry__WEBPACK_IMPORTED_MODULE_0__.HalfEdge(null, v, null, face);
    const he1 = new _geometry__WEBPACK_IMPORTED_MODULE_0__.HalfEdge(null, v2, null, face);
    const he2 = new _geometry__WEBPACK_IMPORTED_MODULE_0__.HalfEdge(null, v3, null, face);
    he0.next = he1;
    he1.next = he2;
    he2.next = he0;
    he0.edge = new _geometry__WEBPACK_IMPORTED_MODULE_0__.Edge(he0);
    he1.edge = i === last ? firstFace.halfEdge.next.next.edge : new _geometry__WEBPACK_IMPORTED_MODULE_0__.Edge(he1);
    he2.edge = prevFace ? prevFace.halfEdge.next.edge : new _geometry__WEBPACK_IMPORTED_MODULE_0__.Edge(he2);
    face.halfEdge = he0;
    faces.push(face);

    if (prevFace) {
      prevFace.halfEdge.next.twinWith(face.halfEdge.next.next);
    }

    prevFace = face;
  }

  const face = faces[start];
  prevFace.halfEdge.next.twinWith(face.halfEdge.next.next);
  points.push(...verts);
  const neighbors = r & 1 ? oddNeighbors : evenNeighbors; // connect hexagon to preexisting hexagons

  for (let i = 0; i < neighbors.length; i++) {
    const [qOff, rOff] = neighbors[i];
    const faceIndex = patch.getHexagon(q + qOff, r + rOff);

    if (faceIndex !== undefined) {
      const he0 = faces[start + i].halfEdge;
      const he1 = faces[faceIndex + (i + 3) % 6].halfEdge;
      he1.twinWith(he0);
    }
  }
} /////////////////////////////////////////

function key(q, r) {
  return q + "/" + r;
}

const PATCH_SIZE = 24;
const hSize = PATCH_SIZE / 2;
class HexagonPatch {
  constructor(q, r) {
    let size = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 30;
    this.q = 0;
    this.r = 0;
    this.hexagons = new Map();
    this.q = q;
    this.r = r;
    this.size = size;
  }
  /**
   * Returns the index of the first face in the hexagon at the coordinates q/r or undefined if no such hexagon exists
   * 
   * @param {Number} q    q-position
   * @param {Number} r    r-position
   * 
   * @return {Number} faceIndex
   */


  getHexagon(q, r) {
    return this.hexagons.get(key(q, r));
  }
  /**
   * Sets the face index for the hexagon at the coordinates q/r
   *
   * @param {Number} q            q-position
   * @param {Number} r            r-position
   * @param {Number} faceIndex    face index
   */


  setHexagon(q, r, faceIndex) {
    this.hexagons.set(key(q, r), faceIndex);
  }

  build() {
    let faces = [];
    const verts = [];
    let hexCount = 0;

    for (let q = -hSize; q < hSize; q++) {
      for (let r = -hSize; r < hSize; r++) {
        createHexagon(this.q + q, this.r + r, faces, verts, this);
        hexCount++;
      }
    }

    console.log("Created #" + hexCount + " hexagons");
    const edges = [...findInsideEdges(faces)];
    (0,_shuffle__WEBPACK_IMPORTED_MODULE_2__["default"])(_env__WEBPACK_IMPORTED_MODULE_1__["default"].world.rnd, edges);
    const count = 0 | edges.length * (0.8 + _env__WEBPACK_IMPORTED_MODULE_1__["default"].world.rnd.next() * 0.15);

    for (let i = 0; i < count; i++) {
      const edge = edges[i];
      removeEdge(faces, edge);
    }

    faces = divideIntoQuads(faces);
    quickFix(faces);
    relax(faces);
    pixelatePositions(faces);
    fixEdges(faces); // faces.forEach(validateFace)
    // validateFaces(faces)

    return faces;
  }

}
HexagonPatch.SIZE = PATCH_SIZE;

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

/***/ "./src/geometry.js":
/*!*************************!*\
  !*** ./src/geometry.js ***!
  \*************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Edge": function() { return /* binding */ Edge; },
/* harmony export */   "Face": function() { return /* binding */ Face; },
/* harmony export */   "FaceGroup": function() { return /* binding */ FaceGroup; },
/* harmony export */   "HalfEdge": function() { return /* binding */ HalfEdge; },
/* harmony export */   "Vertex": function() { return /* binding */ Vertex; }
/* harmony export */ });
let vertexCounter = 1000;
class Vertex {
  /**
   * X coordinate
   * @type {number}
   */

  /**
   * Y coordinate
   * @type {number}
   */

  /**
   * Z coordinate
   * @type {number}
   */

  /**
   * Half-edge 
   * @type {null}
   */
  constructor(x, y, z, halfEdge) {
    this.x = void 0;
    this.y = void 0;
    this.z = void 0;
    this.halfEdge = null;
    this.id = 0;
    this.biome = -1;
    this.x = x;
    this.y = y;
    this.z = z;
    this.halfEdge = halfEdge;
    this.id = vertexCounter++;
  }

  round() {
    this.x |= 0;
    this.y |= 0;
    this.z |= 0;
    return this;
  }

  toString() {
    return "#" + this.id + ": " + this.x + "/" + this.y; // + "/" + this.z
  }

}
class Edge {
  /**
   * One of the two half edges of the edge.
   *
   * @type {HalfEdge}
   */
  constructor(halfEdge) {
    this.halfEdge = null;
    this.halfEdge = halfEdge;
  }

}
let faceCounter = 0;
let faceGroupCounter = 0;
class FaceGroup {
  /**
   * Unique group id
   *
   * @type {number}
   */

  /**
   * Number of faces in the group (3 or 4)
   *
   * @type {number}
   */
  constructor(size) {
    this.id = ++faceGroupCounter;
    this.size = 0;
    this.size = size;
  }

}
class Face {
  /**
   * First half edge of the face interior, part of a closed loop back to the fist edge.
   *
   * @type {HalfEdge}
   */
  //// TERRAIN DATA //////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Face group this tile belongs to
   *
   * @type {FaceGroup}
   */

  /**
   * Center point of this face which is the x/z centroid at height map height
   *
   * @type {Array.<Number>}
   */
  constructor(halfEdge) {
    this.halfEdge = null;
    this.group = null;
    this.aabb = null;
    this.center = null;
    this.halfEdge = halfEdge;
    this.id = faceCounter++;
  }

  get length() {
    const start = this.halfEdge;
    let curr = start;
    let count = 0;

    do {
      curr = curr.next;
      count++;
    } while (curr !== start);

    return count;
  }
  /**
   * Returns the face centroid
   * @return {number[]} x/y/z as array
   */


  get centroid() {
    let x = 0;
    let y = 0;
    let z = 0;
    let count = 0;
    const visited = new Set();
    const first = this.halfEdge;
    let curr = first;

    do {
      visited.add(curr);
      x += curr.vertex.x;
      y += curr.vertex.y;
      z += curr.vertex.z;
      curr = curr.next;
      count++;
    } while (!visited.has(curr));

    return [x / count, y / count, z / count];
  }

}
let counter = 0;
/**
 * Central class of the half edge data structure
 */

class HalfEdge {
  /**
   * Next halfEdge in the face
   * @type {HalfEdge}
   */

  /**
   * Twin halfEdge from another face
   * @type {HalfEdge}
   */

  /**
   * Vertex of this half edge
   * @type {Vertex}
   */

  /**
   * The edge the half edge belongs to
   * @type {Edge}
   */

  /**
   * The face the half edge belongs to
   * @type {Face}
   */
  constructor(next, vertex, edge, face) {
    this.next = null;
    this.twin = null;
    this.vertex = null;
    this.edge = null;
    this.face = null;
    this.next = next;
    this.twin = null;
    this.vertex = vertex;
    this.edge = edge;
    this.face = face;

    if (vertex && !vertex.halfEdge) {
      vertex.halfEdge = this;
    }

    if (edge && !edge.halfEdge) {
      edge.halfEdge = this;
    }

    if (face && !face.halfEdge) {
      face.halfEdge = this;
    }

    this.id = counter++;
  }

  twinWith(other) {
    if (true) {
      let {
        vertex: v0
      } = this;
      let {
        vertex: v1
      } = this.next;
      let {
        vertex: v2
      } = other;
      let {
        vertex: v3
      } = other.next;

      if (v0.x !== v3.x || v0.y !== v3.y || v1.x !== v2.x || v1.y !== v2.y) {
        throw new Error("Half edge coords not twinned " + this + ": " + v0 + ", " + v1 + ", " + v2 + ", " + v3);
      }
    }

    this.twin = other;
    other.twin = this;
    this.vertex = other.next.vertex;
    other.vertex = this.next.vertex;
    other.edge = this.edge || other.edge;
    other.edge.halfEdge = this;
  }

  get prev() {
    let curr = this;

    do {
      curr = curr.next;
    } while (curr.next !== this); //console.log("prev of ", this, "is", curr)


    return curr;
  }

}

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _style_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./style.css */ "./src/style.css");
/* harmony import */ var _HexagonPatch__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./HexagonPatch */ "./src/HexagonPatch.js");
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./env */ "./src/env.js");
/* harmony import */ var performance_now__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! performance-now */ "./node_modules/performance-now/lib/performance-now.js");
/* harmony import */ var performance_now__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(performance_now__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
/* harmony import */ var three_addons_postprocessing_EffectComposer_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! three/addons/postprocessing/EffectComposer.js */ "./node_modules/three/examples/jsm/postprocessing/EffectComposer.js");
/* harmony import */ var three_addons_postprocessing_RenderPass_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! three/addons/postprocessing/RenderPass.js */ "./node_modules/three/examples/jsm/postprocessing/RenderPass.js");
/* harmony import */ var three_addons_postprocessing_BokehPass_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! three/addons/postprocessing/BokehPass.js */ "./node_modules/three/examples/jsm/postprocessing/BokehPass.js");
/* harmony import */ var _World__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./World */ "./src/World.js");
/* harmony import */ var _terrain__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./terrain */ "./src/terrain.js");
/* harmony import */ var _loadModel__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./loadModel */ "./src/loadModel.js");
const WIREFRAME = false;











const TAU = Math.PI * 2;
let camera, scene, renderer;
let mouseX = 0,
    mouseY = 0,
    mouseFirst = true;
let mouseDeltaX = 0,
    mouseDeltaY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let width = window.innerWidth;
let height = window.innerHeight;
const postprocessing = {};
const cameraRadius = 50;
let cameraHeight = 1;
let cameraAngle = 0;
const adjustedZero = new three__WEBPACK_IMPORTED_MODULE_7__.Vector3(0, 0, 0);

function init() {
  //const seed = 1412
  const seed = -202558213; //const seed = (Math.random() * 4294967296) & 0xffffffff

  const world = new _World__WEBPACK_IMPORTED_MODULE_4__["default"](seed);
  _env__WEBPACK_IMPORTED_MODULE_2__["default"].init(world);
  adjustedZero.setY(world.calculateHeight(0, 0) + 5);
  const container = document.getElementById("root");
  camera = new three__WEBPACK_IMPORTED_MODULE_7__.PerspectiveCamera(50, width / height, 1, 30000);
  scene = new three__WEBPACK_IMPORTED_MODULE_7__.Scene();
  renderer = new three__WEBPACK_IMPORTED_MODULE_7__.WebGLRenderer(); // renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = PCFSoftShadowMap; // default THREE.PCFShadowMap

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);
  const ambientLight = new three__WEBPACK_IMPORTED_MODULE_7__.AmbientLight("#4572ff", 0.4);
  scene.add(ambientLight);
  const directionalLight = new three__WEBPACK_IMPORTED_MODULE_7__.DirectionalLight(0xffffff, 1); // directionalLight.castShadow = true
  //Set up shadow properties for the light
  // directionalLight.shadow.mapSize.width = 512; // default
  // directionalLight.shadow.mapSize.height = 512; // default
  // directionalLight.shadow.camera.near = 0.5; // default
  // directionalLight.shadow.camera.far = 500; // default

  directionalLight.position.set(0, adjustedZero.y + 20, 10);
  directionalLight.target.position.copy(adjustedZero);
  directionalLight.target.updateWorldMatrix();
  scene.add(directionalLight);
  const helper = new three__WEBPACK_IMPORTED_MODULE_7__.DirectionalLightHelper(directionalLight, 2);
  helper.position.copy(adjustedZero);
  scene.add(helper);
  const patch = new _HexagonPatch__WEBPACK_IMPORTED_MODULE_1__["default"](0, 0);
  const terrain = new _terrain__WEBPACK_IMPORTED_MODULE_5__.Terrain(scene, world, patch);
  const [geoms, lines] = terrain.createGeometries(msTiles);
  geoms.forEach(geom => {
    const geometry = geom.createThreeGeometry();

    if (geometry) {
      const material = new three__WEBPACK_IMPORTED_MODULE_7__.MeshStandardMaterial({
        roughness: 0.9,
        ...geom.terrain.material,
        wireframe: WIREFRAME //vertexColors: true

      });
      const mesh = new three__WEBPACK_IMPORTED_MODULE_7__.Mesh(geometry, material); // mesh.castShadow = true
      // mesh.receiveShadow = true

      scene.add(mesh);
    }
  });

  if (lines.length) {
    const material = new three__WEBPACK_IMPORTED_MODULE_7__.LineBasicMaterial({
      color: 0x7f000000,
      depthTest: false
    });
    const geometry = new three__WEBPACK_IMPORTED_MODULE_7__.BufferGeometry().setFromPoints(lines);
    const line = new three__WEBPACK_IMPORTED_MODULE_7__.LineSegments(geometry, material);
    scene.add(line);
  }

  const material = new three__WEBPACK_IMPORTED_MODULE_7__.MeshStandardMaterial({
    roughness: 0.9,
    color: "#c55"
  });
  const cubeGeo = new three__WEBPACK_IMPORTED_MODULE_7__.ConeBufferGeometry(5, 10);
  const cube = new three__WEBPACK_IMPORTED_MODULE_7__.Mesh(cubeGeo, material); // cube.castShadow = true
  // cube.receiveShadow = true

  cube.position.copy(adjustedZero);
  scene.add(cube); //
  // tiles.forEach( t => {
  //
  //     t.position.setY(10)
  //     scene.add(t)
  // })
  ///////////////////////////////////////////////

  initPostprocessing();
  renderer.autoClear = false;
  container.style.touchAction = 'none';
  container.addEventListener('pointermove', onPointerMove);
  window.addEventListener('resize', onWindowResize);
  postprocessing.bokeh.uniforms['focus'].value = 100;
  postprocessing.bokeh.uniforms['aperture'].value = 0.00005; //postprocessing.bokeh.uniforms[ 'maxblur' ].value = 0.015;

  postprocessing.bokeh.uniforms['maxblur'].value = 0.005;
}

function onPointerMove(event) {
  if (event.isPrimary === false) return;
  const prevX = mouseX;
  const prevY = mouseY;
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;

  if (!mouseFirst && !event.shiftKey) {
    mouseDeltaX += mouseX - prevX;
    mouseDeltaY += mouseY - prevY;
  }

  mouseFirst = false;
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  width = window.innerWidth;
  height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  postprocessing.composer.setSize(width, height);
}

function initPostprocessing() {
  const renderPass = new three_addons_postprocessing_RenderPass_js__WEBPACK_IMPORTED_MODULE_8__.RenderPass(scene, camera);
  const bokehPass = new three_addons_postprocessing_BokehPass_js__WEBPACK_IMPORTED_MODULE_9__.BokehPass(scene, camera, {
    focus: 1.0,
    aperture: 0.025,
    maxblur: 0.01
  });
  const composer = new three_addons_postprocessing_EffectComposer_js__WEBPACK_IMPORTED_MODULE_10__.EffectComposer(renderer);
  composer.addPass(renderPass);
  composer.addPass(bokehPass);
  postprocessing.composer = composer;
  postprocessing.bokeh = bokehPass;
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  const time = performance_now__WEBPACK_IMPORTED_MODULE_3___default()() * 0.005;
  const sensitivity = 0.00036;
  const sensitivityY = 0.05;
  cameraAngle += mouseDeltaX * sensitivity;
  const cameraX = Math.cos(cameraAngle) * cameraRadius;
  const cameraZ = Math.sin(cameraAngle) * cameraRadius;
  const camBase = _env__WEBPACK_IMPORTED_MODULE_2__["default"].world.calculateHeight(cameraX, cameraZ);
  const minY = camBase + 10;
  const maxY = camBase + 250;
  cameraHeight -= mouseDeltaY * sensitivityY;
  cameraHeight = cameraHeight < minY ? minY : cameraHeight > maxY ? maxY : cameraHeight;
  camera.position.set(cameraX, cameraHeight, cameraZ);
  camera.lookAt(adjustedZero);
  postprocessing.bokeh.uniforms.focus.value = camera.position.clone().sub(adjustedZero).length();
  postprocessing.composer.render(0.01);
  mouseDeltaX = Math.floor(mouseDeltaX * 90) / 100;
  mouseDeltaY = Math.floor(mouseDeltaY * 90) / 100;
}

let msTiles = {};
Promise.all([(0,_loadModel__WEBPACK_IMPORTED_MODULE_6__["default"])("media/marching-squares.glb")]).then(_ref => {
  let [gltf] = _ref;
  gltf.scene.children.forEach(k => {
    msTiles[k.name] = k;
  }); // console.log("TILE NAMES", Object.keys(msTiles))
  // console.log("TILES", msTiles)

  init();
  console.log("RTREE", _env__WEBPACK_IMPORTED_MODULE_2__["default"].world.rTree);
  animate();
  window.addEventListener("gamepadconnected", e => {
    document.getElementById("img-ghostpad").className = "invisible";
    document.getElementById("img-gamepad").className = "";
    const gp = navigator.getGamepads()[e.gamepad.index];
    console.log("Gamepad connected at index ".concat(gp.index, ": ").concat(gp.id, ". It has ").concat(gp.buttons.length, " buttons and ").concat(gp.axes.length, " axes."));
  });
  window.addEventListener("gamepaddisconnected", e => {
    document.getElementById("img-ghostpad").className = "";
    document.getElementById("img-gamepad").className = "invisible";
  });
});

/***/ }),

/***/ "./src/loadModel.js":
/*!**************************!*\
  !*** ./src/loadModel.js ***!
  \**************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ loadModel; }
/* harmony export */ });
/* harmony import */ var three_examples_jsm_loaders_GLTFLoader__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three/examples/jsm/loaders/GLTFLoader */ "./node_modules/three/examples/jsm/loaders/GLTFLoader.js");
// Instantiate a loader

const loader = new three_examples_jsm_loaders_GLTFLoader__WEBPACK_IMPORTED_MODULE_0__.GLTFLoader();
function loadModel(url) {
  let onProgress = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  return new Promise((resolve, reject) => {
    // Load a glTF resource
    loader.load( // resource URL
    url, // called when the resource is loaded
    resolve, // called while loading is progressing
    onProgress, // called when loading has errors
    reject);
  });
}

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
/******/ 			"main": 0
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors"], function() { return __webpack_require__("./src/index.js"); })
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	Demo = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=bundle-main-aff33bf7d6632627f8f1.js.map