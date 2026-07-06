// Polyfills for serverless/Node.js environments
// pdfjs-dist v6 references these browser globals at module evaluation time
if (typeof globalThis.DOMMatrix === "undefined") {
  globalThis.DOMMatrix = class DOMMatrix {
    constructor() {
      this.a=1; this.b=0; this.c=0; this.d=1; this.e=0; this.f=0;
      this.m11=1; this.m12=0; this.m13=0; this.m14=0;
      this.m21=0; this.m22=1; this.m23=0; this.m24=0;
      this.m31=0; this.m32=0; this.m33=1; this.m34=0;
      this.m41=0; this.m42=0; this.m43=0; this.m44=1;
      this.is2D = true; this.isIdentity = true;
    }
    static fromMatrix() { return new DOMMatrix(); }
    static fromFloat32Array() { return new DOMMatrix(); }
    static fromFloat64Array() { return new DOMMatrix(); }
    multiply() { return new DOMMatrix(); }
    translate() { return new DOMMatrix(); }
    scale() { return new DOMMatrix(); }
    rotate() { return new DOMMatrix(); }
    rotateFromVector() { return new DOMMatrix(); }
    rotateAxisAngle() { return new DOMMatrix(); }
    skewX() { return new DOMMatrix(); }
    skewY() { return new DOMMatrix(); }
    inverse() { return new DOMMatrix(); }
    transformPoint(p) { return { x: p?.x || 0, y: p?.y || 0, z: p?.z || 0, w: p?.w || 1 }; }
    toFloat32Array() { return new Float32Array(16); }
    toFloat64Array() { return new Float64Array(16); }
    toJSON() { return {}; }
  };
}

if (typeof globalThis.ImageData === "undefined") {
  globalThis.ImageData = class ImageData {
    constructor(dataOrWidth, width, height) {
      if (typeof dataOrWidth === "number") {
        this.width = dataOrWidth;
        this.height = width || dataOrWidth;
        this.data = new Uint8ClampedArray(this.width * this.height * 4);
      } else {
        this.data = dataOrWidth;
        this.width = width;
        this.height = height || (dataOrWidth.length / (4 * width));
      }
    }
  };
}

if (typeof globalThis.Path2D === "undefined") {
  globalThis.Path2D = class Path2D {
    addPath() {} closePath() {} moveTo() {} lineTo() {}
    bezierCurveTo() {} quadraticCurveTo() {} arc() {} arcTo() {}
    ellipse() {} rect() {}
  };
}
