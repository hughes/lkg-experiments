class Vector {
  constructor(x=0, y=0, z=0) {
    this.x = x;
    this.y = y;
    this.z = z;
    // Object.seal(this);
  }

  toString(precision=2) {
    const inflate = Math.pow(10, precision);
    const deflate = 1/inflate;
    const x = parseFloat(Math.round(this.x*inflate)*deflate).toFixed(precision);
    const y = parseFloat(Math.round(this.y*inflate)*deflate).toFixed(precision);
    const z = parseFloat(Math.round(this.z*inflate)*deflate).toFixed(precision);
    return x+','+y+','+z;
  }

  length() {
    const x = this.x, y = this.y, z = this.z;
    return Math.sqrt(x*x + y*y + z*z);
  }

  lengthSquared() {
    const x = this.x, y = this.y, z = this.z;
    return x*x + y*y + z*z;
  }

  distance(v) {
    const x = this.x, y = this.y, z = this.z;
    const dx = x - v.x;
    const dy = y - v.y;
    const dz = z - v.z;
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
  }

  distanceSquared(v) {
    const x = this.x, y = this.y, z = this.z;
    const dx = x - v.x;
    const dy = y - v.y;
    const dz = z - v.z;
    return dx*dx + dy*dy + dz*dz;
  }

  normalized() {
    const x = this.x, y = this.y, z = this.z;
    let length = this.length();
    if(length === 0) {
      length = 1;
      console.warn('Divided by zero');
    }
    const m = 1 / length;
    return new Vector(x*m, y*m, z*m);
  }

  add(v) {
    const x = this.x, y = this.y, z = this.z;
    return new Vector(x+v.x, y+v.y, z+v.z);
  }

  subtract(v) {
    const x = this.x, y = this.y, z = this.z;
    return new Vector(x-v.x, y-v.y, z-v.z);
  }

  entrywiseProduct(v) {
    const x = this.x, y = this.y, z = this.z;
    return new Vector(x*v.x, y*v.y, z*v.z);
  }

  scale(s) {
    const x = this.x, y = this.y, z = this.z;
    return new Vector(x*s, y*s, z*s);
  }

  copy() {
    const x = this.x, y = this.y, z = this.z;
    return new Vector(x, y, z);
  }
}

/**
 * Generate a random number between two values.
 * @param {number} lo exclusive lower bound
 * @param {number} hi exclusive upper bound
 */
function Random(lo, hi) {
  const scale = hi - lo;
  let value = 0;
  while(value === 0) {
    // Math.random is inclusive of zero
    value = Math.random();
  }
  return value * scale + lo;
}

/**
 * Generate a random point inside a unit circle/sphere.
 * See https://math.stackexchange.com/a/87238/12654
 */
function RandomInUnitRadius(dimensions=3) {
  if(dimensions < 2 || dimensions > 3) {
    throw('Not tested');
  }
  const d = Math.pow(Random(0, 1), 1/dimensions);
  const components = new Array(dimensions);
  let i = dimensions;
  while(i--) {
    components[i] = Random(-1, 1);
  }
  const scale = d / Math.sqrt(components.map(n => n*n).reduce((s, n) => s+n));
  return new Vector(...components.map(n => n*scale));
}

function RandomInUnitRadius_naive(dimensions=3) {
  if(dimensions < 2 || dimensions > 3) {
    throw('Not tested');
  }
  while(true) {
    const p = new Vector(
      Random(-1, 1),
      Random(-1, 1),
      dimensions === 2 ? 0 : Random(-1, 1),
    );
    if(p.lengthSquared() < 1) {
      return p;
    }
  }
}

export {
  Vector,
  Random,
  RandomInUnitRadius,
  RandomInUnitRadius_naive,
}